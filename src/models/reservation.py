from dataclasses import dataclass
from datetime import date

@dataclass
class Reservation:
    id: int
    user_id: int
    caravan_id: int
    start_date: date
    end_date: date
    price: float
    status: str = "pending"  # pending, confirmed, cancelled
