from datetime import date
from src.models import User, Caravan
from src.repositories import (
    UserRepository, CaravanRepository, ReservationRepository, 
    PaymentRepository, ReviewRepository, MessageRepository
)
from src.services import (
    ReservationService, PaymentService, ReviewService, MessageService
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

    # Create some initial data
    host = user_repo.add(User(id=0, name="Host User", contact="host@example.com", is_host=True))
    guest = user_repo.add(User(id=0, name="Guest User", contact="guest@example.com", is_host=False, balance=1000.0))
    
    caravan = caravan_repo.add(Caravan(id=0, host_id=host.id, name="Cozy Caravan", capacity=4, location="Mountain View"))

    print("--- Initial Data ---")
    print(f"Users: {user_repo.get_all()}")
    print(f"Caravans: {caravan_repo.get_all()}")
    print(f"Guest's starting balance: ${guest.balance}")
    print("-" * 20)

    # --- Use Case: Full reservation, completion, and review flow ---
    print("\n--- Use Case: Full reservation, completion, and review flow ---")
    try:
        start_date = date(2025, 11, 1)
        end_date = date(2025, 11, 5)
        price = 300.0
        
        reservation = reservation_service.create_reservation(
            user_id=guest.id,
            caravan_id=caravan.id,
            start_date=start_date,
            end_date=end_date,
            price=price,
        )
        print(f"Reservation created! Guest's new balance: ${guest.balance}")

        reservation_service.complete_reservation(reservation.id)
        print(f"Reservation completed.")

        review_service.create_review(
            reservation_id=reservation.id,
            rating=5,
            comment="Great trip, cozy caravan!",
            author_id=guest.id,
            subject_id=host.id
        )
        print("Review created successfully.")

    except (DuplicateReservationError, InsufficientFundsError, NotFoundError) as e:
        print(f"Error during reservation management demo: {e}")

    print("-" * 20)

    # --- Use Case: User-to-user messaging ---
    print("\n--- Use Case: User-to-user messaging ---")
    try:
        print(f"Guest is sending a message to the Host...")
        message_service.send_message(
            sender_id=guest.id,
            recipient_id=host.id,
            content="Hello! Looking forward to our trip."
        )
        print("Message sent successfully.")
        print(f"Messages: {message_repo.get_all()}")

    except NotFoundError as e:
        print(f"Error sending message: {e}")

    print("-" * 20)


if __name__ == "__main__":
    main()
