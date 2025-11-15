from datetime import date
from src.models import User, Caravan
from src.repositories import (
    UserRepository, CaravanRepository, ReservationRepository, 
    PaymentRepository, ReviewRepository, MessageRepository, SettlementRepository
)
from src.services import (
    ReservationService, PaymentService, ReviewService, MessageService, MapService, SettlementService
)
from src.validators import ReservationValidator
from src.strategies import PercentageDiscount, PercentageFee, FlexibleRefundPolicy
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
    settlement_repo = SettlementRepository()

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
    settlement_service = SettlementService(payment_repo, settlement_repo, user_repo)

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

    # --- Use Case: Advanced Payment and Settlement ---
    print("\n--- Use Case: Advanced Payment and Settlement ---")
    try:
        print(f"Guest's balance before new reservation: ${guest.balance}")
        print(f"Host's balance before settlement: ${host.balance}")

        # Create a reservation with a platform fee
        reservation_price = 200.0
        platform_fee_strategy = PercentageFee(10) # 10% platform fee
        
        print(f"\nCreating a reservation for ${reservation_price} with a 10% platform fee...")
        reservation_for_settlement = reservation_service.create_reservation(
            user_id=guest.id,
            caravan_id=caravan1.id,
            start_date=date(2025, 12, 10),
            end_date=date(2025, 12, 12),
            price=reservation_price,
            fee_strategy=platform_fee_strategy,
        )
        print(f"Reservation created: {reservation_for_settlement}")
        print(f"Guest's balance after reservation: ${guest.balance}")
        
        # Simulate host settlement
        print(f"\nProcessing settlement for host {host.id}...")
        settlement = settlement_service.settle_for_host(host.id)
        print(f"Settlement processed: {settlement}")
        print(f"Host's balance after settlement: ${host.balance}")
        print(f"Payments after settlement: {payment_repo.get_all()}")
        print(f"Settlements: {settlement_repo.get_all()}")

        # Demonstrate refund with policy
        print(f"\nAttempting to refund reservation {reservation_for_settlement.id} with FlexibleRefundPolicy...")
        # To test different refund scenarios, change the date.today() in PaymentService
        # For this demo, let's assume it's within 3-7 days for a 50% refund.
        payment_service.refund_payment(reservation_for_settlement.id, refund_policy=FlexibleRefundPolicy())
        print(f"Guest's balance after refund: ${guest.balance}")
        print(f"Payments after refund: {payment_repo.get_all()}")


    except (DuplicateReservationError, InsufficientFundsError, NotFoundError, ValueError) as e:
        print(f"Error during advanced payment and settlement demo: {e}")

    print("-" * 20)


if __name__ == "__main__":
    main()
