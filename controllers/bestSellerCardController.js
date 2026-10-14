const BestSellerCard = require('../models/bestSellerCardModel.js');

// @desc    Get all best seller cards
// @route   GET /api/bestsellercards
// @access  Public
const getBestSellerCards = async (req, res) => {
  try {
    const query = {};
    
    // If not admin, only show active cards
    if (!req.user || !req.user.isAdmin) {
      query.isActive = true;
    }
    
    const cards = await BestSellerCard.find(query).sort({ displayOrder: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a best seller card
// @route   POST /api/bestsellercards
// @access  Private/Admin
const createBestSellerCard = async (req, res) => {
  try {
    const { title, titleEn, image, link, displayOrder, isActive } = req.body;

    const card = new BestSellerCard({
      title: title || 'New Card',
      titleEn,
      image,
      link: link || '/',
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdCard = await card.save();
    res.status(201).json(createdCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a best seller card
// @route   PUT /api/bestsellercards/:id
// @access  Private/Admin
const updateBestSellerCard = async (req, res) => {
  try {
    const { title, titleEn, image, link, displayOrder, isActive } = req.body;

    const card = await BestSellerCard.findById(req.params.id);

    if (card) {
      card.title = title || card.title;
      card.titleEn = titleEn !== undefined ? titleEn : card.titleEn;
      card.image = image || card.image;
      card.link = link || card.link;
      card.displayOrder = displayOrder !== undefined ? displayOrder : card.displayOrder;
      card.isActive = isActive !== undefined ? isActive : card.isActive;

      const updatedCard = await card.save();
      res.json(updatedCard);
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a best seller card
// @route   DELETE /api/bestsellercards/:id
// @access  Private/Admin
const deleteBestSellerCard = async (req, res) => {
  try {
    const card = await BestSellerCard.findById(req.params.id);

    if (card) {
      await card.deleteOne();
      res.json({ message: 'Card removed' });
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getBestSellerCards,
  createBestSellerCard,
  updateBestSellerCard,
  deleteBestSellerCard,
};
