const Property = require('./../models/propertyModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPropertyImages = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'gallery', maxCount: 3 }
]);

exports.resizePropertyImages = catchAsync(async (req, res, next) => {
  if (!Object.keys(req).includes('files')) return next();

  if (!req.files.mainImage || !req.files.gallery) return next();
  // 1) Cover image
  req.body.mainImage = `property-${req.params.id}-${Date.now()}-mainImage.jpeg`;
  await sharp(req.files.mainImage[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/properties/${req.body.mainImage}`);

  // 2) Images
  req.body.gallery = [];

  await Promise.all(
    req.files.gallery.map(async (file, i) => {
      const filename = `properties-${req.params.id}-${Date.now()}-${i +
        1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/properties/gallery/${filename}`);

      req.body.gallery.push(filename);
    })
  );

  next();
});

exports.getAllProperties = factory.getAll(Property);
exports.getProperty = factory.getOne(Property);
exports.createProperty = factory.createOne(Property);
exports.updateProperty = factory.updateOne(Property);
exports.deleteProperty = factory.deleteOne(Property);
exports.countProperty = factory.getCount(Property);
exports.countRentSaleProperty = factory.getCountRentSale(Property);
exports.getPropertyWithUrl = factory.getOneWithUrl(Property);

exports.getAllPropertiesOfUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    next(new AppError('Please provide User ID', 400));
  }

  const properties = await Property.find({
    agent: { _id: userId }
  });

  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: {
      data: properties
    }
  });
});
