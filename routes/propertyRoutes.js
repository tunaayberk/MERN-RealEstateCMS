const express = require('express');
const propertyController = require('./../controllers/propertyController ');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.route('/countRentSale').get(propertyController.countRentSaleProperty);

router.route('/count').get(propertyController.countProperty);

router.route('/url/:url').get(propertyController.getPropertyWithUrl);

router
  .route('/user/:userId')
  .get(authController.protect, propertyController.getAllPropertiesOfUser);

router
  .route('/')
  .get(propertyController.getAllProperties)
  .post(
    //authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    propertyController.createProperty
  );

router
  .route('/:id')
  .get(propertyController.getProperty)
  .patch(
    //authController.protect,
    //authController.restrictTo('admin', 'lead-guide'),
    propertyController.uploadPropertyImages,
    propertyController.resizePropertyImages,
    propertyController.updateProperty
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    propertyController.deleteProperty
  );

module.exports = router;
