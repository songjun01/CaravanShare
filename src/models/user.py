from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: int
    name: str
    contact: str
    is_host: bool
    balance: float = 0.0
    is_trusted_reviewer: bool = False  # New attribute for trusted reviewer badge
    # In a real application, this would be more complex
    # and involve password hashing and management.
    password_hash: Optional[str] = None
