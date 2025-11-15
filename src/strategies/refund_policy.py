from abc import ABC, abstractmethod
from datetime import date, timedelta

class RefundPolicy(ABC):
    @abstractmethod
    def calculate_refund_amount(self, original_amount: float, reservation_start_date: date, cancellation_date: date) -> float:
        pass

class FlexibleRefundPolicy(RefundPolicy):
    def calculate_refund_amount(self, original_amount: float, reservation_start_date: date, cancellation_date: date) -> float:
        days_until_reservation = (reservation_start_date - cancellation_date).days
        
        if days_until_reservation >= 7:
            return original_amount * 1.0 # Full refund
        elif days_until_reservation >= 3:
            return original_amount * 0.5 # 50% refund
        else:
            return 0.0 # No refund
