from src.models import Message
from src.repositories import MessageRepository, UserRepository
from src.observers import MessagePublisher
from src.exceptions import NotFoundError

class MessageService:
    def __init__(
        self, 
        message_repo: MessageRepository, 
        user_repo: UserRepository,
        publisher: MessagePublisher
    ):
        self._message_repo = message_repo
        self._user_repo = user_repo
        self._publisher = publisher

    def send_message(self, sender_id: int, recipient_id: int, content: str) -> Message:
        sender = self._user_repo.get_by_id(sender_id)
        if not sender:
            raise NotFoundError("Sender", sender_id)

        recipient = self._user_repo.get_by_id(recipient_id)
        if not recipient:
            raise NotFoundError("Recipient", recipient_id)

        new_message = Message(
            id=0, # Set by repo
            sender_id=sender_id,
            recipient_id=recipient_id,
            content=content,
        )

        created_message = self._message_repo.add(new_message)
        self._publisher.notify("message_sent", created_message)
        return created_message
