from datetime import date
from src.models import User, Caravan
from src.repositories import UserRepository, CaravanRepository, ReservationRepository
from src.services import ReservationService
from src.exceptions import DuplicateReservationError, InsufficientFundsError, NotFoundError

def main():
    # Initialize repositories (in a real app, this would be handled by a dependency injection container)
    user_repo = UserRepository()
    caravan_repo = CaravanRepository()
    reservation_repo = ReservationRepository()

    # Initialize services
    reservation_service = ReservationService(reservation_repo, user_repo, caravan_repo)

    # Create some initial data
    host = user_repo.add(User(id=0, name="Host User", contact="host@example.com", is_host=True))
    guest = user_repo.add(User(id=0, name="Guest User", contact="guest@example.com", is_host=False, balance=1000.0))
    
    caravan = caravan_repo.add(Caravan(id=0, host_id=host.id, name="Cozy Caravan", capacity=4, location="Mountain View"))

    print("--- Initial Data ---")
    print(f"Users: {user_repo.get_all()}")
    print(f"Caravans: {caravan_repo.get_all()}")
    print("-" * 20)

    # --- Use Case: Create a reservation ---
    print("\n--- Use Case: Create a successful reservation ---")
    try:
        start_date = date(2025, 12, 20)
        end_date = date(2025, 12, 25)
        price = 500.0

        print(f"Attempting to create reservation for Caravan ID {caravan.id} from {start_date} to {end_date} for ${price}.")
        
        reservation = reservation_service.create_reservation(
            user_id=guest.id,
            caravan_id=caravan.id,
            start_date=start_date,
            end_date=end_date,
            price=price,
        )
        print(f"Reservation successful! Reservation details: {reservation}")
        print(f"Guest's new balance: ${guest.balance}")

    except (DuplicateReservationError, InsufficientFundsError, NotFoundError) as e:
        print(f"Error creating reservation: {e}")

    print("-" * 20)

    # --- Use Case: Attempt to create a duplicate reservation ---
    print("\n--- Use Case: Attempt to create a duplicate reservation ---")
    try:
        start_date = date(2025, 12, 22) # Overlapping date
        end_date = date(2025, 12, 26)
        price = 400.0

        print(f"Attempting to create a duplicate reservation for Caravan ID {caravan.id} from {start_date} to {end_date}.")

        reservation_service.create_reservation(
            user_id=guest.id,
            caravan_id=caravan.id,
            start_date=start_date,
            end_date=end_date,
            price=price,
        )
    except (DuplicateReservationError, InsufficientFundsError, NotFoundError) as e:
        print(f"Caught expected error: {e}")

    print("-" * 20)

    # --- Use Case: Insufficient funds ---
    print("\n--- Use Case: Attempt reservation with insufficient funds ---")
    try:
        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 5)
        price = guest.balance + 100.0 # More than the guest's balance

        print(f"Attempting to create a reservation with insufficient funds. Price: ${price}, Balance: ${guest.balance}")

        reservation_service.create_reservation(
            user_id=guest.id,
            caravan_id=caravan.id,
            start_date=start_date,
            end_date=end_date,
            price=price,
        )
    except (DuplicateReservationError, InsufficientFundsError, NotFoundError) as e:
        print(f"Caught expected error: {e}")


if __name__ == "__main__":
    main()
