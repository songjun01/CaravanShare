import unittest
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Caravan
from src.services import MapService
from src.exceptions import NotFoundError

class TestMapService(unittest.TestCase):

    def setUp(self):
        self.caravan_repo = MagicMock()
        self.map_service = MapService(self.caravan_repo)
        self.caravan1 = Caravan(id=1, name="Caravan 1", host_id=1, capacity=4, location="Mountain View", latitude=37.4, longitude=-122.1)
        self.caravan2 = Caravan(id=2, name="Caravan 2", host_id=1, capacity=2, location="Beach City", latitude=34.0, longitude=-118.2)

    def test_find_nearby_caravans(self):
        # Arrange
        self.caravan_repo.find_nearby.return_value = [self.caravan1]

        # Act
        result = self.map_service.find_nearby_caravans(37.5, -122.0, 20)

        # Assert
        self.caravan_repo.find_nearby.assert_called_once_with(37.5, -122.0, 20)
        self.assertEqual(result, [self.caravan1])

    def test_get_caravan_location(self):
        # Arrange
        self.caravan_repo.get_by_id.return_value = self.caravan1

        # Act
        location = self.map_service.get_caravan_location(1)

        # Assert
        self.caravan_repo.get_by_id.assert_called_once_with(1)
        self.assertEqual(location, {"latitude": 37.4, "longitude": -122.1})

    def test_get_caravan_location_not_found(self):
        # Arrange
        self.caravan_repo.get_by_id.return_value = None

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.map_service.get_caravan_location(999)

    def test_get_amenities_near_caravan(self):
        # Arrange
        self.caravan_repo.get_by_id.return_value = self.caravan1

        # Act
        amenities = self.map_service.get_amenities_near_caravan(1)

        # Assert
        self.caravan_repo.get_by_id.assert_called_once_with(1)
        self.assertIn({"name": "Mountain Top Campsite", "type": "campsite"}, amenities)

if __name__ == '__main__':
    unittest.main()
