from abc import ABC, abstractmethod
from typing import Any, List

class Subscriber(ABC):
    @abstractmethod
    def update(self, publisher: 'Publisher', event: str, data: Any):
        pass

class Publisher(ABC):
    def __init__(self):
        self._subscribers: List[Subscriber] = []

    def subscribe(self, subscriber: Subscriber):
        if subscriber not in self._subscribers:
            self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber: Subscriber):
        self._subscribers.remove(subscriber)

    def notify(self, event: str, data: Any):
        for subscriber in self._subscribers:
            subscriber.update(self, event, data)
