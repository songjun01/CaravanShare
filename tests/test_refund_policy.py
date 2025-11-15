import unittest
from datetime import date, timedelta

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.strategies import FlexibleRefundPolicy

class TestRefundPolicy(unittest.TestCase):

    def setUp(self):
        self.policy = FlexibleRefundPolicy()
        self.original_amount = 100.0

    def test_full_refund(self):
        # Cancellation 7 days or more before reservation
        reservation_start_date = date.today() + timedelta(days=7)
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, self.original_amount)

        reservation_start_date = date.today() + timedelta(days=10)
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, self.original_amount)

    def test_partial_refund(self):
        # Cancellation between 3 and 6 days before reservation
        reservation_start_date = date.today() + timedelta(days=6)
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, self.original_amount * 0.5)

        reservation_start_date = date.today() + timedelta(days=3)
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, self.original_amount * 0.5)

    def test_no_refund(self):
        # Cancellation less than 3 days before reservation
        reservation_start_date = date.today() + timedelta(days=2)
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, 0.0)

        reservation_start_date = date.today()
        cancellation_date = date.today()
        refund_amount = self.policy.calculate_refund_amount(self.original_amount, reservation_start_date, cancellation_date)
        self.assertEqual(refund_amount, 0.0)

if __name__ == '__main__':
    unittest.main()
