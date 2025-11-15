import unittest
from datetime import date

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Reservation
from src.repositories import ReservationRepository

class TestReservationRepository(unittest.TestCase):

    def setUp(self):
        self.repo = ReservationRepository()
        self.res1 = Reservation(id=0, user_id=1, caravan_id=1, start_date=date(2025, 1, 1), end_date=date(2025, 1, 5), price=100)
        self.res2 = Reservation(id=0, user_id=2, caravan_id=1, start_date=date(2025, 1, 10), end_date=date(2025, 1, 15), price=100)
        self.res3 = Reservation(id=0, user_id=3, caravan_id=2, start_date=date(2025, 1, 1), end_date=date(2025, 1, 5), price=100)

    def test_add_and_get_all(self):
        self.repo.add(self.res1)
        self.repo.add(self.res2)
        self.repo.add(self.res3)
        
        all_res = self.repo.get_all()
        self.assertEqual(len(all_res), 3)
        self.assertIn(self.res1, all_res)
        self.assertIn(self.res2, all_res)
        self.assertIn(self.res3, all_res)

    def test_get_by_id(self):
        added_res = self.repo.add(self.res1)
        
        found_res = self.repo.get_by_id(added_res.id)
        self.assertEqual(found_res, added_res)

        not_found_res = self.repo.get_by_id(999)
        self.assertIsNone(not_found_res)

    def test_update(self):
        added_res = self.repo.add(self.res1)
        added_res.status = "confirmed"
        self.repo.update(added_res)

        found_res = self.repo.get_by_id(added_res.id)
        self.assertEqual(found_res.status, "confirmed")

    def test_find_by_caravan_and_dates(self):
        self.repo.add(self.res1)
        self.repo.add(self.res2)
        self.repo.add(self.res3)

        # Overlapping
        overlapping = self.repo.find_by_caravan_and_dates(1, date(2025, 1, 3), date(2025, 1, 7))
        self.assertEqual(len(overlapping), 1)
        self.assertEqual(overlapping[0], self.res1)

        # Non-overlapping
        non_overlapping = self.repo.find_by_caravan_and_dates(1, date(2025, 1, 6), date(2025, 1, 9))
        self.assertEqual(len(non_overlapping), 0)

        # Different caravan
        other_caravan = self.repo.find_by_caravan_and_dates(2, date(2025, 1, 3), date(2025, 1, 7))
        self.assertEqual(len(other_caravan), 1)
        self.assertEqual(other_caravan[0], self.res3)

if __name__ == '__main__':
    unittest.main()
