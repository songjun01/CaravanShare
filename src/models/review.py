from dataclasses import dataclass
from datetime import datetime

@dataclass
class Review:
    id: int
    reservation_id: int
    rating: int  # 1-5
    comment: str
    author_id: int
    subject_id: int # The user or caravan being reviewed
    created_at: datetime = datetime.now()
