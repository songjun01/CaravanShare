from dataclasses import dataclass
from datetime import datetime

@dataclass
class Payment:
    id: int
    reservation_id: int
    amount: float
    payment_method: str
    platform_fee: float = 0.0
    settled: bool = False
    status: str = "completed"  # completed, refunded
    created_at: datetime = datetime.now()
