import unittest
from datetime import date
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import User, Caravan
from src.validators import ReservationValidator
from src.exceptions import NotFoundError, DuplicateReservationError

class TestReservationValidator(unittest.TestCase):

    def setUp(self):
        self.user_repo = MagicMock()
        self.caravan_repo = MagicMock()
        self.reservation_repo = MagicMock()

        self.validator = ReservationValidator(
            user_repo=self.user_repo,
            caravan_repo=self.caravan_repo,
            reservation_repo=self.reservation_repo,
        )

        self.user = User(id=1, name="Test User", contact="", is_host=False)
        self.caravan = Caravan(id=1, host_id=2, name="Test Caravan", capacity=4, location="")
        self.start_date = date(2025, 1, 1)
        self.end_date = date(2025, 1, 5)

    def test_validate_user_exists_success(self):
        self.user_repo.get_by_id.return_value = self.user
        result = self.validator.validate_user_exists(1)
        self.assertEqual(result, self.user)
        self.user_repo.get_by_id.assert_called_once_with(1)

    def test_validate_user_exists_not_found(self):
        self.user_repo.get_by_id.return_value = None
        with self.assertRaises(NotFoundError):
            self.validator.validate_user_exists(999)

    def test_validate_caravan_exists_success(self):
        self.caravan_repo.get_by_id.return_value = self.caravan
        result = self.validator.validate_caravan_exists(1)
        self.assertEqual(result, self.caravan)
        self.caravan_repo.get_by_id.assert_called_once_with(1)

    def test_validate_caravan_exists_not_found(self):
        self.caravan_repo.get_by_id.return_value = None
        with self.assertRaises(NotFoundError):
            self.validator.validate_caravan_exists(999)

    def test_validate_no_duplicate_reservations_success(self):
        self.reservation_repo.find_by_caravan_and_dates.return_value = []
        self.validator.validate_no_duplicate_reservations(1, self.start_date, self.end_date)
        self.reservation_repo.find_by_caravan_and_dates.assert_called_once_with(1, self.start_date, self.end_date)

    def test_validate_no_duplicate_reservations_found(self):
        self.reservation_repo.find_by_caravan_and_dates.return_value = [MagicMock()]
        with self.assertRaises(DuplicateReservationError):
            self.validator.validate_no_duplicate_reservations(1, self.start_date, self.end_date)

if __name__ == '__main__':
    unittest.main()
