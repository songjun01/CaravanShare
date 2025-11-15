import unittest
from unittest.mock import MagicMock

# Add src to path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models import Message, User
from src.services import MessageService
from src.observers import MessagePublisher
from src.exceptions import NotFoundError

class TestMessageService(unittest.TestCase):

    def setUp(self):
        self.message_repo = MagicMock()
        self.user_repo = MagicMock()
        self.publisher = MagicMock(spec=MessagePublisher)
        self.message_service = MessageService(
            self.message_repo, self.user_repo, self.publisher
        )
        self.sender = User(id=1, name="Sender", contact="", is_host=False)
        self.recipient = User(id=2, name="Recipient", contact="", is_host=True)

    def test_send_message_success(self):
        # Arrange
        self.user_repo.get_by_id.side_effect = [self.sender, self.recipient]
        new_message = Message(id=1, sender_id=1, recipient_id=2, content="Hello")
        self.message_repo.add.return_value = new_message

        # Act
        message = self.message_service.send_message(
            sender_id=1, recipient_id=2, content="Hello"
        )

        # Assert
        self.user_repo.get_by_id.assert_any_call(1)
        self.user_repo.get_by_id.assert_any_call(2)
        self.message_repo.add.assert_called_once()
        self.publisher.notify.assert_called_once_with("message_sent", new_message)
        self.assertEqual(message, new_message)

    def test_send_message_sender_not_found(self):
        # Arrange
        self.user_repo.get_by_id.return_value = None

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.message_service.send_message(sender_id=99, recipient_id=2, content="Hi")
        self.message_repo.add.assert_not_called()
        self.publisher.notify.assert_not_called()

    def test_send_message_recipient_not_found(self):
        # Arrange
        self.user_repo.get_by_id.side_effect = [self.sender, None]

        # Act & Assert
        with self.assertRaises(NotFoundError):
            self.message_service.send_message(sender_id=1, recipient_id=99, content="Hi")
        self.message_repo.add.assert_not_called()
        self.publisher.notify.assert_not_called()

if __name__ == '__main__':
    unittest.main()
