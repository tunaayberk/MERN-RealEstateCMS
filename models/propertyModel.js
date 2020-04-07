const mongoose = require('mongoose');
const slugify = require('slugify');

const propertySchema = new mongoose.Schema(
  {
    url: String,
    title: {
      type: String,
      required: [true, 'A property must have a title'],
      unique: true,
      trim: true,
      maxlength: [
        200,
        'A property title must have less or equal then 100 characters'
      ],
      minlength: [
        10,
        'A property title must have more or equal then 10 characters'
      ]
    },
    basic: {
      status: {
        type: String,
        required: [true, 'A property must have a status'],
        enum: {
          values: ['rent', 'sale'],
          message: 'Property Status is either: rent, sale'
        }
      },
      propertyType: {
        type: String,
        enum: {
          values: ['Houses', 'Apartment', 'Villas', 'Commercial', 'Offices'],
          message:
            'Property Type is either: Houses, Apartment, Villas, Commercial, Offices'
        }
      },
      price: Number,
      sqft: Number,
      bedrooms: Number,
      bathrooms: Number
    },
    homeFeatured: {
      type: Boolean,
      default: false
    },
    sidebarFeatured: {
      type: Boolean,
      default: false
    },
    expirationDay: {
      type: Date,
      default:
        Date.now() + process.env.EXPIRATION_DAY_PROPERTY * 24 * 60 * 60 * 1000
    },
    mainImage: {
      type: String,
      default: 'defaultMainImage.jpg'
    },
    gallery: {
      type: Array,
      default: ['defaultGalleryImage.jpg']
    },
    location: {
      address: {
        type: String,
        required: [true, 'A property must have a address']
      },
      city: String,
      state: String,
      zipCode: String
    },
    detailedInfo: {
      description: String,
      buildingAge: Number,
      garage: Number,
      rooms: Number,
      otherFeatures: {
        internet: {
          type: Boolean,
          default: false
        },
        beach: {
          type: Boolean,
          default: false
        },
        balcony: {
          type: Boolean,
          default: false
        },
        airCondition: {
          type: Boolean,
          default: false
        },
        terrace: {
          type: Boolean,
          default: false
        },
        heating: {
          type: Boolean,
          default: false
        },
        wifi: {
          type: Boolean,
          default: false
        },
        parking: {
          type: Boolean,
          default: false
        },
        icon: {
          type: Boolean,
          default: false
        },
        smokingAllow: {
          type: Boolean,
          default: false
        },
        microwave: {
          type: Boolean,
          default: false
        },
        bedding: {
          type: Boolean,
          default: false
        }
      }
    },
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
propertySchema.pre('save', function(next) {
  this.url = slugify(this.title, { lower: true });
  this.mainImage = `${slugify(this.title, { lower: true })}.jpg`;
  next();
});

//QUERY MIDDLEWARE

propertySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'agent',
    select: '-__v -passwordChangedAt'
  });

  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
