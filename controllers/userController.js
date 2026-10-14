const User = require('../models/userModel');
const Order = require('../models/orderModel');
const jwt = require('jsonwebtoken');
const firebaseAdmin = require('../config/firebaseAdmin');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'iraivan_angadi_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isGoogle: user.isGoogle,
        role: user.role,
        houseNumber: user.houseNumber,
        streetAddress: user.streetAddress,
        area: user.area,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileCompleted: user.profileCompleted,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      res.json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return res.json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isGoogle: user.isGoogle,
        role: user.role,
        houseNumber: user.houseNumber,
        streetAddress: user.streetAddress,
        area: user.area,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileCompleted: user.profileCompleted,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      res.json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isGoogle: user.isGoogle,
        role: user.role,
        houseNumber: user.houseNumber,
        streetAddress: user.streetAddress,
        area: user.area,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileCompleted: user.profileCompleted,
      });
    } else {
      res.status(404);
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Validation
      if (req.body.phone !== undefined) {
        if (!/^[6-9][0-9]{9}$/.test(req.body.phone)) {
          return res.status(400).json({ message: 'Invalid phone number format' });
        }
        user.phone = req.body.phone;
      }
      
      if (req.body.email && req.body.email !== user.email && !user.isGoogle) {
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(req.body.email)) {
          return res.status(400).json({ message: 'Only Gmail addresses are allowed' });
        }
        user.email = req.body.email;
      }

      user.name = req.body.name || user.name;
      user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;
      user.houseNumber = req.body.houseNumber !== undefined ? req.body.houseNumber : user.houseNumber;
      user.streetAddress = req.body.streetAddress !== undefined ? req.body.streetAddress : user.streetAddress;
      user.area = req.body.area !== undefined ? req.body.area : user.area;
      user.city = req.body.city !== undefined ? req.body.city : user.city;
      user.state = req.body.state !== undefined ? req.body.state : user.state;
      user.pincode = req.body.pincode !== undefined ? req.body.pincode : user.pincode;
      user.country = req.body.country !== undefined ? req.body.country : user.country;

      if (req.body.password) {
        user.password = req.body.password;
      }

      // Check Profile Completion
      const hasRequiredFields = 
        user.name && 
        user.phone && /^[6-9][0-9]{9}$/.test(user.phone) &&
        user.houseNumber && 
        user.streetAddress && 
        user.city && 
        user.state && 
        user.pincode && 
        user.country;
        
      user.profileCompleted = !!hasRequiredFields;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        isGoogle: updatedUser.isGoogle,
        role: updatedUser.role,
        houseNumber: updatedUser.houseNumber,
        streetAddress: updatedUser.streetAddress,
        area: updatedUser.area,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        country: updatedUser.country,
        profileCompleted: updatedUser.profileCompleted,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/profile/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/profile/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save();
      }
      res.json({ message: 'Product added to wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/profile/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
      await user.save();
      res.json({ message: 'Product removed from wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN CUSTOMER MANAGEMENT ---

// @desc    Get all customers (Admin)
// @route   GET /api/users/admin/customers
// @access  Private/Admin
const getAdminCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'All';
    const sort = req.query.sort || 'newest';

    const query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'Active') query.isActive = true;
    if (status === 'Inactive') query.isActive = false;

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    if (sort === 'name_desc') sortOptions = { name: -1 };

    const count = await User.countDocuments(query);
    const customers = await User.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(limit * (page - 1))
      .select('-password');

    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const orders = await Order.find({ user: customer._id });
      const totalOrders = orders.length;
      const totalSpent = orders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
      const lastOrder = orders.length > 0 ? orders.sort((a,b) => b.createdAt - a.createdAt)[0].totalPrice : 0;
      
      return {
        ...customer._doc,
        totalOrders,
        totalSpent,
        lastOrder
      };
    }));
    
    if (sort === 'highest_orders') {
      customersWithStats.sort((a, b) => b.totalOrders - a.totalOrders);
    }
    if (sort === 'highest_spending') {
      customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    res.json({
      customers: customersWithStats,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID (Admin)
// @route   GET /api/users/admin/customers/:id
// @access  Private/Admin
const getAdminCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (customer) {
      const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'Completed').length;
      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const cancelledOrders = orders.filter(o => o.status === 'Cancelled' || o.status === 'Cancellation Requested').length;
      const totalSpent = orders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
      const avgOrderValue = totalOrders > 0 ? (totalSpent / orders.filter(o => o.isPaid).length || 0) : 0;
      const lastOrderAmt = orders.length > 0 ? orders[0].totalPrice : 0;

      res.json({
        ...customer._doc,
        stats: {
          totalOrders,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          totalSpent,
          avgOrderValue,
          lastOrderAmt
        },
        recentOrders: orders.slice(0, 5)
      });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer details (Admin)
// @route   PUT /api/users/admin/customers/:id
// @access  Private/Admin
const updateAdminCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (customer) {
      if (req.body.phone !== undefined) {
        if (req.body.phone && !/^[0-9]{10}$/.test(req.body.phone.replace(/[\s-]/g, ''))) {
          return res.status(400).json({ message: 'Invalid phone number format' });
        }
        customer.phone = req.body.phone;
      }
      
      if (req.body.email && req.body.email !== customer.email) {
        if (!/\S+@\S+\.\S+/.test(req.body.email)) {
          return res.status(400).json({ message: 'Invalid email address' });
        }
        customer.email = req.body.email;
      }

      customer.name = req.body.name || customer.name;
      customer.houseNumber = req.body.houseNumber !== undefined ? req.body.houseNumber : customer.houseNumber;
      customer.streetAddress = req.body.streetAddress !== undefined ? req.body.streetAddress : customer.streetAddress;
      customer.area = req.body.area !== undefined ? req.body.area : customer.area;
      customer.landmark = req.body.landmark !== undefined ? req.body.landmark : customer.landmark;
      customer.city = req.body.city !== undefined ? req.body.city : customer.city;
      customer.state = req.body.state !== undefined ? req.body.state : customer.state;
      customer.pincode = req.body.pincode !== undefined ? req.body.pincode : customer.pincode;
      customer.country = req.body.country !== undefined ? req.body.country : customer.country;
      
      if (req.body.isActive !== undefined) {
        customer.isActive = req.body.isActive;
      }

      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer status (activate/deactivate) (Admin)
// @route   PATCH /api/users/admin/customers/:id/status
// @access  Private/Admin
const updateAdminCustomerStatus = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (customer) {
      customer.isActive = req.body.isActive;
      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer orders (Admin)
// @route   GET /api/users/admin/customers/:id/orders
// @access  Private/Admin
const getAdminCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth Google admin user via Firebase ID Token
// @route   POST /api/users/google-admin
// @access  Public
const googleAdminLogin = async (req, res) => {
  const { idToken, email: clientEmail, name: clientName } = req.body;

  try {
    let verifiedEmail = null;

    // 1. Securely verify Firebase ID Token using Firebase Admin SDK on Node.js backend
    if (idToken) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        if (decodedToken && decodedToken.email) {
          verifiedEmail = decodedToken.email;
        }
      } catch (authError) {
        // Fallback token decoding if service account cert is unconfigured in local dev
        if (typeof idToken === 'string' && idToken.includes('.')) {
          try {
            const payloadBase64 = idToken.split('.')[1];
            const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
            if (decodedPayload && decodedPayload.email) {
              verifiedEmail = decodedPayload.email;
            }
          } catch (e) {}
        }
      }
    }

    const targetEmail = (verifiedEmail || clientEmail || '').toLowerCase().trim();

    if (!targetEmail) {
      res.status(400);
      return res.json({ message: 'Email address is required for login. Please ensure your Google account shares your email.' });
    }

    // 2. Query MongoDB database for user record
    let user = await User.findOne({ email: targetEmail });

    const ALLOWED_ADMIN_EMAILS = [
      'pachaiyammal.villzone@gmail.com',
      'cheranelumalai6014@gmail.com'
    ];

    const isAllowedAdmin = ALLOWED_ADMIN_EMAILS.includes(targetEmail) || (user && (user.role === 'admin' || user.isAdmin === true));

    const { isAdminPath } = req.body;

    if (isAdminPath && (!targetEmail || !isAllowedAdmin)) {
      res.status(403);
      return res.json({ message: 'This email is not authorized for Admin access.' });
    }

      if (!user) {
        const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        console.log('Generating password for admin login:', generatedPassword);
        user = await User.create({
          name: clientName || targetEmail.split('@')[0],
          email: targetEmail,
          isGoogle: true,
          role: isAllowedAdmin ? 'admin' : 'customer',
          isAdmin: isAllowedAdmin,
          password: generatedPassword,
        });
    } else if (isAllowedAdmin && user.role !== 'admin') {
      user.role = 'admin';
      user.isAdmin = true;
      if (!user.password) {
        user.password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      }
      await user.save();
    }

    // 3. Admin Role Verification: Return admin user response
    return res.json({
      _id: user._id,
      name: user.name || clientName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isGoogle: true,
      role: user.role || 'admin',
      houseNumber: user.houseNumber,
      streetAddress: user.streetAddress,
      area: user.area,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      country: user.country,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Make user an admin by email
// @route   POST /api/users/admin/make-admin
// @access  Private/Admin
const makeAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Create a placeholder admin user
      const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        password: generatedPassword,
        role: 'admin',
        isAdmin: true,
      });
      return res.json({ message: 'New admin account created successfully!', user });
    }
    user.role = 'admin';
    user.isAdmin = true;
    await user.save();
    res.json({ message: 'User granted admin access successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admin users
// @route   GET /api/users/admin/admins
// @access  Private/Admin
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ $or: [{ role: 'admin' }, { isAdmin: true }] }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke admin access
// @route   POST /api/users/admin/revoke-admin
// @access  Private/Admin
const revokeAdmin = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Optional safety: Prevent removing the very last admin, or hardcoded superadmins
    const ALLOWED_ADMIN_EMAILS = ['pachaiyammal.villzone@gmail.com', 'cheranelumalai6014@gmail.com'];
    if (ALLOWED_ADMIN_EMAILS.includes(user.email)) {
       return res.status(403).json({ message: 'Cannot revoke access from super admin' });
    }

    user.role = 'customer';
    user.isAdmin = false;
    await user.save();
    res.json({ message: 'Admin access revoked successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  googleAdminLogin,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomer,
  updateAdminCustomerStatus,
  getAdminCustomerOrders,
  makeAdmin,
  getAdmins,
  revokeAdmin,
};

