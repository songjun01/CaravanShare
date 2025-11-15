import unittest

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Caravan
from src.repositories import CaravanRepository

class TestCaravanRepository(unittest.TestCase):

    def setUp(self):
        self.repo = CaravanRepository()
        # Googleplex
        self.caravan1 = Caravan(id=0, name="C1", host_id=1, capacity=1, location="", latitude=37.422, longitude=-122.084)
        # Apple Park
        self.caravan2 = Caravan(id=0, name="C2", host_id=1, capacity=1, location="", latitude=37.334, longitude=-122.009)
        # Someplace far
        self.caravan3 = Caravan(id=0, name="C3", host_id=1, capacity=1, location="", latitude=40.7128, longitude=-74.0060)
        
        self.repo.add(self.caravan1)
        self.repo.add(self.caravan2)
        self.repo.add(self.caravan3)

    def test_find_nearby(self):
        # Search near Googleplex
        search_lat, search_lon = 37.4, -122.1
        
        # 5km radius should only find caravan1
        nearby_5km = self.repo.find_nearby(search_lat, search_lon, 5)
        self.assertEqual(len(nearby_5km), 1)
        self.assertIn(self.caravan1, nearby_5km)

        # 20km radius should find caravan1 and caravan2
        nearby_20km = self.repo.find_nearby(search_lat, search_lon, 20)
        self.assertEqual(len(nearby_20km), 2)
        self.assertIn(self.caravan1, nearby_20km)
        self.assertIn(self.caravan2, nearby_20km)

        # 0km radius should find none
        nearby_0km = self.repo.find_nearby(search_lat, search_lon, 0)
        self.assertEqual(len(nearby_0km), 0)

if __name__ == '__main__':
    unittest.main()
