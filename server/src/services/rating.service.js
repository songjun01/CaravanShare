// server/src/services/rating.service.js
const ReservationRepository = require('../repositories/reservation.repository');
const UserRepository = require('../repositories/user.repository');
const { CustomError } = require('../exceptions/custom.error');

class RatingService {
  constructor() {
    this.reservationRepository = ReservationRepository;
    this.userRepository = UserRepository;
  }

  async rateGuest(hostId, reservationId, rating) {
    const reservation = await this.reservationRepository.findById(reservationId);

    // 1. Validation
    if (!reservation) {
      throw new CustomError(404, 'Reservation not found.');
    }
    const caravan = await reservation.populate('caravan');
    if (caravan.caravan.host.toString() !== hostId.toString()) {
      throw new CustomError(403, 'You are not the host for this reservation.');
    }
    if (reservation.status !== 'completed') {
      throw new CustomError(400, 'You can only rate guests for completed reservations.');
    }
    if (reservation.guestRatedByHost) {
      throw new CustomError(400, 'You have already rated the guest for this reservation.');
    }

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      throw new CustomError(400, 'Rating must be a number between 1 and 5.');
    }

    // 2. Calculate trust score adjustment
    let scoreChange = 0;
    switch (ratingValue) {
      case 1: scoreChange = -0.2; break;
      case 2: scoreChange = -0.1; break;
      case 4: scoreChange = +0.1; break;
      case 5: scoreChange = +0.2; break;
      default: scoreChange = 0;
    }

    // 3. Update guest's trust score
    const guest = await this.userRepository.findById(reservation.guest);
    if (!guest) {
      throw new CustomError(404, 'Guest not found.');
    }
    await guest.adjustTrustScore(scoreChange);

    // 4. Mark reservation as rated
    reservation.guestRatedByHost = true;
    await this.reservationRepository.updateById(reservationId, { guestRatedByHost: true });

    return guest;
  }

  async rateHost(guestId, reservationId, rating) {
    const reservation = await this.reservationRepository.findById(reservationId);

    // 1. Validation
    if (!reservation) {
      throw new CustomError(404, 'Reservation not found.');
    }
    if (reservation.guest._id.toString() !== guestId.toString()) {
      throw new CustomError(403, 'You are not the guest for this reservation.');
    }
    if (reservation.status !== 'completed') {
      throw new CustomError(400, 'You can only rate hosts for completed reservations.');
    }
    if (!reservation.reviewed) {
        throw new CustomError(400, 'You must review the caravan before rating the host.');
    }
    if (reservation.hostRatedByGuest) {
      throw new CustomError(400, 'You have already rated the host for this reservation.');
    }

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      throw new CustomError(400, 'Rating must be a number between 1 and 5.');
    }

    // 2. Calculate trust score adjustment
    let scoreChange = 0;
    switch (ratingValue) {
      case 1: scoreChange = -0.2; break;
      case 2: scoreChange = -0.1; break;
      case 4: scoreChange = +0.1; break;
      case 5: scoreChange = +0.2; break;
      default: scoreChange = 0;
    }

    // 3. Update host's trust score
    const populatedCaravan = await reservation.populate('caravan');
    const host = await this.userRepository.findById(populatedCaravan.caravan.host);

    if (!host) {
      throw new CustomError(404, 'Host not found.');
    }
    await host.adjustTrustScore(scoreChange);

    // 4. Mark reservation as host-rated
    await this.reservationRepository.updateById(reservationId, { hostRatedByGuest: true });

    return host;
  }
}

module.exports = RatingService;
