from datetime import date
from src.models import Reservation
from src.repositories import ReservationRepository, UserRepository, CaravanRepository
from src.exceptions import DuplicateReservationError, NotFoundError
from .payment_service import PaymentService

class ReservationService:
    def __init__(
        self,
        reservation_repo: ReservationRepository,
        user_repo: UserRepository,
        caravan_repo: CaravanRepository,
        payment_service: PaymentService,
    ):
        self._reservation_repo = reservation_repo
        self._user_repo = user_repo
        self._caravan_repo = caravan_repo
        self._payment_service = payment_service

    def create_reservation(
        self, user_id: int, caravan_id: int, start_date: date, end_date: date, price: float
    ) -> Reservation:
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)

        caravan = self._caravan_repo.get_by_id(caravan_id)
        if not caravan:
            raise NotFoundError("Caravan", caravan_id)

        # Check for duplicate reservations
        existing_reservations = self._reservation_repo.find_by_caravan_and_dates(
            caravan_id, start_date, end_date
        )
        if existing_reservations:
            raise DuplicateReservationError("Caravan is already reserved for the given dates.")

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
