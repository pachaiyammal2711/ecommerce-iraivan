const Promotion = require('../models/promotionModel');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({}).sort({ displayOrder: 1, createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active promotions
// @route   GET /api/promotions/active
// @access  Public
const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] }
      ]
    };
    const promotions = await Promotion.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = async (req, res) => {
  try {
    const { title, type, mediaUrl, desktopMediaUrl, mobileMediaUrl, description, buttonText, link, displayOrder, startDate, endDate, isActive } = req.body;

    const promotion = new Promotion({
      title,
      type,
      mediaUrl,
      desktopMediaUrl,
      mobileMediaUrl,
      description,
      buttonText,
      link,
      displayOrder: displayOrder || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: isActive || false,
    });

    const createdPromotion = await promotion.save();
    res.status(201).json(createdPromotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = async (req, res) => {
  try {
    const { title, type, mediaUrl, desktopMediaUrl, mobileMediaUrl, description, buttonText, link, displayOrder, startDate, endDate, isActive } = req.body;

    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
      promotion.title = title !== undefined ? title : promotion.title;
      promotion.type = type !== undefined ? type : promotion.type;
      promotion.mediaUrl = mediaUrl !== undefined ? mediaUrl : promotion.mediaUrl;
      promotion.desktopMediaUrl = desktopMediaUrl !== undefined ? desktopMediaUrl : promotion.desktopMediaUrl;
      promotion.mobileMediaUrl = mobileMediaUrl !== undefined ? mobileMediaUrl : promotion.mobileMediaUrl;
      promotion.description = description !== undefined ? description : promotion.description;
      promotion.buttonText = buttonText !== undefined ? buttonText : promotion.buttonText;
      promotion.link = link !== undefined ? link : promotion.link;
      promotion.displayOrder = displayOrder !== undefined ? displayOrder : promotion.displayOrder;
      
      if (startDate !== undefined) promotion.startDate = startDate || null;
      if (endDate !== undefined) promotion.endDate = endDate || null;
      
      if (isActive !== undefined) {
        promotion.isActive = isActive;
      }

      const updatedPromotion = await promotion.save();
      res.json(updatedPromotion);
    } else {
      res.status(404).json({ message: 'Promotion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
      await promotion.deleteOne();
      res.json({ message: 'Promotion removed' });
    } else {
      res.status(404).json({ message: 'Promotion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
