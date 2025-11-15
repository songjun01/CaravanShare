from typing import List, Dict
from src.repositories import CaravanRepository
from src.models import Caravan
from src.exceptions import NotFoundError

class MapService:
    def __init__(self, caravan_repo: CaravanRepository):
        self._caravan_repo = caravan_repo

    def find_nearby_caravans(self, latitude: float, longitude: float, radius: float) -> List[Caravan]:
        return self._caravan_repo.find_nearby(latitude, longitude, radius)

    def get_caravan_location(self, caravan_id: int) -> Dict[str, float]:
        caravan = self._caravan_repo.get_by_id(caravan_id)
        if not caravan:
            raise NotFoundError("Caravan", caravan_id)
        return {"latitude": caravan.latitude, "longitude": caravan.longitude}

    def get_amenities_near_caravan(self, caravan_id: int) -> List[Dict[str, str]]:
        # This is a mock implementation. In a real app, this would query a real
        # amenities provider API (e.g., Google Places API).
        caravan = self._caravan_repo.get_by_id(caravan_id)
        if not caravan:
            raise NotFoundError("Caravan", caravan_id)
            
        # Mock amenities based on caravan's location string
        if "Mountain" in caravan.location:
            return [
                {"name": "Mountain Top Campsite", "type": "campsite"},
                {"name": "Eagle's Peak Gas Station", "type": "gas_station"},
            ]
        elif "Beach" in caravan.location:
            return [
                {"name": "Sandy Shores Campsite", "type": "campsite"},
                {"name": "Ocean View Fuel", "type": "gas_station"},
            ]
        return []
