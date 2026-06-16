// ══════════════════════════════════════════════════════════════
//  destinationRoutes.js
// ══════════════════════════════════════════════════════════════
const express = require('express');
const destCtrl = require('../controllers/destinationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const destRouter = express.Router();

destRouter.get('/',          destCtrl.getDestinations);
destRouter.get('/nearby',    destCtrl.getNearby);
destRouter.get('/:id',       destCtrl.getDestination);
destRouter.post('/',         protect, authorize('admin'), destCtrl.createDestination);
destRouter.put('/:id',       protect, authorize('admin'), destCtrl.updateDestination);
destRouter.delete('/:id',    protect, authorize('admin'), destCtrl.deleteDestination);

module.exports = destRouter;
