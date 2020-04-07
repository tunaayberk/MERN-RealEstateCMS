const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });

exports.getCount = Model =>
  catchAsync(async (req, res, next) => {
    let query = Model.estimatedDocumentCount();
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      count: doc
    });
  });

exports.getCountRentSale = Model =>
  catchAsync(async (req, res, next) => {
    let queryMain = Model.estimatedDocumentCount();
    let query = Model.aggregate([
      { $match: { 'basic.status': 'rent' } },
      {
        $count: 'rent'
      }
    ]);
    let query2 = Model.aggregate([
      { $match: { 'basic.status': 'sale' } },
      {
        $count: 'sale'
      }
    ]);
    const main = await queryMain;
    const doc = await query;
    const doc2 = await query2;

    if (!doc) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      all: main,
      rent: doc[0].rent,
      sale: doc2[0].sale
    });
  });

exports.getOneWithUrl = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ url: req.params.url });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
