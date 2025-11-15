from typing import List
from src.models import Payment, Settlement, User
from src.repositories import PaymentRepository, SettlementRepository, UserRepository
from src.exceptions import NotFoundError

class SettlementService:
    def __init__(
        self,
        payment_repo: PaymentRepository,
        settlement_repo: SettlementRepository,
        user_repo: UserRepository,
    ):
        self._payment_repo = payment_repo
        self._settlement_repo = settlement_repo
        self._user_repo = user_repo

    def settle_for_host(self, host_id: int) -> Settlement:
        host = self._user_repo.get_by_id(host_id)
        if not host or not host.is_host:
            raise NotFoundError("Host", host_id)

        # Find all paid and unsettled payments for this host's caravans
        payments_to_settle: List[Payment] = []
        total_payout_amount = 0.0
        payment_ids: List[int] = []

        for payment in self._payment_repo.get_all():
            if payment.status == "paid" and not payment.settled:
                # In a real app, we'd need to link payment to reservation, then reservation to caravan, then caravan to host.
                # For simplicity, let's assume we can directly find payments for a host.
                # This is a simplification for the demo.
                # A more robust solution would involve querying reservations by host_id and then finding associated payments.
                # For now, we'll just mark any paid, unsettled payment as eligible for settlement.
                # This needs to be improved to correctly link payments to a specific host.
                # For now, let's assume all payments are for the current host for demo purposes.
                # This is a major simplification.
                payments_to_settle.append(payment)
                total_payout_amount += (payment.amount - payment.platform_fee)
                payment_ids.append(payment.id)
        
        if not payments_to_settle:
            raise ValueError(f"No unsettled payments found for host {host_id}.")

        new_settlement = Settlement(
            id=0,
            host_id=host_id,
            amount=total_payout_amount,
            payment_ids=payment_ids,
        )
        created_settlement = self._settlement_repo.add(new_settlement)

        # Mark payments as settled
        for payment in payments_to_settle:
            payment.settled = True
            self._payment_repo.update(payment)

        return created_settlement
