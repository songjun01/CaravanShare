from math import radians, cos, sin, asin, sqrt
from typing import List, Optional
from src.models.caravan import Caravan
from .base_repository import BaseRepository

class CaravanRepository(BaseRepository[Caravan]):
    def _haversine(self, lat1, lon1, lat2, lon2):
        """
        Calculate the great circle distance in kilometers between two points 
        on the earth (specified in decimal degrees).
        """
        # convert decimal degrees to radians 
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

        # haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371 # Radius of earth in kilometers.
        return c * r

    def find_nearby(self, latitude: float, longitude: float, radius: float) -> List[Caravan]:
        """
        Find caravans within a given radius (in kilometers).
        """
        nearby_caravans = []
        for caravan in self.get_all():
            distance = self._haversine(latitude, longitude, caravan.latitude, caravan.longitude)
            if distance <= radius:
                nearby_caravans.append(caravan)
        return nearby_caravans

    def search(
        self,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        required_amenities: Optional[List[str]] = None,
        min_rating: Optional[float] = None,
        sort_by_rating: bool = False,  # New parameter for sorting
    ) -> List[Caravan]:
        """
        Search caravans based on various filters.
        """
        filtered_caravans = self.get_all()

        if min_price is not None:
            filtered_caravans = [
                caravan for caravan in filtered_caravans if caravan.price_per_day >= min_price
            ]
        if max_price is not None:
            filtered_caravans = [
                caravan for caravan in filtered_caravans if caravan.price_per_day <= max_price
            ]
        if required_amenities is not None:
            filtered_caravans = [
                caravan for caravan in filtered_caravans 
                if all(amenity in caravan.amenities for amenity in required_amenities)
            ]
        if min_rating is not None:
            filtered_caravans = [
                caravan for caravan in filtered_caravans if caravan.average_rating >= min_rating
            ]
        
        if sort_by_rating:
            filtered_caravans.sort(key=lambda caravan: caravan.average_rating, reverse=True)
            
        return filtered_caravans

    def get_popular_caravans(self, limit: int = 5) -> List[Caravan]:
        """
        Get a list of popular caravans, sorted by average rating.
        """
        return self.search(sort_by_rating=True)[:limit]
