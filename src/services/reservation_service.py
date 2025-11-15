from datetime import date
from src.models import Reservation
from src.repositories import ReservationRepository
from src.validators import ReservationValidator
from .payment_service import PaymentService

class ReservationService:
    def __init__(
        self,
        reservation_repo: ReservationRepository,
        payment_service: PaymentService,
        validator: ReservationValidator,
    ):
        self._reservation_repo = reservation_repo
        self._payment_service = payment_service
        self._validator = validator

    def create_reservation(
        self, user_id: int, caravan_id: int, start_date: date, end_date: date, price: float
    ) -> Reservation:
        # Validate inputs
        user = self._validator.validate_user_exists(user_id)
        self._validator.validate_caravan_exists(caravan_id)
        self._validator.validate_no_duplicate_reservations(caravan_id, start_date, end_date)

        # Create reservation object first, to get an ID for the payment
        new_reservation = Reservation(
            id=0,  # The repository will assign an ID
            user_id=user_id,
            caravan_id=caravan_id,
            start_date=start_date,
            end_date=end_date,
            price=price,
            status="pending",
        )
        
        # Add reservation to repo to get a real ID
        created_reservation = self._reservation_repo.add(new_reservation)

        # Process payment
        self._payment_service.process_payment(
            user=user,
            reservation_id=created_reservation.id,
            amount=price
        )

        # Update reservation status
        created_reservation.status = "confirmed"
        self._reservation_repo.update(created_reservation)

        return created_reservation
