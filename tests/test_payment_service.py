import unittest
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import User, Payment
from src.services import PaymentService
from src.exceptions import InsufficientFundsError

class TestPaymentService(unittest.TestCase):

    def setUp(self):
        self.user_repo = MagicMock()
        self.payment_repo = MagicMock()
        self.payment_service = PaymentService(self.user_repo, self.payment_repo)

        self.user = User(id=1, name="Test User", contact="", is_host=False, balance=500.0)
        self.amount = 200.0
        self.reservation_id = 101

    def test_process_payment_success(self):
        # Arrange
        new_payment = Payment(id=1, reservation_id=self.reservation_id, amount=self.amount, payment_method="balance")
        self.payment_repo.add.return_value = new_payment

        # Act
        payment = self.payment_service.process_payment(
            user=self.user,
            reservation_id=self.reservation_id,
            amount=self.amount
        )

        # Assert
        self.assertEqual(self.user.balance, 300.0)
        self.user_repo.update.assert_called_once_with(self.user)
        self.payment_repo.add.assert_called_once()
        returned_payment_arg = self.payment_repo.add.call_args[0][0]
        self.assertEqual(returned_payment_arg.amount, self.amount)
        self.assertEqual(returned_payment_arg.reservation_id, self.reservation_id)
        self.assertEqual(payment, new_payment)

    def test_process_payment_insufficient_funds(self):
        # Arrange
        self.user.balance = 100.0

        # Act & Assert
        with self.assertRaises(InsufficientFundsError):
            self.payment_service.process_payment(
                user=self.user,
                reservation_id=self.reservation_id,
                amount=self.amount
            )
        
        self.user_repo.update.assert_not_called()
        self.payment_repo.add.assert_not_called()

if __name__ == '__main__':
    unittest.main()
