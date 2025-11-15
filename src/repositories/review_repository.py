from typing import List
from src.models.review import Review
from .base_repository import BaseRepository

class ReviewRepository(BaseRepository[Review]):
    def find_by_author_id(self, author_id: int) -> List[Review]:
        """
        Find all reviews written by a specific user.
        """
        return [review for review in self.get_all() if review.author_id == author_id]
