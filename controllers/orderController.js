const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const InventoryTransaction = require('../models/inventoryTransactionModel');
const Payment = require('../models/paymentModel');
const Coupon = require('../models/couponModel');
const { sendWhatsApp } = require('../services/msg91Service');
const { createDelhiveryShipment, getShipmentTracking } = require('../services/delhiveryService');
const Razorpay = require('razorpay');

const generateOrderId = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const prefix = `IRA-${year}${month}${day}-`;

  // Find the highest sequence number for today
  const lastOrder = await Order.findOne({ orderId: new RegExp(`^${prefix}`) })
    .sort({ orderId: -1 })
    .collation({ locale: "en_US", numericOrdering: true });

  let sequence = 1;
  if (lastOrder && lastOrder.orderId) {
    const lastSequence = parseInt(lastOrder.orderId.split('-')[2], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    return res.json({ message: 'No order items' });
  } else {
    try {
      const mongoose = require('mongoose');
      
      // Sanitize item product IDs (if mock id like "12", convert to dummy ObjectId to satisfy schema)
      const sanitizedOrderItems = orderItems.map(item => {
         const isValidObjectId = mongoose.Types.ObjectId.isValid(item.product);
         // If it's not a valid 24-character hex, it's a mock product ID from frontend
         const finalProductId = (isValidObjectId && String(item.product).length === 24) 
              ? item.product 
              : new mongoose.Types.ObjectId().toString(); // assign a random valid ObjectId so schema doesn't fail
         return {
            ...item,
            product: finalProductId,
            _originalId: item.product // keep track internally
         };
      });

      // 1. Stock Validation
      for (const item of sanitizedOrderItems) {
        let product = null;
        if (mongoose.Types.ObjectId.isValid(item._originalId) && String(item._originalId).length === 24) {
           product = await Product.findById(item._originalId);
        }
        if (!product) {
           product = await Product.findOne({ name: item.name });
        }
        
        // If product doesn't exist, we assume it's a mock product and skip validation
        if (product) {
          if (product.countInStock < item.qty) {
            return res.status(400).json({ message: `Only ${product.countInStock} units are available for ${item.name}.` });
          }
        }
      }

      const newOrderId = await generateOrderId();

      let finalCouponDiscount = 0;
      let validCouponCode = null;

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon && coupon.isActive) {
          const now = new Date();
          let isValid = true;
          if (coupon.startDate && new Date(coupon.startDate) > now) isValid = false;
          if (coupon.expiryDate && new Date(coupon.expiryDate) < now) isValid = false;
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) isValid = false;
          if (coupon.minimumCartValue && itemsPrice < coupon.minimumCartValue) isValid = false;

          if (isValid) {
            validCouponCode = coupon.code;
            if (coupon.discountType === 'percentage') {
              finalCouponDiscount = (itemsPrice * coupon.discountValue) / 100;
              if (coupon.maximumDiscount && finalCouponDiscount > coupon.maximumDiscount) {
                finalCouponDiscount = coupon.maximumDiscount;
              }
            } else {
              finalCouponDiscount = coupon.discountValue;
            }
            if (finalCouponDiscount > itemsPrice) {
              finalCouponDiscount = itemsPrice;
            }
            
            // Increment usage count
            coupon.usedCount += 1;
            await coupon.save();
          }
        }
      }

      const backendTotalPrice = itemsPrice - finalCouponDiscount + taxPrice + shippingPrice;

      const order = new Order({
        orderId: newOrderId,
        orderItems: sanitizedOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice: backendTotalPrice,
        couponCode: validCouponCode,
        couponDiscount: finalCouponDiscount,
      });

      const createdOrder = await order.save();

      // Create Payment Record
      const paymentId = `PAY${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      await Payment.create({
        paymentId,
        orderId: createdOrder._id,
        customerId: req.user._id,
        amount: createdOrder.totalPrice,
        method: paymentMethod || 'Unknown',
        status: 'Pending',
      });

      // 2. Stock Deduction & Transaction Logging
      for (const item of sanitizedOrderItems) {
        let product = null;
        if (mongoose.Types.ObjectId.isValid(item._originalId) && String(item._originalId).length === 24) {
          product = await Product.findById(item._originalId);
        }
        if (!product) {
          product = await Product.findOne({ name: item.name });
        }
        if (product) {
          const prevStock = product.countInStock;
          const newStock = product.countInStock - item.qty;
          
          await Product.updateOne(
            { _id: product._id },
            { $inc: { countInStock: -item.qty } }
          );

          await InventoryTransaction.create({
            product: product._id,
            type: 'ORDER',
            quantity: -item.qty,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Order #${createdOrder.orderId.split('-').pop()}`,
            referenceId: createdOrder._id,
            referenceModel: 'Order'
          });
        }
      }

      // Send SMS Notification
      try {
        if (shippingAddress && shippingAddress.phone) {
          const phoneNum = shippingAddress.phone.startsWith('+') ? shippingAddress.phone.replace('+', '') : `91${shippingAddress.phone}`;
          await sendWhatsApp({
            mobile: phoneNum,
            templateName: "order_placed",
            variables: {
              customer_name: shippingAddress.fullName || "Customer",
              order_id: createdOrder.orderId,
              amount: createdOrder.totalPrice
            }
          });
        }
      } catch (smsError) {
        console.error('Failed to send SMS confirmation:', smsError);
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay keys not configured' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send('Some error occurred');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'countInStock');

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      res.json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update order to paid
// @route   POST /api/orders/:id/verify
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      if (!order.status) {
        order.status = 'Pending';
      }
      order.paymentResult = {
        id: req.body.razorpay_payment_id || req.body.id,
        status: 'Success',
        update_time: Date.now().toString(),
        email_address: req.user.email,
      };

      const updatedOrder = await order.save();

      // Update Payment Record
      const payment = await Payment.findOne({ orderId: order._id });
      if (payment) {
        payment.status = 'Successful';
        payment.transactionId = req.body.razorpay_payment_id || req.body.id;
        payment.paidAt = Date.now();
        payment.verified = true;
        // Basic check to set gateway
        if (req.body.razorpay_payment_id) {
           payment.gateway = 'Razorpay';
        }
        await payment.save();
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      res.json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const newStatus = req.body.status || order.status;
      const selectedCourier = req.body.courierName !== undefined ? req.body.courierName : (order.courierName || '');
      
      // Delhivery Integration Block
      if (newStatus === 'Shipped' && selectedCourier === 'Delhivery' && !order.isDelhiveryCreated) {
        // Order must be in 'Ready to Ship' before creating Delhivery shipment
        if (order.status !== 'Ready to Ship') {
          return res.status(400).json({ 
            message: `The order must be in 'Ready to Ship' status before creating a Delhivery shipment. Current status: ${order.status}` 
          });
        }

        // Validate Customer Address & Pincode
        const { fullName, houseNumber, streetAddress, city, state, pincode, phone } = order.shippingAddress || {};
        if (!fullName || !city || !state || !pincode || !phone || (!houseNumber && !streetAddress)) {
          return res.status(400).json({ 
            message: "Unable to create Delhivery shipment. Missing customer address or pincode." 
          });
        }

        let totalWeight = req.body.packageWeight ? Number(req.body.packageWeight) : 0;
        let maxLength = req.body.packageLength ? Number(req.body.packageLength) : 0;
        let maxWidth = req.body.packageWidth ? Number(req.body.packageWidth) : 0;
        let totalHeight = req.body.packageHeight ? Number(req.body.packageHeight) : 0;

        if (!totalWeight || !maxLength || !maxWidth || !totalHeight) {
          return res.status(400).json({ 
            message: "Missing package dimensions. Please provide weight, length, width, and height." 
          });
        }

        // Atomic update for duplicate protection
        const lockResult = await Order.updateOne(
          { _id: order._id, isDelhiveryCreated: false },
          { $set: { isDelhiveryCreated: true } }
        );
        
        if (lockResult.modifiedCount === 0) {
          return res.status(400).json({ message: "Shipment creation is already in progress or completed for this order." });
        }

        try {
          const productsDesc = order.orderItems.map(item => item.name).join(', ');
          
          const shipmentData = {
            shipments: [
              {
                name: order.shippingAddress.fullName,
                add: `${order.shippingAddress.houseNumber || ''}, ${order.shippingAddress.streetAddress || ''}, ${order.shippingAddress.area || ''}`.trim().replace(/^,+|,+$/g, ''),
                pin: order.shippingAddress.pincode.toString(),
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                country: order.shippingAddress.country || 'India',
                phone: order.shippingAddress.phone.toString(),
                order: order.orderId || order._id.toString(),
                payment_mode: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                products_desc: productsDesc,
                cod_amount: order.paymentMethod === 'COD' ? order.totalPrice : 0,
                order_date: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
                total_amount: order.totalPrice,
                quantity: "1", 
                waybill: "", 
                shipment_width: maxWidth.toString(),
                shipment_length: maxLength.toString(),
                shipment_height: totalHeight.toString(),
                weight: totalWeight.toString()
              }
            ],
            pickup_location: {
              name: "Iraivan Angadi"
            }
          };

          const delhiveryResponse = await createDelhiveryShipment(shipmentData);

          if (delhiveryResponse.success === false) {
             throw new Error(delhiveryResponse.rmk || "Delhivery failed to create shipment.");
          }

          const waybill = (delhiveryResponse.packages && delhiveryResponse.packages.length > 0 && delhiveryResponse.packages[0].waybill) || delhiveryResponse.waybill || delhiveryResponse.upload_wbn;
          if (!waybill) {
             throw new Error(delhiveryResponse.rmk || "Delhivery did not return a valid AWB number.");
          }

          order.trackingNumber = waybill;
          order.courierName = 'Delhivery';
          order.isDelhiveryCreated = true;
          order.status = 'Shipped';
          order.pickupStatus = 'Pickup Pending'; // Actual pickup has NOT happened yet
          
          // Save the package details in the order
          order.packageDetails = {
            weight: totalWeight,
            length: maxLength,
            width: maxWidth,
            height: totalHeight
          };
          
        } catch (delhiveryError) {
          // Keep status as 'Ready to Ship', reset isDelhiveryCreated, no fake AWB
          await Order.updateOne({ _id: order._id }, { $set: { isDelhiveryCreated: false } });
          console.error("Delhivery Integration Error:", delhiveryError.message);
          return res.status(400).json({ 
            message: `Delhivery Shipment Failed: ${delhiveryError.message}` 
          });
        }
      } else if (newStatus === 'Shipped' && selectedCourier && selectedCourier !== 'Delhivery') {
        order.courierName = selectedCourier;
        order.status = 'Shipped';
      } else {
        // Enforce ownership: When Courier is Delhivery, tracking statuses cannot be set manually
        if (selectedCourier === 'Delhivery' && ['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].includes(newStatus)) {
          return res.status(400).json({ 
            message: `Status '${newStatus}' is controlled automatically by Delhivery tracking and cannot be set manually.` 
          });
        }
        order.status = newStatus;
        if (req.body.courierName) {
          order.courierName = req.body.courierName;
        }
      }
      
      if (newStatus === 'Cancelled' && !order.isStockRestored) {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            const prevStock = product.countInStock;
            product.countInStock += item.qty;
            await product.save();
            
            await InventoryTransaction.create({
              product: product._id,
              type: 'CANCEL',
              quantity: item.qty,
              previousStock: prevStock,
              newStock: product.countInStock,
              reason: `Order Cancellation #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id,
              referenceModel: 'Order',
              admin: req.user._id
            });
          }
        }
        order.isStockRestored = true;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order shipping details
// @route   PUT /api/orders/:id/shipping
// @access  Private/Admin
const updateOrderShipping = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.courierName = req.body.courierName || order.courierName;
      order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cancellation requests
// @route   GET /api/orders/cancellations
// @access  Private/Admin
const getCancellationRequests = async (req, res) => {
  try {
    const orders = await Order.find({ 'cancellationRequest.requested': true })
      .populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve cancellation
// @route   PUT /api/orders/:id/cancellation/approve
// @access  Private/Admin
const approveCancellation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = 'Cancelled';
      if (order.cancellationRequest) {
        order.cancellationRequest.status = 'Approved';
      }
      
      if (!order.isStockRestored) {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            const prevStock = product.countInStock;
            product.countInStock += item.qty;
            await product.save();
            
            await InventoryTransaction.create({
              product: product._id,
              type: 'CANCEL',
              quantity: item.qty,
              previousStock: prevStock,
              newStock: product.countInStock,
              reason: `Order Cancellation #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id,
              referenceModel: 'Order',
              admin: req.user._id
            });
          }
        }
        order.isStockRestored = true;
      }
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject cancellation
// @route   PUT /api/orders/:id/cancellation/reject
// @access  Private/Admin
const rejectCancellation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      // Revert status to previous or Pending? Usually remains Pending/Completed
      if (order.status === 'Cancellation Requested') {
        order.status = 'Pending'; 
      }
      if (order.cancellationRequest) {
        order.cancellationRequest.status = 'Rejected';
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tracking information for an order
// @route   GET /api/orders/:id/tracking
// @access  Private
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or the order owner
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view this tracking' });
    }

    if (!order.trackingNumber || order.courierName !== 'Delhivery') {
      return res.status(400).json({ message: 'Tracking not available for this order' });
    }

    // Call Delhivery API
    let trackingData;
    try {
      trackingData = await getShipmentTracking(order.trackingNumber);
    } catch (err) {
      return res.status(502).json({ message: 'Unable to fetch tracking from courier' });
    }

    if (!trackingData || !trackingData.ShipmentData || trackingData.ShipmentData.length === 0) {
      return res.json({ message: 'No tracking data found', orderId: order._id, trackingNumber: order.trackingNumber, courierName: 'Delhivery', currentStatus: order.status, trackingEvents: order.trackingEvents || [] });
    }

    const shipmentInfo = trackingData.ShipmentData[0].Shipment;
    const delhiveryStatus = shipmentInfo.Status?.Status;
    
    const events = (shipmentInfo.Scans || []).map(scan => ({
      status: scan.ScanDetail?.Scan,
      description: scan.ScanDetail?.Instructions,
      location: scan.ScanDetail?.ScannedLocation,
      timestamp: scan.ScanDetail?.ScanDateTime ? new Date(scan.ScanDetail.ScanDateTime) : null
    }));
    
    // -------------------------------------------------------
    // Proper Pickup-Aware Status Mapping
    // Shipment Created  → Shipped (pickupStatus: Pickup Pending)
    // Delhivery picks up parcel → Picked Up
    // In transit        → In Transit
    // Out for delivery  → Out for Delivery
    // Delivered         → Delivered
    // -------------------------------------------------------
    const STATUS_HIERARCHY = [
      'Pending', 'Confirmed', 'Processing', 'Ready to Ship',
      'Shipped', 'Pickup Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Completed'
    ];

    const lowerStatus = (delhiveryStatus || '').toLowerCase().trim();
    let mappedStatus = null;
    let newPickupStatus = order.pickupStatus || null;

    // Detect pickup-specific scan codes from event list
    const hasPickupScan = events.some(ev => {
      const evStatus = (ev.status || '').toLowerCase();
      return evStatus.includes('pickup') || evStatus === 'picked up' || evStatus === 'pk' || evStatus.includes('manifested');
    });

    if (lowerStatus.includes('delivered') && !lowerStatus.includes('out for delivery')) {
      mappedStatus = 'Delivered';
      newPickupStatus = 'Picked Up';
    } else if (lowerStatus.includes('out for delivery')) {
      mappedStatus = 'Out for Delivery';
      newPickupStatus = 'Picked Up';
    } else if (lowerStatus.includes('transit') || lowerStatus === 'dispatched' || lowerStatus === 'in-transit') {
      mappedStatus = 'In Transit';
      newPickupStatus = 'Picked Up';
    } else if (
      lowerStatus === 'picked up' || lowerStatus === 'pk' || lowerStatus === 'pickup done' ||
      lowerStatus.includes('picked up') || hasPickupScan
    ) {
      // Actual pickup by Delhivery courier — move to Picked Up
      mappedStatus = 'Picked Up';
      newPickupStatus = 'Picked Up';
    } else if (lowerStatus === 'pickup scheduled' || lowerStatus.includes('pickup scheduled')) {
      // Delhivery has scheduled pickup but not yet collected
      newPickupStatus = 'Pickup Scheduled';
      // Don't change order.status — still 'Shipped'
    } else if (lowerStatus === 'manifested' || lowerStatus === 'ready to ship' || lowerStatus === 'ready for pickup') {
      // Shipment manifest created but not yet picked up
      newPickupStatus = newPickupStatus || 'Pickup Pending';
    }

    // Apply forward-only status progression
    if (mappedStatus) {
      const currentIdx = STATUS_HIERARCHY.indexOf(order.status);
      const mappedIdx = STATUS_HIERARCHY.indexOf(mappedStatus);
      if (mappedIdx > currentIdx && mappedIdx !== -1 && currentIdx !== -1 &&
          order.status !== 'Completed' && order.status !== 'Cancelled') {
        order.status = mappedStatus;
      }
    }

    // Update pickupStatus only forward
    if (newPickupStatus) {
      const pickupHierarchy = ['Pickup Pending', 'Pickup Scheduled', 'Picked Up'];
      const curPickupIdx = pickupHierarchy.indexOf(order.pickupStatus);
      const newPickupIdx = pickupHierarchy.indexOf(newPickupStatus);
      if (newPickupIdx > curPickupIdx || order.pickupStatus === null) {
        order.pickupStatus = newPickupStatus;
      }
    }

    order.trackingEvents = events;
    await order.save();

    console.log(`[DELHIVERY TRACKING]\nOrder: ${order._id}\nAWB: ${order.trackingNumber}\nDelhivery Status: ${delhiveryStatus}\nMapped Status: ${mappedStatus || 'Unchanged'}\nPickup Status: ${order.pickupStatus}`);

    res.json({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      courierName: 'Delhivery',
      currentStatus: delhiveryStatus || order.status,
      orderStatus: order.status,
      pickupStatus: order.pickupStatus,
      trackingEvents: events
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  createRazorpayOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderShipping,
  getCancellationRequests,
  approveCancellation,
  rejectCancellation,
  getOrderTracking,
};
