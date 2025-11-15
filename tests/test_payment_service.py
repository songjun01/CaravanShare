import unittest
from unittest.mock import MagicMock
from datetime import date

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import User, Payment, Reservation
from src.services import PaymentService
from src.observers import PaymentPublisher
from src.strategies import FeeStrategy, RefundPolicy, FlexibleRefundPolicy
from src.exceptions import InsufficientFundsError, NotFoundError

class TestPaymentService(unittest.TestCase):

    def setUp(self):
        self.user_repo = MagicMock()
        self.payment_repo = MagicMock()
        self.reservation_repo = MagicMock()
        self.publisher = MagicMock(spec=PaymentPublisher)
        self.payment_service = PaymentService(
            self.user_repo, self.payment_repo, self.reservation_repo, self.publisher
        )

        self.user = User(id=1, name="Test User", contact="", is_host=False, balance=500.0)
        self.amount = 200.0
        self.reservation_id = 101
        self.fee_strategy = MagicMock(spec=FeeStrategy)
        self.fee_strategy.calculate_fee.return_value = 20.0 # 10% fee

    def test_process_payment_success(self):
        # Arrange
        new_payment = Payment(
            id=1, reservation_id=self.reservation_id, amount=self.amount, 
            payment_method="balance", platform_fee=self.fee_strategy.calculate_fee.return_value
        )
        self.payment_repo.add.return_value = new_payment

        # Act
        payment = self.payment_service.process_payment(
            user=self.user,
            reservation_id=self.reservation_id,
            amount=self.amount,
            fee_strategy=self.fee_strategy
        )

        # Assert
        self.assertEqual(self.user.balance, 300.0)
        self.user_repo.update.assert_called_once_with(self.user)
        self.fee_strategy.calculate_fee.assert_called_once_with(self.amount)
        self.payment_repo.add.assert_called_once()
        self.publisher.notify.assert_called_once_with("payment_completed", new_payment)
        self.assertEqual(payment, new_payment)

    def test_process_payment_insufficient_funds(self):
        # Arrange
        self.user.balance = 100.0

        # Act & Assert
        with self.assertRaises(InsufficientFundsError):
            self.payment_service.process_payment(
                user=self.user,
                reservation_id=self.reservation_id,
                amount=self.amount,
                fee_strategy=self.fee_strategy
            )
        
        self.user_repo.update.assert_not_called()
        self.payment_repo.add.assert_not_called()
        self.publisher.notify.assert_not_called()

    def test_refund_payment_full_refund(self):
        # Arrange
        payment_to_refund = Payment(id=1, reservation_id=self.reservation_id, amount=self.amount, payment_method="balance", status="completed")
        reservation = Reservation(id=self.reservation_id, user_id=self.user.id, caravan_id=1, start_date=date.today(), end_date=date.today(), price=self.amount)
        
        self.payment_repo.get_all.return_value = [payment_to_refund]
        self.reservation_repo.get_by_id.return_value = reservation
        self.user_repo.get_by_id.return_value = self.user
        initial_balance = self.user.balance

        refund_policy = MagicMock(spec=RefundPolicy)
        refund_policy.calculate_refund_amount.return_value = self.amount # Full refund

        # Act
        self.payment_service.refund_payment(self.reservation_id, refund_policy)

        # Assert
        self.assertEqual(self.user.balance, initial_balance + self.amount)
        self.user_repo.update.assert_called_once_with(self.user)
        self.assertEqual(payment_to_refund.status, "refunded")
        self.payment_repo.update.assert_called_once_with(payment_to_refund)
        self.publisher.notify.assert_called_once_with("payment_refunded", payment_to_refund)
        refund_policy.calculate_refund_amount.assert_called_once()

    def test_refund_payment_not_found(self):
        # Arrange
        self.payment_repo.get_all.return_value = []

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.payment_service.refund_payment(self.reservation_id)
        self.publisher.notify.assert_not_called()


if __name__ == '__main__':
    unittest.main()
