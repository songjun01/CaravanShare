from dataclasses import dataclass, field
from datetime import datetime
from typing import List

@dataclass
class Settlement:
    id: int
    host_id: int
    amount: float
    payment_ids: List[int] = field(default_factory=list)
    created_at: datetime = datetime.now()
