from datetime import date
from typing import List
from src.models.reservation import Reservation
from .base_repository import BaseRepository

class ReservationRepository(BaseRepository[Reservation]):
    def find_by_caravan_and_dates(self, caravan_id: int, start_date: date, end_date: date) -> List[Reservation]:
        reservations = []
        for r in self.get_all():
            if r.caravan_id == caravan_id:
                # Check for overlapping dates
                if (start_date <= r.end_date) and (end_date >= r.start_date):
                    reservations.append(r)
        return reservations
