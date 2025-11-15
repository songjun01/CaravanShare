import unittest
from datetime import date
from unittest.mock import MagicMock, call

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from src.models import User, Caravan, Reservation
from src.services import ReservationService, PaymentService
from src.validators import ReservationValidator
from src.strategies import PercentageDiscount
from src.observers import ReservationPublisher
from src.factories import ReservationFactory
from src.exceptions import DuplicateReservationError, InsufficientFundsError, NotFoundError

class TestReservationService(unittest.TestCase):

    def setUp(self):
        self.reservation_repo = MagicMock()
        self.payment_service = MagicMock(spec=PaymentService)
        self.validator = MagicMock(spec=ReservationValidator)
        self.publisher = MagicMock(spec=ReservationPublisher)
        self.factory = MagicMock(spec=ReservationFactory)

        self.reservation_service = ReservationService(
            reservation_repo=self.reservation_repo,
            payment_service=self.payment_service,
            validator=self.validator,
            publisher=self.publisher,
            factory=self.factory,
        )

        self.guest = User(id=1, name="Guest", contact="", is_host=False, balance=1000.0)
        self.caravan = Caravan(id=1, host_id=2, name="Test Caravan", capacity=4, location="Test Location")
        self.start_date = date(2025, 1, 1)
        self.end_date = date(2025, 1, 5)
        self.price = 500.0

    def test_create_reservation_success_no_discount(self):
        # Arrange
        self.validator.validate_user_exists.return_value = self.guest
        
        created_res = Reservation(
            id=0, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price, status="pending"
        )
        self.factory.create_reservation.return_value = created_res
        
        added_res = Reservation(
            id=1, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price, status="pending"
        )
        self.reservation_repo.add.return_value = added_res

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
        self.factory.create_reservation.assert_called_once_with(
            user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price
        )
        self.reservation_repo.add.assert_called_once_with(created_res)
        self.payment_service.process_payment.assert_called_once_with(
            user=self.guest,
            reservation_id=added_res.id,
            amount=self.price
        )
        self.reservation_repo.update.assert_called_once_with(added_res)
        self.publisher.notify.assert_called_once_with("reservation_created", added_res)
        self.assertEqual(reservation.status, "confirmed")
        self.assertEqual(reservation.price, self.price)

    def test_create_reservation_with_discount(self):
        # Arrange
        self.validator.validate_user_exists.return_value = self.guest
        discount_strategy = PercentageDiscount(20) # 20% discount
        discounted_price = self.price * 0.8
        
        created_res = Reservation(
            id=0, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=discounted_price, status="pending"
        )
        self.factory.create_reservation.return_value = created_res

        added_res = Reservation(
            id=1, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=discounted_price, status="pending"
        )
        self.reservation_repo.add.return_value = added_res

        # Act
        reservation = self.reservation_service.create_reservation(
            user_id=self.guest.id,
            caravan_id=self.caravan.id,
            start_date=self.start_date,
            end_date=self.end_date,
            price=self.price,
            discount_strategy=discount_strategy
        )

        # Assert
        self.factory.create_reservation.assert_called_once_with(
            user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=discounted_price
        )
        self.reservation_repo.add.assert_called_once_with(created_res)
        self.payment_service.process_payment.assert_called_once_with(
            user=self.guest,
            reservation_id=added_res.id,
            amount=discounted_price
        )
        self.publisher.notify.assert_called_once_with("reservation_created", added_res)
        self.assertEqual(reservation.price, discounted_price)


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
        self.factory.create_reservation.assert_not_called()
        self.payment_service.process_payment.assert_not_called()
        self.publisher.notify.assert_not_called()


    def test_create_reservation_insufficient_funds(self):
        # Arrange
        self.validator.validate_user_exists.return_value = self.guest
        created_res = Reservation(
            id=0, user_id=self.guest.id, caravan_id=self.caravan.id,
            start_date=self.start_date, end_date=self.end_date,
            price=self.price, status="pending"
        )
        self.factory.create_reservation.return_value = created_res

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
        self.publisher.notify.assert_not_called()


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
        self.factory.create_reservation.assert_not_called()
        self.payment_service.process_payment.assert_not_called()
        self.publisher.notify.assert_not_called()


if __name__ == '__main__':
    unittest.main()
