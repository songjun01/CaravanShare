from datetime import date
from src.models import Reservation

class ReservationFactory:
    @staticmethod
    def create_reservation(
        user_id: int, caravan_id: int, start_date: date, end_date: date, price: float
    ) -> Reservation:
        """
        Creates a new Reservation object with a pending status.
        The ID is set to 0 as a placeholder, to be assigned by the repository.
        """
        return Reservation(
            id=0,
            user_id=user_id,
            caravan_id=caravan_id,
            start_date=start_date,
            end_date=end_date,
            price=price,
            status="pending",
        )
