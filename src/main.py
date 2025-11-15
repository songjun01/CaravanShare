from datetime import date
from src.models import User, Caravan
from src.repositories import (
    UserRepository, CaravanRepository, ReservationRepository, 
    PaymentRepository, ReviewRepository, MessageRepository
)
from src.services import (
    ReservationService, PaymentService, ReviewService, MessageService, MapService
)
from src.validators import ReservationValidator
from src.strategies import PercentageDiscount
from src.observers import (
    ReservationPublisher, HostNotifier, PaymentPublisher, 
    GuestNotifier, ReviewPublisher, GuestReviewNotifier, HostReviewNotifier,
    MessagePublisher, MessageNotifier
)
from src.factories import ReservationFactory
from src.exceptions import DuplicateReservationError, InsufficientFundsError, NotFoundError

def main():
    # Initialize repositories
    user_repo = UserRepository()
    caravan_repo = CaravanRepository()
    reservation_repo = ReservationRepository()
    payment_repo = PaymentRepository()
    review_repo = ReviewRepository()
    message_repo = MessageRepository()

    # Initialize validators
    validator = ReservationValidator(user_repo, caravan_repo, reservation_repo)

    # Initialize observer pattern components
    reservation_publisher = ReservationPublisher()
    host_reservation_notifier = HostNotifier(user_repo, caravan_repo)
    reservation_publisher.subscribe(host_reservation_notifier)

    payment_publisher = PaymentPublisher()
    guest_payment_notifier = GuestNotifier(user_repo)
    payment_publisher.subscribe(guest_payment_notifier)

    review_publisher = ReviewPublisher()
    guest_review_notifier = GuestReviewNotifier(user_repo, reservation_repo)
    host_review_notifier = HostReviewNotifier(user_repo, reservation_repo)
    review_publisher.subscribe(guest_review_notifier)
    review_publisher.subscribe(host_review_notifier)
    reservation_publisher.subscribe(guest_review_notifier)

    message_publisher = MessagePublisher()
    message_notifier = MessageNotifier(user_repo)
    message_publisher.subscribe(message_notifier)


    # Initialize factories
    factory = ReservationFactory()

    # Initialize services
    payment_service = PaymentService(user_repo, payment_repo, reservation_repo, payment_publisher)
    reservation_service = ReservationService(reservation_repo, payment_service, validator, reservation_publisher, factory)
    review_service = ReviewService(review_repo, review_publisher)
    message_service = MessageService(message_repo, user_repo, message_publisher)
    map_service = MapService(caravan_repo)

    # Create some initial data
    host = user_repo.add(User(id=0, name="Host User", contact="host@example.com", is_host=True))
    guest = user_repo.add(User(id=0, name="Guest User", contact="guest@example.com", is_host=False, balance=1000.0))
    
    # Add caravans with locations
    caravan1 = caravan_repo.add(Caravan(id=0, host_id=host.id, name="Mountain Retreat", capacity=4, location="Mountain View", latitude=37.422, longitude=-122.084))
    caravan2 = caravan_repo.add(Caravan(id=0, host_id=host.id, name="Beach Hopper", capacity=2, location="Beach City", latitude=34.0522, longitude=-118.2437))
    caravan3 = caravan_repo.add(Caravan(id=0, host_id=host.id, name="City Explorer", capacity=3, location="Downtown", latitude=40.7128, longitude=-74.0060))


    print("--- Initial Data ---")
    print(f"Users: {user_repo.get_all()}")
    print(f"Caravans: {caravan_repo.get_all()}")
    print("-" * 20)

    # --- Use Case: Location-based search ---
    print("\n--- Use Case: Location-based search ---")
    try:
        # Search near Googleplex
        search_lat, search_lon = 37.4, -122.1
        radius_km = 20
        print(f"Searching for caravans within {radius_km}km of ({search_lat}, {search_lon})...")
        
        nearby_caravans = map_service.find_nearby_caravans(search_lat, search_lon, radius_km)
        
        print(f"Found {len(nearby_caravans)} nearby caravan(s):")
        for c in nearby_caravans:
            print(f"  - {c.name} at ({c.latitude}, {c.longitude})")

        # Get amenities for the first nearby caravan
        if nearby_caravans:
            first_caravan = nearby_caravans[0]
            print(f"\nGetting amenities near '{first_caravan.name}'...")
            amenities = map_service.get_amenities_near_caravan(first_caravan.id)
            print(f"Found {len(amenities)} amenities:")
            for a in amenities:
                print(f"  - {a['name']} ({a['type']})")

    except NotFoundError as e:
        print(f"Error during location search: {e}")

    print("-" * 20)


if __name__ == "__main__":
    main()
