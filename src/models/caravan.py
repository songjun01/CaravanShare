from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Caravan:
    id: int
    host_id: int
    name: str
    capacity: int
    location: str
    amenities: List[str] = field(default_factory=list)
    photos: List[str] = field(default_factory=list)
    status: str = "available"  # available, reserved, maintenance
