import express from 'express';
import * as ratingCtrl from '../controllers/ratingController.js';
const router = express.Router();

router.post('/',     ratingCtrl.createRating);
router.get('/',      ratingCtrl.getAllRatings);
router.get('/:id',   ratingCtrl.getRatingById);
router.put('/:id',   ratingCtrl.updateRating);
router.delete('/:id',ratingCtrl.deleteRating);

export default router;
