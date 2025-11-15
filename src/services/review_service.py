from typing import List
from src.models import Review, User
from src.repositories import ReviewRepository, UserRepository

class ReviewService:
    def __init__(
        self,
        review_repo: ReviewRepository,
        user_repo: UserRepository,
        min_reviews_for_badge: int = 5,
        min_average_rating_for_badge: float = 4.0,
    ):
        self._review_repo = review_repo
        self._user_repo = user_repo
        self._min_reviews_for_badge = min_reviews_for_badge
        self._min_average_rating_for_badge = min_average_rating_for_badge

    def is_trusted_reviewer(self, user_id: int) -> bool:
        """
        Determines if a user is a trusted reviewer based on review count and average rating.
        """
        user_reviews = self._review_repo.find_by_author_id(user_id)

        if len(user_reviews) < self._min_reviews_for_badge:
            return False

        total_rating = sum(review.rating for review in user_reviews)
        average_rating = total_rating / len(user_reviews)

        if average_rating < self._min_average_rating_for_badge:
            return False

        return True

    def assign_trusted_reviewer_badge(self, user_id: int) -> None:
        """
        Assigns a trusted reviewer badge to a user if they meet the criteria.
        This assumes the User model has a 'is_trusted_reviewer' attribute.
        """
        user = self._user_repo.get_by_id(user_id)
        if user:
            if self.is_trusted_reviewer(user_id):
                user.is_trusted_reviewer = True
                self._user_repo.update(user)
            else:
                user.is_trusted_reviewer = False
                self._user_repo.update(user)