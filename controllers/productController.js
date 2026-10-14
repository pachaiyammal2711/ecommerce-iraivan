const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const keywordStr = req.query.keyword || '';
  const searchRegex = new RegExp(keywordStr.split('').join('\\s*'), 'i'); // To match "6mm" to "6 MM"
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { nameEn: { $regex: req.query.keyword, $options: 'i' } },
          // Flexible regex to handle spaces, e.g., "6mm" matches "6 MM"
          { name: { $regex: searchRegex } },
          { nameEn: { $regex: searchRegex } }
        ]
      }
    : {};

  try {
    const query = { 
      ...keyword,
      status: 'active',
      isDeleted: false 
    };
    
    if (req.query.isBestSeller) {
      query.isBestSeller = true;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product (Customer)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      status: 'active', 
      isDeleted: false 
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      res.json({ message: 'Product not found or is inactive' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        return res.json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN CONTROLLERS ---

// Helper function to map nested admin payload to flat DB schema
const mapAdminPayloadToDB = (data, req) => {
  const mapped = {
    user: req.user._id,
    name: data.name?.tamil || data.name,
    nameEn: data.name?.english || data.nameEn || data.name?.tamil || data.name,
    price: data.price?.selling || data.price || 0,
    oldPrice: data.price?.original || data.oldPrice || 0,
    countInStock: data.stock?.quantity ?? data.countInStock ?? 0,
    category: data.categoryId || data.categoryName || data.category,
    description: data.description?.tamil || (typeof data.description === 'string' ? data.description : ''),
    descriptionEn: data.description?.english || data.descriptionEn || '',
    variant: data.variants && data.variants.length > 0 ? data.variants[0].name : '',
    sku: data.sku,
    slug: data.slug,
    inch: data.inch || '',
    mm: data.mm || '',
    face: data.face || '',
    images: data.images || [],
    variants: data.variants || [],
    verification: data.verification || {},
    status: data.status || 'active',
    visibility: data.visibility || 'published',
    lowStockThreshold: data.stock?.lowStockThreshold || 10,
    displayOrder: data.displayOrder || 0,
    weight: data.weight || 0,
    dimensions: data.dimensions || { length: 0, width: 0, height: 0 },
    isBestSeller: data.isBestSeller === 'true' || data.isBestSeller === true,
  };

  // Retain image logic for public frontend
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const validImages = data.images.filter(Boolean);
    const mainImg = validImages.find(img => img.isMain) || validImages[0];
    
    if (mainImg) {
      mapped.image = typeof mainImg === 'string' ? mainImg : (mainImg.url || '');
    }
    
    mapped.images = validImages.map((img, index) => {
      if (typeof img === 'string') {
        return { url: img, isMain: index === 0 };
      }
      return {
        url: img.url || '',
        isMain: !!img.isMain
      };
    }).filter(img => img.url);
  } else if (data.image) {
    mapped.image = data.image;
    mapped.images = [{ url: data.image, isMain: true }];
  } else {
    mapped.images = [];
  }

  return mapped;
};

// @desc    Get all products (Admin)
// @route   GET /api/products/admin
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    
    // Status Filter
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status.toLowerCase();
    }
    
    // Category Filter
    if (req.query.category && req.query.category !== 'All Categories') {
      filter.category = req.query.category;
    }

    // Search Filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { nameEn: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product for admin
// @route   GET /api/products/admin/:id
// @access  Private/Admin
const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const mappedData = mapAdminPayloadToDB(req.body, req);
    const product = new Product(mappedData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const mappedData = mapAdminPayloadToDB(req.body, req);
      
      // Preserve category array if it exists
      if (mappedData.category && Array.isArray(product.category)) {
        if (!product.category.includes(mappedData.category)) {
          product.category.push(mappedData.category);
        }
        mappedData.category = product.category;
      }
      
      Object.assign(product, mappedData);
      product.markModified('category');
      product.markModified('images');
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    require('fs').writeFileSync('error.log', error.stack); res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.status = req.body.status;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate product
// @route   POST /api/products/:id/duplicate
// @access  Private/Admin
const duplicateProduct = async (req, res) => {
  try {
    const productToDuplicate = await Product.findById(req.params.id).lean();
    
    if (productToDuplicate) {
      delete productToDuplicate._id;
      delete productToDuplicate.createdAt;
      delete productToDuplicate.updatedAt;
      
      productToDuplicate.name = productToDuplicate.name + ' (Copy)';
      productToDuplicate.nameEn = productToDuplicate.nameEn + ' (Copy)';
      if (productToDuplicate.sku) {
        productToDuplicate.sku = productToDuplicate.sku + '-COPY';
      }
      productToDuplicate.visibility = 'draft';
      productToDuplicate.status = 'inactive';
      
      const newProduct = new Product(productToDuplicate);
      const created = await newProduct.save();
      res.status(201).json(created);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  duplicateProduct,
  getAdminProductById
};

