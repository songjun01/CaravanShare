from typing import Any
from .observer import Publisher, Subscriber
from src.models import Reservation, Caravan, User
from src.repositories import CaravanRepository, UserRepository

class ReservationPublisher(Publisher):
    pass

class HostNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository, caravan_repo: CaravanRepository):
        self._user_repo = user_repo
        self._caravan_repo = caravan_repo

    def update(self, publisher: Publisher, event: str, data: Any):
        if event == "reservation_created":
            reservation: Reservation = data
            caravan: Caravan = self._caravan_repo.get_by_id(reservation.caravan_id)
            if caravan:
                host: User = self._user_repo.get_by_id(caravan.host_id)
                if host:
                    # In a real app, this would send an email, SMS, or push notification.
                    print(f"--- NOTIFICATION ---")
                    print(f"To: {host.contact}")
                    print(f"Subject: New Reservation for '{caravan.name}'")
                    print(f"A new reservation (ID: {reservation.id}) has been made for your caravan from {reservation.start_date} to {reservation.end_date}.")
                    print(f"--- END NOTIFICATION ---")
