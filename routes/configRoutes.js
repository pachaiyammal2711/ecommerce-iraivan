const express = require('express');
const router = express.Router();

router.get('/razorpay', (req, res) => {
  res.json({ clientId: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
