from typing import Any
from .observer import Publisher, Subscriber
from src.models import Message, User
from src.repositories import UserRepository

class MessagePublisher(Publisher):
    pass

class MessageNotifier(Subscriber):
    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    def update(self, publisher: Publisher, event: str, data: Any):
        if event == "message_sent":
            message: Message = data
            recipient = self._user_repo.get_by_id(message.recipient_id)
            sender = self._user_repo.get_by_id(message.sender_id)
            if recipient and sender:
                print(f"\n--- NOTIFICATION ---")
                print(f"To: {recipient.contact}")
                print(f"Subject: New message from {sender.name}")
                print(f"Message: {message.content}")
                print(f"--- END NOTIFICATION ---")
