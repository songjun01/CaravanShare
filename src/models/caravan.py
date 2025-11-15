from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Caravan:
    id: int
    host_id: int
    name: str
    capacity: int
    location: str
    latitude: float = 0.0
    longitude: float = 0.0
    amenities: List[str] = field(default_factory=list)
    photos: List[str] = field(default_factory=list)
    price_per_day: float = 0.0  # New attribute for daily rental price
    average_rating: float = 0.0  # New attribute for average rating
    status: str = "available"  # available, reserved, maintenance
