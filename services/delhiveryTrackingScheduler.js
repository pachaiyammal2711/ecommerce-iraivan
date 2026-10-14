/**
 * Delhivery Tracking Sync Scheduler
 * Runs every 30 minutes. Finds active Delhivery orders, fetches
 * live status and applies forward-only status progression.
 *
 * Pickup lifecycle:
 *   Shipped (AWB created)  -> pickupStatus: Pickup Pending   [NOT yet picked up]
 *   Pickup scheduled       -> pickupStatus: Pickup Scheduled
 *   Delhivery picks up     -> status: Picked Up, pickupStatus: Picked Up
 *   In transit             -> status: In Transit
 *   Out for delivery       -> status: Out for Delivery
 *   Delivered              -> status: Delivered
 *
 * DO NOT map manifested/ready-to-ship -> In Transit directly.
 * DO NOT skip the Picked Up stage.
 */

const Order = require('../models/orderModel');
const { getShipmentTracking } = require('./delhiveryService');

const STATUS_HIERARCHY = [
  'Pending',
  'Confirmed',
  'Processing',
  'Ready to Ship',
  'Shipped',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Completed'
];

const PICKUP_HIERARCHY = ['Pickup Pending', 'Pickup Scheduled', 'Picked Up'];

/**
 * Map Delhivery status string + scan events to app statuses.
 * Returns { mappedStatus, newPickupStatus }
 */
const mapDelhiveryStatus = (delhiveryStatus, events) => {
  const lowerStatus = (delhiveryStatus || '').toLowerCase().trim();
  let mappedStatus = null;
  let newPickupStatus = null;

  // Detect physical pickup from scan event codes
  const hasPickupScan = (events || []).some(ev => {
    const evStatus = (ev.status || '').toLowerCase();
    return (
      evStatus === 'picked up' || evStatus === 'pk' ||
      evStatus.includes('picked up') || evStatus === 'pickup done' ||
      evStatus.includes('manifested')
    );
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
    // Courier physically collected the parcel
    mappedStatus = 'Picked Up';
    newPickupStatus = 'Picked Up';
  } else if (lowerStatus === 'pickup scheduled' || lowerStatus.includes('pickup scheduled')) {
    // Pickup is scheduled but NOT yet collected
    newPickupStatus = 'Pickup Scheduled'; // order.status stays 'Shipped'
  } else if (lowerStatus === 'manifested' || lowerStatus === 'ready to ship' || lowerStatus === 'ready for pickup') {
    // Manifest created / label printed — NOT yet collected
    newPickupStatus = 'Pickup Pending'; // order.status stays 'Shipped'
  }

  return { mappedStatus, newPickupStatus };
};

const syncDelhiveryTracking = async () => {
  try {
    const activeOrders = await Order.find({
      courierName: 'Delhivery',
      trackingNumber: { $exists: true, $ne: null },
      status: { $nin: ['Delivered', 'Completed', 'Cancelled'] }
    });

    if (activeOrders.length === 0) return;

    console.log(`[DELHIVERY SYNC] Syncing ${activeOrders.length} active Delhivery order(s)...`);

    for (const order of activeOrders) {
      try {
        const trackingData = await getShipmentTracking(order.trackingNumber);
        if (!trackingData || !trackingData.ShipmentData || trackingData.ShipmentData.length === 0) continue;

        const shipmentInfo = trackingData.ShipmentData[0].Shipment;
        const delhiveryStatus = shipmentInfo.Status?.Status;
        if (!delhiveryStatus) continue;

        const events = (shipmentInfo.Scans || []).map(scan => ({
          status: scan.ScanDetail?.Scan,
          description: scan.ScanDetail?.Instructions,
          location: scan.ScanDetail?.ScannedLocation,
          timestamp: scan.ScanDetail?.ScanDateTime ? new Date(scan.ScanDetail.ScanDateTime) : null
        }));

        const { mappedStatus, newPickupStatus } = mapDelhiveryStatus(delhiveryStatus, events);

        let statusChanged = false;

        // Forward-only main status progression
        if (mappedStatus) {
          const currentIdx = STATUS_HIERARCHY.indexOf(order.status);
          const mappedIdx = STATUS_HIERARCHY.indexOf(mappedStatus);
          if (mappedIdx > currentIdx && mappedIdx !== -1 && currentIdx !== -1) {
            order.status = mappedStatus;
            statusChanged = true;
          }
        }

        // Forward-only pickupStatus progression
        if (newPickupStatus) {
          const curPickupIdx = PICKUP_HIERARCHY.indexOf(order.pickupStatus);
          const newPickupIdx = PICKUP_HIERARCHY.indexOf(newPickupStatus);
          if (newPickupIdx > curPickupIdx || order.pickupStatus == null) {
            order.pickupStatus = newPickupStatus;
            statusChanged = true;
          }
        }

        order.trackingEvents = events;
        await order.save();

        console.log(
          `[DELHIVERY SYNC] Order: ${order._id} | AWB: ${order.trackingNumber}` +
          ` | Delhivery: "${delhiveryStatus}" | Status: ${order.status}` +
          ` | Pickup: ${order.pickupStatus || 'N/A'} | Changed: ${statusChanged}`
        );
      } catch (orderErr) {
        console.error(`[DELHIVERY SYNC] Failed for order ${order._id}:`, orderErr.message);
      }
    }

    console.log('[DELHIVERY SYNC] Sync complete.');
  } catch (err) {
    console.error('[DELHIVERY SYNC] Scheduler error:', err.message);
  }
};

const startDelhiveryTrackingSync = () => {
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  console.log('[DELHIVERY SYNC] Scheduler started - syncs every 30 minutes.');
  setTimeout(() => { syncDelhiveryTracking(); }, 10000);
  setInterval(() => { syncDelhiveryTracking(); }, INTERVAL_MS);
};

module.exports = { startDelhiveryTrackingSync, syncDelhiveryTracking };
