import unittest

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import User
from src.repositories import UserRepository

class TestUserRepository(unittest.TestCase):

    def setUp(self):
        self.repo = UserRepository()
        self.user1 = User(id=0, name="Alice", contact="", is_host=False)
        self.user2 = User(id=0, name="Bob", contact="", is_host=False)

    def test_find_by_name(self):
        self.repo.add(self.user1)
        self.repo.add(self.user2)

        found_user = self.repo.find_by_name("Alice")
        self.assertIsNotNone(found_user)
        self.assertEqual(found_user.name, "Alice")

        not_found_user = self.repo.find_by_name("Charlie")
        self.assertIsNone(not_found_user)

if __name__ == '__main__':
    unittest.main()
