const express = require('express');
const { 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  getConnections, 
  getSuggestedConnections,
  getPendingRequests 
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request/:userId', protect, sendConnectionRequest);
router.put('/accept/:connectionId', protect, acceptConnectionRequest);
router.get('/', protect, getConnections);
router.get('/suggestions', protect, getSuggestedConnections);
router.get('/pending', protect, getPendingRequests);

module.exports = router;