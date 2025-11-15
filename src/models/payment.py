from dataclasses import dataclass
from datetime import datetime

@dataclass
class Payment:
    id: int
    reservation_id: int
    amount: float
    payment_method: str
    status: str = "completed"  # completed, refunded
    created_at: datetime = datetime.now()
