import unittest

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.exceptions import NotFoundError

class TestExceptions(unittest.TestCase):

    def test_not_found_error_message(self):
        try:
            raise NotFoundError("User", 123)
        except NotFoundError as e:
            self.assertEqual(str(e), "User with id 123 not found.")

if __name__ == '__main__':
    unittest.main()
