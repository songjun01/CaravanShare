class CaravanShareException(Exception):
    """Base exception class for CaravanShare."""
    pass

class DuplicateReservationError(CaravanShareException):
    """Raised when a reservation conflicts with an existing one."""
    pass

class InsufficientFundsError(CaravanShareException):
    """Raised when a user has insufficient funds for a payment."""
    pass

class NotFoundError(CaravanShareException):
    """Raised when an entity is not found."""
    def __init__(self, entity_name: str, entity_id: int):
        super().__init__(f"{entity_name} with id {entity_id} not found.")
