from math import radians, cos, sin, asin, sqrt
from typing import List
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
