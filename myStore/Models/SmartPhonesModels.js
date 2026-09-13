
const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// SLUG GENERATOR
// ==========================================
const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ==========================================
// COLOR SCHEMA
// ==========================================
const ColorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Example: #000000
    hexCode: {
      type: String,
      trim: true,
      default: "#000000",
    },

    // Optional color-specific image
    image: {
      type: String,
      trim: true,
    },

    // Optional color-specific stock
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

// ==========================================
// MOBILE SCHEMA
// ==========================================
const MobileSchema = new Schema(
  {
    // --------------------------------------
    // BASIC INFORMATION
    // --------------------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Mobile",
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // PRICING
    // --------------------------------------
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Original price / MRP
    mrp: {
      type: Number,
      min: 0,
    },

    // Sale price
    salePrice: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "NPR",
      trim: true,
    },

    // --------------------------------------
    // SALE / CLEARANCE
    // --------------------------------------

    // If true, product automatically appears
    // in the showroom clearance section.
    addToSale: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Optional sale label
    saleLabel: {
      type: String,
      trim: true,
      default: "Clearance Sale",
    },

    // Optional sale percentage
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // --------------------------------------
    // FEATURED PRODUCT
    // --------------------------------------

    // If true, product automatically appears
    // in the featured products section.
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Optional featured priority
    featuredOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------
    // IMAGES
    // --------------------------------------

    // Main product image
    image: {
      type: String,
      trim: true,
    },

    // Multiple product images
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // --------------------------------------
    // MOBILE SPECIFICATIONS
    // --------------------------------------

    ram: {
      type: Number,
      min: 0,
    },

    storage: {
      type: Number,
      min: 0,
    },

    // Example: 5000 mAh
    battery: {
      type: String,
      trim: true,
    },

    // Example: 50 MP
    camera: {
      type: Number,
      min: 0,
    },

    // Front camera
    frontCamera: {
      type: Number,
      min: 0,
    },

    processor: {
      type: String,
      trim: true,
    },

    chipset: {
      type: String,
      trim: true,
    },

    display: {
      type: String,
      trim: true,
    },

    displayType: {
      type: String,
      trim: true,
    },

    refreshRate: {
      type: Number,
      min: 0,
    },

    screenSize: {
      type: Number,
      min: 0,
    },

    resolution: {
      type: String,
      trim: true,
    },

    operatingSystem: {
      type: String,
      trim: true,
    },

    androidVersion: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // MULTIPLE COLORS
    // --------------------------------------

    colors: {
      type: [ColorSchema],
      default: [],
    },

    // --------------------------------------
    // NETWORK & CONNECTIVITY
    // --------------------------------------

    network: {
      type: String,
      trim: true,
    },

    simType: {
      type: String,
      trim: true,
    },

    dualSim: {
      type: Boolean,
      default: false,
    },

    fiveG: {
      type: Boolean,
      default: false,
    },

    wifi: {
      type: String,
      trim: true,
    },

    bluetooth: {
      type: String,
      trim: true,
    },

    nfc: {
      type: Boolean,
      default: false,
    },

    usbType: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // DESIGN & BUILD
    // --------------------------------------

    weight: {
      type: String,
      trim: true,
    },

    dimensions: {
      type: String,
      trim: true,
    },

    buildMaterial: {
      type: String,
      trim: true,
    },

    waterResistance: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // BATTERY & CHARGING
    // --------------------------------------

    charging: {
      type: String,
      trim: true,
    },

    wirelessCharging: {
      type: Boolean,
      default: false,
    },

    fastCharging: {
      type: Boolean,
      default: false,
    },

    chargerIncluded: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------
    // MEMORY & STORAGE
    // --------------------------------------

    expandableStorage: {
      type: Boolean,
      default: false,
    },

    storageType: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // SECURITY & FEATURES
    // --------------------------------------

    fingerprint: {
      type: String,
      trim: true,
    },

    faceUnlock: {
      type: Boolean,
      default: false,
    },

    stereoSpeakers: {
      type: Boolean,
      default: false,
    },

    headphoneJack: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------
    // RELEASE INFORMATION
    // --------------------------------------

    releaseDate: {
      type: String,
      trim: true,
    },

    warranty: {
      type: String,
      trim: true,
    },

    warrantyType: {
      type: String,
      trim: true,
    },

    // --------------------------------------
    // INVENTORY
    // --------------------------------------

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    availability: {
      type: String,
      enum: [
        "In Stock",
        "Out of Stock",
        "Pre-Order",
        "Coming Soon",
      ],
      default: "In Stock",
      index: true,
    },

    // --------------------------------------
    // PRODUCT STATUS
    // --------------------------------------

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // --------------------------------------
    // SEO
    // --------------------------------------

    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// AUTOMATIC SLUG
// ==========================================
MobileSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = toSlug(
      `${this.name}-${this.model || ""}`
    );
  }

  next();
});

// ==========================================
// AUTOMATIC SALE CALCULATION
// ==========================================
MobileSchema.pre("validate", function (next) {
  if (
    this.addToSale &&
    this.mrp &&
    this.salePrice &&
    this.mrp > this.salePrice
  ) {
    this.discountPercentage = Math.round(
      ((this.mrp - this.salePrice) / this.mrp) * 100
    );
  }

  next();
});

// ==========================================
// INDEXES
// ==========================================

MobileSchema.index({ createdAt: -1 });

MobileSchema.index({
  brand: 1,
  createdAt: -1,
});

MobileSchema.index({
  price: 1,
});

MobileSchema.index({
  category: 1,
});

MobileSchema.index({
  isFeatured: 1,
  featuredOrder: 1,
  createdAt: -1,
});

MobileSchema.index({
  addToSale: 1,
  createdAt: -1,
});

MobileSchema.index({
  name: "text",
  brand: "text",
  model: "text",
  description: "text",
});

// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(
  "Mobile",
  MobileSchema
);