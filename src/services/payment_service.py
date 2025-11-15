from src.models import User, Payment
from src.repositories import UserRepository, PaymentRepository
from src.exceptions import InsufficientFundsError

class PaymentService:
    def __init__(self, user_repo: UserRepository, payment_repo: PaymentRepository):
        self._user_repo = user_repo
        self._payment_repo = payment_repo

    def process_payment(self, user: User, reservation_id: int, amount: float, payment_method: str = "balance") -> Payment:
        if user.balance < amount:
            raise InsufficientFundsError("User has insufficient funds.")
        
        user.balance -= amount
        self._user_repo.update(user)

        new_payment = Payment(
            id=0, # The repository will assign an ID
            reservation_id=reservation_id,
            amount=amount,
            payment_method=payment_method,
        )

        return self._payment_repo.add(new_payment)
