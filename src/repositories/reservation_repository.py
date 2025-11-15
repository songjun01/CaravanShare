from datetime import date
from typing import List, Dict, Optional
from src.models.reservation import Reservation

class ReservationRepository:
    def __init__(self):
        # {caravan_id: {reservation_id: reservation}}
        self._data: Dict[int, Dict[int, Reservation]] = {}
        self._next_id = 1

    def get_by_id(self, reservation_id: int) -> Optional[Reservation]:
        for caravan_reservations in self._data.values():
            if reservation_id in caravan_reservations:
                return caravan_reservations[reservation_id]
        return None

    def get_all(self) -> List[Reservation]:
        all_reservations = []
        for caravan_reservations in self._data.values():
            all_reservations.extend(caravan_reservations.values())
        return all_reservations

    def add(self, reservation: Reservation) -> Reservation:
        reservation.id = self._next_id
        
        if reservation.caravan_id not in self._data:
            self._data[reservation.caravan_id] = {}
            
        self._data[reservation.caravan_id][reservation.id] = reservation
        self._next_id += 1
        return reservation

    def update(self, reservation: Reservation) -> None:
        if reservation.caravan_id in self._data and reservation.id in self._data[reservation.caravan_id]:
            self._data[reservation.caravan_id][reservation.id] = reservation

    def find_by_caravan_and_dates(self, caravan_id: int, start_date: date, end_date: date) -> List[Reservation]:
        reservations = []
        caravan_reservations = self._data.get(caravan_id, {})
        for reservation in caravan_reservations.values():
            # Check for overlapping dates
            if (start_date <= reservation.end_date) and (end_date >= reservation.start_date):
                reservations.append(reservation)
        return reservations
