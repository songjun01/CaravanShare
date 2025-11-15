from typing import List, Dict
from src.models import Caravan, Reservation
from src.repositories import CaravanRepository, ReservationRepository

class RecommendationService:
    def __init__(
        self,
        caravan_repo: CaravanRepository,
        reservation_repo: ReservationRepository,
    ):
        self._caravan_repo = caravan_repo
        self._reservation_repo = reservation_repo

    def get_personalized_recommendations(self, user_id: int, limit: int = 5) -> List[Caravan]:
        user_reservations = self._reservation_repo.find_by_user_id(user_id)

        if not user_reservations:
            # If no reservation history, recommend top-rated caravans
            return self._caravan_repo.search(sort_by_rating=True)[:limit]

        # Analyze user preferences from past reservations
        preferred_amenities = set()
        preferred_locations = set()
        total_price_per_day = 0.0
        num_caravans = 0

        for reservation in user_reservations:
            caravan = self._caravan_repo.get_by_id(reservation.caravan_id)
            if caravan:
                preferred_amenities.update(caravan.amenities)
                preferred_locations.add(caravan.location)
                total_price_per_day += caravan.price_per_day
                num_caravans += 1

        avg_price_per_day = total_price_per_day / num_caravans if num_caravans > 0 else 0

        # Search for caravans matching preferences
        recommendations = self._caravan_repo.search(
            min_price=avg_price_per_day * 0.8 if avg_price_per_day else None,
            max_price=avg_price_per_day * 1.2 if avg_price_per_day else None,
            required_amenities=list(preferred_amenities) if preferred_amenities else None,
            sort_by_rating=True,
        )
        
        # Further refine by location if there are preferred locations
        if preferred_locations:
            location_filtered_recommendations = [
                caravan for caravan in recommendations if caravan.location in preferred_locations
            ]
            if location_filtered_recommendations:
                recommendations = location_filtered_recommendations

        return recommendations[:limit]

    def get_popular_hosts(self, limit: int = 5) -> List[int]:
        """
        Get a list of popular host IDs, sorted by the average rating of their caravans.
        """
        all_caravans = self._caravan_repo.get_all()
        
        host_ratings: Dict[int, List[float]] = {}
        for caravan in all_caravans:
            if caravan.host_id not in host_ratings:
                host_ratings[caravan.host_id] = []
            host_ratings[caravan.host_id].append(caravan.average_rating)
        
        # Calculate average rating for each host
        average_host_ratings: Dict[int, float] = {
            host_id: sum(ratings) / len(ratings) 
            for host_id, ratings in host_ratings.items() if ratings
        }
        
        # Sort hosts by their average rating
        popular_hosts = sorted(average_host_ratings.items(), key=lambda item: item[1], reverse=True)
        
        return [host_id for host_id, _ in popular_hosts[:limit]]
