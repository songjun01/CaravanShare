import unittest
from unittest.mock import MagicMock
from datetime import datetime

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Payment, Settlement, User, Caravan
from src.services import SettlementService
from src.exceptions import NotFoundError

class TestSettlementService(unittest.TestCase):

    def setUp(self):
        self.payment_repo = MagicMock()
        self.settlement_repo = MagicMock()
        self.user_repo = MagicMock()
        self.settlement_service = SettlementService(
            self.payment_repo, self.settlement_repo, self.user_repo
        )

        self.host = User(id=1, name="Host", contact="", is_host=True, balance=0.0)
        self.guest = User(id=2, name="Guest", contact="", is_host=False, balance=1000.0)
        self.caravan = Caravan(id=1, host_id=self.host.id, name="Test Caravan", capacity=4, location="Test Location")

    def test_settle_for_host_success(self):
        # Arrange
        payment1 = Payment(id=1, reservation_id=1, amount=100.0, payment_method="balance", platform_fee=10.0, settled=False, status="paid")
        payment2 = Payment(id=2, reservation_id=2, amount=200.0, payment_method="balance", platform_fee=20.0, settled=False, status="paid")
        
        self.user_repo.get_by_id.return_value = self.host
        self.payment_repo.get_all.return_value = [payment1, payment2]
        
        expected_settlement_amount = (100.0 - 10.0) + (200.0 - 20.0) # 90 + 180 = 270
        
        new_settlement = Settlement(id=1, host_id=self.host.id, amount=expected_settlement_amount, payment_ids=[payment1.id, payment2.id])
        self.settlement_repo.add.return_value = new_settlement

        # Act
        settlement = self.settlement_service.settle_for_host(self.host.id)

        # Assert
        self.user_repo.get_by_id.assert_called_once_with(self.host.id)
        self.payment_repo.get_all.assert_called_once()
        self.settlement_repo.add.assert_called_once()
        self.payment_repo.update.assert_any_call(payment1)
        self.payment_repo.update.assert_any_call(payment2)
        self.assertTrue(payment1.settled)
        self.assertTrue(payment2.settled)
        self.assertEqual(settlement.amount, expected_settlement_amount)
        self.assertEqual(settlement.host_id, self.host.id)

    def test_settle_for_host_no_unsettled_payments(self):
        # Arrange
        self.user_repo.get_by_id.return_value = self.host
        self.payment_repo.get_all.return_value = []

        # Act & Assert
        with self.assertRaises(ValueError):
            self.settlement_service.settle_for_host(self.host.id)
        self.settlement_repo.add.assert_not_called()

    def test_settle_for_host_not_host(self):
        # Arrange
        self.user_repo.get_by_id.return_value = self.guest # Not a host

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.settlement_service.settle_for_host(self.guest.id)
        self.settlement_repo.add.assert_not_called()

if __name__ == '__main__':
    unittest.main()
