// server/src/controllers/rating.controller.js
const RatingService = require('../services/rating.service');

class RatingController {
  constructor() {
    this.ratingService = new RatingService();
    this.rateGuest = this.rateGuest.bind(this);
    this.rateHost = this.rateHost.bind(this);
  }

  async rateGuest(req, res, next) {
    try {
      const { reservationId, rating } = req.body;
      const hostId = req.user._id;

      if (!reservationId || rating === undefined) {
        return res.status(400).json({ message: 'Reservation ID and rating are required.' });
      }

      const updatedGuest = await this.ratingService.rateGuest(hostId, reservationId, rating);

      res.status(200).json({
        message: 'Guest rated successfully.',
        data: updatedGuest,
      });
    } catch (error) {
      next(error);
    }
  }

  async rateHost(req, res, next) {
    try {
      const { reservationId, rating } = req.body;
      const guestId = req.user._id;

      if (!reservationId || rating === undefined) {
        return res.status(400).json({ message: 'Reservation ID and rating are required.' });
      }

      const updatedHost = await this.ratingService.rateHost(guestId, reservationId, rating);

      res.status(200).json({
        message: 'Host rated successfully.',
        data: updatedHost,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();
