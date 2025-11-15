from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate_discount(self, original_price: float) -> float:
        pass

class NoDiscount(DiscountStrategy):
    def calculate_discount(self, original_price: float) -> float:
        return 0.0

class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float):
        if not 0 <= percentage <= 100:
            raise ValueError("Percentage must be between 0 and 100.")
        self._percentage = percentage

    def calculate_discount(self, original_price: float) -> float:
        return original_price * (self._percentage / 100)

class FeeStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, price: float) -> float:
        pass

class PercentageFee(FeeStrategy):
    def __init__(self, percentage: float):
        if not 0 <= percentage <= 100:
            raise ValueError("Percentage must be between 0 and 100.")
        self._percentage = percentage

    def calculate_fee(self, price: float) -> float:
        return price * (self._percentage / 100)
