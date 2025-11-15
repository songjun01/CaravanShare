from typing import Any
from .observer import Publisher, Subscriber
from src.models import Payment, User
from src.repositories import UserRepository

class PaymentPublisher(Publisher):
    pass

class GuestNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    def get_guest(self, payment: Payment) -> User:
        # This is a simplification. In a real app, you'd get the user from the reservation.
        # For now, we find the first user who is not a host.
        for user in self._user_repo.get_all():
            if not user.is_host:
                return user
        return None


    def update(self, publisher: Publisher, event: str, data: Any):
        payment: Payment = data
        guest = self.get_guest(payment)
        if not guest:
            return

        messages = {
            "payment_completed": f"Your payment of ${payment.amount} for reservation {payment.reservation_id} was successful.",
            "payment_refunded": f"A refund of ${payment.amount} for reservation {payment.reservation_id} has been processed.",
        }

        message = messages.get(event)
        if message:
            # In a real app, this would send an email, SMS, or push notification.
            print(f"\n--- NOTIFICATION ---")
            print(f"To: {guest.contact}")
            print(f"Subject: Payment Status Update")
            print(message)
            print(f"--- END NOTIFICATION ---")
