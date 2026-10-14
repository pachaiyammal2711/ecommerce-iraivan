const Coupon = require('../models/couponModel');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumCartValue,
      maximumDiscount,
      startDate,
      expiryDate,
      usageLimit,
      homeMessage,
      isActive,
    } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumCartValue: minimumCartValue || 0,
      maximumDiscount,
      startDate,
      expiryDate,
      usageLimit,
      homeMessage,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active coupon with home message
// @route   GET /api/coupons/active
// @access  Public
const getActiveCoupon = async (req, res) => {
  try {
    const activeCoupons = await Coupon.find({ isActive: true });
    const now = new Date();
    const validCoupon = activeCoupons.find(coupon => {
      if (coupon.startDate && new Date(coupon.startDate) > now) return false;
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return false;
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    });

    if (validCoupon) {
      let msg = validCoupon.homeMessage;
      if (!msg) {
        if (validCoupon.discountType === 'percentage') {
          msg = `Get ${validCoupon.discountValue}% OFF on orders above ₹${validCoupon.minimumCartValue || 0}`;
        } else {
          msg = `Get ₹${validCoupon.discountValue} OFF on orders above ₹${validCoupon.minimumCartValue || 0}`;
        }
      }
      res.json({ message: msg, code: validCoupon.code });
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
      const exists = await Coupon.findOne({ code: req.body.code.toUpperCase() });
      if (exists) {
         return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    coupon.code = req.body.code ? req.body.code.toUpperCase() : coupon.code;
    coupon.discountType = req.body.discountType || coupon.discountType;
    coupon.discountValue = req.body.discountValue !== undefined ? req.body.discountValue : coupon.discountValue;
    coupon.minimumCartValue = req.body.minimumCartValue !== undefined ? req.body.minimumCartValue : coupon.minimumCartValue;
    coupon.maximumDiscount = req.body.maximumDiscount !== undefined ? req.body.maximumDiscount : coupon.maximumDiscount;
    coupon.startDate = req.body.startDate !== undefined ? req.body.startDate : coupon.startDate;
    coupon.expiryDate = req.body.expiryDate !== undefined ? req.body.expiryDate : coupon.expiryDate;
    coupon.usageLimit = req.body.usageLimit !== undefined ? req.body.usageLimit : coupon.usageLimit;
    coupon.homeMessage = req.body.homeMessage !== undefined ? req.body.homeMessage : coupon.homeMessage;
    coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon and calculate discount
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, cartValue } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is currently unavailable.' });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ message: 'This coupon is not active yet.' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon usage limit has been reached.' });
    }

    if (coupon.minimumCartValue && cartValue < coupon.minimumCartValue) {
      return res.status(400).json({ message: `Minimum cart value of ₹${coupon.minimumCartValue} is required to use this coupon.` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartValue * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > cartValue) {
      discount = cartValue;
    }

    res.json({
      success: true,
      code: coupon.code,
      discount: Math.round(discount),
      message: 'Coupon applied successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getActiveCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
