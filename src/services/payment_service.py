from typing import Optional
from datetime import date
from src.models import User, Payment
from src.repositories import UserRepository, PaymentRepository, ReservationRepository
from src.exceptions import InsufficientFundsError, NotFoundError
from src.observers import PaymentPublisher
from src.strategies import FeeStrategy, RefundPolicy, FlexibleRefundPolicy

class PaymentService:
    def __init__(
        self, 
        user_repo: UserRepository, 
        payment_repo: PaymentRepository,
        reservation_repo: ReservationRepository,
        publisher: PaymentPublisher,
    ):
        self._user_repo = user_repo
        self._payment_repo = payment_repo
        self._reservation_repo = reservation_repo
        self._publisher = publisher

    def process_payment(
        self, 
        user: User, 
        reservation_id: int, 
        amount: float, 
        fee_strategy: FeeStrategy,
        payment_method: str = "balance"
    ) -> Payment:
        if user.balance < amount:
            raise InsufficientFundsError("User has insufficient funds.")
        
        user.balance -= amount
        self._user_repo.update(user)

        platform_fee = fee_strategy.calculate_fee(amount)

        new_payment = Payment(
            id=0, # The repository will assign an ID
            reservation_id=reservation_id,
            amount=amount,
            payment_method=payment_method,
            platform_fee=platform_fee,
        )
        
        created_payment = self._payment_repo.add(new_payment)
        self._publisher.notify("payment_completed", created_payment)
        return created_payment

    def refund_payment(self, reservation_id: int, refund_policy: Optional[RefundPolicy] = None) -> None:
        # In a real app, you'd have more complex logic to find the correct payment.
        # Here, we'll just find the first payment for the reservation.
        payment_to_refund = None
        for p in self._payment_repo.get_all():
            if p.reservation_id == reservation_id and p.status == "completed":
                payment_to_refund = p
                break
        
        if not payment_to_refund:
            raise NotFoundError("Completed payment for reservation", reservation_id)

        reservation = self._reservation_repo.get_by_id(reservation_id)
        if not reservation:
            raise NotFoundError("Reservation", reservation_id)
            
        user = self._user_repo.get_by_id(reservation.user_id)
        if not user:
            raise NotFoundError("User", reservation.user_id)

        if refund_policy is None:
            refund_policy = FlexibleRefundPolicy() # Default policy

        refund_amount = refund_policy.calculate_refund_amount(
            payment_to_refund.amount, 
            reservation.start_date, 
            date.today() # Assuming today is the cancellation date
        )

        user.balance += refund_amount
        self._user_repo.update(user)

        payment_to_refund.status = "refunded"
        self._payment_repo.update(payment_to_refund)

        self._publisher.notify("payment_refunded", payment_to_refund)
