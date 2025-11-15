from datetime import date
from src.repositories import UserRepository, CaravanRepository, ReservationRepository
from src.exceptions import NotFoundError, DuplicateReservationError

class ReservationValidator:
    def __init__(
        self,
        user_repo: UserRepository,
        caravan_repo: CaravanRepository,
        reservation_repo: ReservationRepository,
    ):
        self._user_repo = user_repo
        self._caravan_repo = caravan_repo
        self._reservation_repo = reservation_repo

    def validate_user_exists(self, user_id: int):
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return user

    def validate_caravan_exists(self, caravan_id: int):
        caravan = self._caravan_repo.get_by_id(caravan_id)
        if not caravan:
            raise NotFoundError("Caravan", caravan_id)
        return caravan

    def validate_no_duplicate_reservations(self, caravan_id: int, start_date: date, end_date: date):
        existing_reservations = self._reservation_repo.find_by_caravan_and_dates(
            caravan_id, start_date, end_date
        )
        if existing_reservations:
            raise DuplicateReservationError("Caravan is already reserved for the given dates.")
