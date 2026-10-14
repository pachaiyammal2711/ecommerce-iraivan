const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const buildProductCategoryFilter = (cat) => {
  const conditions = [];
  if (cat.name) {
    if (typeof cat.name === 'object') {
      if (cat.name.tamil) {
        conditions.push({ category: cat.name.tamil });
        conditions.push({ category: { $regex: cat.name.tamil, $options: 'i' } });
      }
      if (cat.name.english) {
        conditions.push({ category: cat.name.english });
        conditions.push({ category: { $regex: cat.name.english, $options: 'i' } });
      }
    } else if (typeof cat.name === 'string') {
      conditions.push({ category: cat.name });
      conditions.push({ category: { $regex: cat.name, $options: 'i' } });
    }
  }
  if (cat.categoryId) {
    conditions.push({ categoryId: cat.categoryId });
    conditions.push({ category: { $regex: cat.categoryId, $options: 'i' } });
  }
  if (cat.slug) {
    conditions.push({ collectionSlug: cat.slug });
    conditions.push({ category: { $regex: cat.slug, $options: 'i' } });
  }
  return {
    $or: conditions.length > 0 ? conditions : [{ category: 'non_existent_fallback' }],
    isDeleted: { $ne: true }
  };
};

// @desc    Get all categories (Admin)
// @route   GET /api/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    
    if (req.query.status && req.query.status !== 'All Status') {
      filter.status = req.query.status.toLowerCase();
    }
    
    if (req.query.search) {
      filter.$or = [
        { 'name.tamil': { $regex: req.query.search, $options: 'i' } },
        { 'name.english': { $regex: req.query.search, $options: 'i' } },
        { categoryId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const categories = await Category.find(filter).lean();

    // Calculate product counts dynamically
    for (let cat of categories) {
      const count = await Product.countDocuments(buildProductCategoryFilter(cat));
      cat.productCount = count;
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      if (req.query.sort === 'Oldest') sort = { createdAt: 1 };
      else if (req.query.sort === 'A-Z') sort = { 'name.english': 1 };
      else if (req.query.sort === 'Z-A') sort = { 'name.english': -1 };
    }

    if (req.query.sort === 'Most Products') {
      categories.sort((a, b) => b.productCount - a.productCount);
    } else if (req.query.sort === 'Least Products') {
      categories.sort((a, b) => a.productCount - b.productCount);
    } else {
      categories.sort((a, b) => {
        if (sort.createdAt) return sort.createdAt === 1 ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
        if (sort['name.english']) return sort['name.english'] === 1 ? a.name.english.localeCompare(b.name.english) : b.name.english.localeCompare(a.name.english);
        return 0;
      });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private/Admin
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (category) {
      const count = await Product.countDocuments(buildProductCategoryFilter(category));
      category.productCount = count;
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, image, description, seo, status } = req.body;
    
    // Generate auto Category ID
    const count = await Category.countDocuments();
    const categoryId = `CAT-${(count + 1).toString().padStart(3, '0')}`;
    
    // Generate slug from english name
    let slug = name.english.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    // Ensure slug is unique
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = new Category({
      categoryId,
      name,
      slug,
      image,
      description,
      seo,
      status
    });

    const created = await category.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.image = req.body.image || category.image;
      category.description = req.body.description || category.description;
      category.seo = req.body.seo || category.seo;
      category.status = req.body.status || category.status;
      
      if (req.body.slug && req.body.slug !== category.slug) {
        const existing = await Category.findOne({ slug: req.body.slug });
        if (existing && existing._id.toString() !== category._id.toString()) {
          return res.status(400).json({ message: 'Slug already exists' });
        }
        category.slug = req.body.slug;
      }

      const updated = await category.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      // Check if products exist
      const count = await Product.countDocuments(buildProductCategoryFilter(category));
      
      if (count > 0) {
        return res.status(400).json({ message: 'This category contains products and cannot be deleted.' });
      }

      category.isDeleted = true;
      category.status = 'inactive';
      await category.save();
      res.json({ message: 'Category deleted' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category status
// @route   PATCH /api/categories/:id/status
// @access  Private/Admin
const updateCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.status = req.body.status;
      const updated = await category.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Private/Admin
const getCategoryProducts = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      const products = await Product.find(buildProductCategoryFilter(category));
      res.json(products);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getCategoryProducts
};
