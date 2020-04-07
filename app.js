const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//WILL BE DELETED ROUTES STARTS
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//WILL BE DELETED ROUTES ENDS

//REAL ESTATE ROUTES STARTS
const propertyRouter = require('./routes/propertyRoutes');
//REAL ESTATE ROUTES ENDS

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));
app.use('/staticDash', express.static(`${__dirname}/dashboard/staticDash`));

app.use('/', express.static(`${__dirname}/client`));

app.use('/dashboard', express.static(`${__dirname}/dashboard`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/properties', propertyRouter);

app.get('/dashboard/*', (req, res) => {
  res.sendFile(`${__dirname}/dashboard/index.html`);
});

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
});

app.use(globalErrorHandler);

module.exports = app;
