from typing import Dict, TypeVar, Generic, Optional, List

T = TypeVar('T')

class BaseRepository(Generic[T]):
    def __init__(self):
        self._data: Dict[int, T] = {}
        self._next_id = 1

    def get_by_id(self, item_id: int) -> Optional[T]:
        return self._data.get(item_id)

    def get_all(self) -> List[T]:
        return list(self._data.values())

    def add(self, item: T) -> T:
        item.id = self._next_id
        self._data[self._next_id] = item
        self._next_id += 1
        return item

    def update(self, item: T) -> None:
        self._data[item.id] = item

    def delete(self, item_id: int) -> None:
        if item_id in self._data:
            del self._data[item_id]
