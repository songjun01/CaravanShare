import unittest
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Review
from src.services import ReviewService
from src.observers import ReviewPublisher

class TestReviewService(unittest.TestCase):

    def setUp(self):
        self.review_repo = MagicMock()
        self.publisher = MagicMock(spec=ReviewPublisher)
        self.review_service = ReviewService(self.review_repo, self.publisher)

    def test_create_review(self):
        # Arrange
        new_review = Review(
            id=1, reservation_id=1, rating=5, comment="Great!", author_id=1, subject_id=2
        )
        self.review_repo.add.return_value = new_review

        # Act
        review = self.review_service.create_review(
            reservation_id=1, rating=5, comment="Great!", author_id=1, subject_id=2
        )

        # Assert
        self.review_repo.add.assert_called_once()
        self.publisher.notify.assert_called_once_with("review_created", new_review)
        self.assertEqual(review, new_review)

if __name__ == '__main__':
    unittest.main()
