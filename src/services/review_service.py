from src.models import Review
from src.repositories import ReviewRepository
from src.observers import ReviewPublisher

class ReviewService:
    def __init__(self, review_repo: ReviewRepository, publisher: ReviewPublisher):
        self._review_repo = review_repo
        self._publisher = publisher

    def create_review(
        self,
        reservation_id: int,
        rating: int,
        comment: str,
        author_id: int,
        subject_id: int,
    ) -> Review:
        new_review = Review(
            id=0, # Will be set by repository
            reservation_id=reservation_id,
            rating=rating,
            comment=comment,
            author_id=author_id,
            subject_id=subject_id,
        )
        
        created_review = self._review_repo.add(new_review)
        self._publisher.notify("review_created", created_review)
        return created_review
