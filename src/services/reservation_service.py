from datetime import date
from src.models import Reservation, User, Caravan
from src.repositories import ReservationRepository, UserRepository, CaravanRepository
from src.exceptions import DuplicateReservationError, InsufficientFundsError, NotFoundError

class ReservationService:
    def __init__(
        self,
        reservation_repo: ReservationRepository,
        user_repo: UserRepository,
        caravan_repo: CaravanRepository,
    ):
        self._reservation_repo = reservation_repo
        self._user_repo = user_repo
        self._caravan_repo = caravan_repo

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

        # Process payment
        if user.balance < price:
            raise InsufficientFundsError("User has insufficient funds.")
        
        user.balance -= price
        self._user_repo.update(user)

        # Create reservation
        new_reservation = Reservation(
            id=0,  # The repository will assign an ID
            user_id=user_id,
            caravan_id=caravan_id,
            start_date=start_date,
            end_date=end_date,
            price=price,
            status="pending",
        )

        return self._reservation_repo.add(new_reservation)
