const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');

// Since we are mocking admin auth on some routes, we might just leave them public or use existing auth middleware.
// For now, mapping directly.
router.route('/')
  .post(createContact)
  .get(getContacts); // Typically GET would be admin-protected

router.route('/:id')
  .delete(deleteContact);

router.route('/:id/status')
  .put(updateContactStatus);

module.exports = router;
