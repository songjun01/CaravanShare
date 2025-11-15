import unittest
from datetime import date
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from src.models import User, Caravan, Reservation
from src.services import ReservationService, PaymentService
from src.validators import ReservationValidator
from src.exceptions import DuplicateReservationError, InsufficientFundsError, NotFoundError

class TestReservationService(unittest.TestCase):

    def setUp(self):
        self.reservation_repo = MagicMock()
        self.payment_service = MagicMock(spec=PaymentService)
        self.validator = MagicMock(spec=ReservationValidator)

        self.reservation_service = ReservationService(
            reservation_repo=self.reservation_repo,
            payment_service=self.payment_service,
            validator=self.validator,
        )

        self.guest = User(id=1, name="Guest", contact="", is_host=False, balance=1000.0)
        self.caravan = Caravan(id=1, host_id=2, name="Test Caravan", capacity=4, location="Test Location")
        self.start_date = date(2025, 1, 1)
        self.end_date = date(2025, 1, 5)
        self.price = 500.0

    def test_create_reservation_success(self):
        # Arrange
        self.validator.validate_user_exists.return_value = self.guest
        
        pending_res = Reservation(
            id=1, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price, status="pending"
        )
        self.reservation_repo.add.return_value = pending_res

        # Act
        reservation = self.reservation_service.create_reservation(
            user_id=self.guest.id,
            caravan_id=self.caravan.id,
            start_date=self.start_date,
            end_date=self.end_date,
            price=self.price,
        )

        # Assert
        self.validator.validate_user_exists.assert_called_once_with(self.guest.id)
        self.validator.validate_caravan_exists.assert_called_once_with(self.caravan.id)
        self.validator.validate_no_duplicate_reservations.assert_called_once_with(
            self.caravan.id, self.start_date, self.end_date
        )
        self.reservation_repo.add.assert_called_once()
        self.payment_service.process_payment.assert_called_once_with(
            user=self.guest,
            reservation_id=pending_res.id,
            amount=self.price
        )
        self.reservation_repo.update.assert_called_once_with(pending_res)
        self.assertEqual(reservation.status, "confirmed")

    def test_create_reservation_duplicate(self):
        # Arrange
        self.validator.validate_no_duplicate_reservations.side_effect = DuplicateReservationError("test")

        # Act & Assert
        with self.assertRaises(DuplicateReservationError):
            self.reservation_service.create_reservation(
                user_id=self.guest.id,
                caravan_id=self.caravan.id,
                start_date=self.start_date,
                end_date=self.end_date,
                price=self.price,
            )
        self.payment_service.process_payment.assert_not_called()


    def test_create_reservation_insufficient_funds(self):
        # Arrange
        self.validator.validate_user_exists.return_value = self.guest
        pending_res = Reservation(
            id=1, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price, status="pending"
        )
        self.reservation_repo.add.return_value = pending_res

        self.payment_service.process_payment.side_effect = InsufficientFundsError("Test insufficient funds")

        # Act & Assert
        with self.assertRaises(InsufficientFundsError):
            self.reservation_service.create_reservation(
                user_id=self.guest.id,
                caravan_id=self.caravan.id,
                start_date=self.start_date,
                end_date=self.end_date,
                price=self.price,
            )

    def test_create_reservation_user_not_found(self):
        # Arrange
        self.validator.validate_user_exists.side_effect = NotFoundError("User", 999)

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.reservation_service.create_reservation(
                user_id=999,
                caravan_id=self.caravan.id,
                start_date=self.start_date,
                end_date=self.end_date,
                price=self.price,
            )
        self.payment_service.process_payment.assert_not_called()


if __name__ == '__main__':
    unittest.main()
