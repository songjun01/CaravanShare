from typing import Any, Optional
from .observer import Publisher, Subscriber
from src.models import Reservation, Caravan, User
from src.repositories import CaravanRepository, UserRepository

class ReservationPublisher(Publisher):
    pass

class HostNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository, caravan_repo: CaravanRepository):
        self._user_repo = user_repo
        self._caravan_repo = caravan_repo

    def _get_host(self, reservation: Reservation) -> Optional[User]:
        caravan = self._caravan_repo.get_by_id(reservation.caravan_id)
        if caravan:
            return self._user_repo.get_by_id(caravan.host_id)
        return None

    def update(self, publisher: Publisher, event: str, data: Any):
        reservation: Reservation = data
        host = self._get_host(reservation)
        if not host:
            return

        caravan = self._caravan_repo.get_by_id(reservation.caravan_id)
        
        messages = {
            "reservation_created": f"New Reservation for '{caravan.name}' (ID: {reservation.id}) from {reservation.start_date} to {reservation.end_date}.",
            "reservation_approved": f"Your reservation (ID: {reservation.id}) for '{caravan.name}' has been approved.",
            "reservation_rejected": f"Your reservation (ID: {reservation.id}) for '{caravan.name}' has been rejected.",
            "reservation_cancelled": f"The reservation (ID: {reservation.id}) for '{caravan.name}' has been cancelled.",
        }

        message = messages.get(event)
        if message:
            # In a real app, this would send an email, SMS, or push notification.
            print(f"\n--- NOTIFICATION ---")
            print(f"To: {host.contact}")
            print(f"Subject: Reservation Status Update")
            print(message)
            print(f"--- END NOTIFICATION ---")
