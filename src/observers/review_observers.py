from typing import Any
from .observer import Publisher, Subscriber
from src.models import Review, Reservation, User
from src.repositories import UserRepository, ReservationRepository

class ReviewPublisher(Publisher):
    pass

class GuestReviewNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository, reservation_repo: ReservationRepository):
        self._user_repo = user_repo
        self._reservation_repo = reservation_repo

    def update(self, publisher: Publisher, event: str, data: Any):
        if event == "review_requested":
            reservation: Reservation = data
            guest = self._user_repo.get_by_id(reservation.user_id)
            if guest:
                print(f"\n--- NOTIFICATION ---")
                print(f"To: {guest.contact}")
                print(f"Subject: How was your trip?")
                print(f"Please leave a review for your recent trip (Reservation ID: {reservation.id}).")
                print(f"--- END NOTIFICATION ---")

class HostReviewNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository, reservation_repo: ReservationRepository):
        self._user_repo = user_repo
        self._reservation_repo = reservation_repo

    def update(self, publisher: Publisher, event: str, data: Any):
        if event == "review_created":
            review: Review = data
            reservation = self._reservation_repo.get_by_id(review.reservation_id)
            if reservation:
                # Assuming the review subject is the caravan, so the host should be notified.
                host = self._user_repo.get_by_id(review.subject_id)
                if host and host.is_host:
                    print(f"\n--- NOTIFICATION ---")
                    print(f"To: {host.contact}")
                    print(f"Subject: You have a new review!")
                    print(f"A new {review.rating}-star review has been submitted for your caravan for reservation {reservation.id}.")
                    print(f"Comment: {review.comment}")
                    print(f"--- END NOTIFICATION ---")
