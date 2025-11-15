from typing import Optional
from src.models.user import User
from .base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def find_by_name(self, name: str) -> Optional[User]:
        for user in self.get_all():
            if user.name == name:
                return user
        return None
