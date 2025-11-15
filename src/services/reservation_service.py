from datetime import date
from typing import Optional
from src.models import Reservation
from src.repositories import ReservationRepository
from src.validators import ReservationValidator
from src.strategies import DiscountStrategy, NoDiscount
from src.observers import ReservationPublisher
from src.factories import ReservationFactory
from .payment_service import PaymentService

class ReservationService:
    def __init__(
        self,
        reservation_repo: ReservationRepository,
        payment_service: PaymentService,
        validator: ReservationValidator,
        publisher: ReservationPublisher,
        factory: ReservationFactory,
    ):
        self._reservation_repo = reservation_repo
        self._payment_service = payment_service
        self._validator = validator
        self._publisher = publisher
        self._factory = factory

    def create_reservation(
        self, user_id: int, caravan_id: int, start_date: date, end_date: date, price: float,
        discount_strategy: Optional[DiscountStrategy] = None
    ) -> Reservation:
        # Validate inputs
        user = self._validator.validate_user_exists(user_id)
        self._validator.validate_caravan_exists(caravan_id)
        self._validator.validate_no_duplicate_reservations(caravan_id, start_date, end_date)

        if discount_strategy is None:
            discount_strategy = NoDiscount()

        discount = discount_strategy.calculate_discount(price)
        final_price = price - discount

        # Create reservation object using the factory
        new_reservation = self._factory.create_reservation(
            user_id=user_id,
            caravan_id=caravan_id,
            start_date=start_date,
            end_date=end_date,
            price=final_price,
        )
        
        # Add reservation to repo to get a real ID
        created_reservation = self._reservation_repo.add(new_reservation)

        # Process payment
        self._payment_service.process_payment(
            user=user,
            reservation_id=created_reservation.id,
            amount=final_price
        )

        # Update reservation status
        created_reservation.status = "confirmed"
        self._reservation_repo.update(created_reservation)

        # Notify observers
        self._publisher.notify("reservation_created", created_reservation)

        return created_reservation
