import mongoose from "mongoose";

// ==========================================
// SOCIETY PROOF SCHEMA
// ==========================================

const societyProofSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: null,
    },

    publicId: {
      type: String,
      default: null,
    },

    fileType: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// MEMBER SCHEMA
// ==========================================

const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    college: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    s4dsMember: {
      type: Boolean,
      required: true,
    },

    verifiedS4dsMember: {
      type: Boolean,
      default: null,
    },

    societyProof: {
      type: societyProofSchema,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// LEAD SCHEMA
// ==========================================

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    college: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    s4dsMember: {
      type: Boolean,
      required: true,
    },

    verifiedS4dsMember: {
      type: Boolean,
      default: null,
    },

    societyProof: {
      type: societyProofSchema,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// PAYMENT SCHEMA
// ==========================================

const paymentSchema = new mongoose.Schema(
  {
    required: {
      type: Boolean,
      required: true,
      default: false,
    },

    amount: {
      type: Number,
      enum: [0, 100],
      required: true,
      default: 0,
    },

    utr: {
      type: String,
      default: null,
    },

    screenshotUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "NOT_REQUIRED",
        "REQUIRED",
        "SUBMITTED",
        "VERIFIED",
        "REJECTED",
      ],
      default: "NOT_REQUIRED",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// ADMIN REVIEW SCHEMA
// ==========================================

const adminReviewSchema = new mongoose.Schema(
  {
    decision: {
      type: String,
      enum: [
        "APPROVE",
        "PAYMENT_REQUIRED",
        "REJECT",
      ],
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// REGISTRATION SCHEMA
// ==========================================

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    team: {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
    },

    lead: {
      type: leadSchema,
      required: true,
    },

    members: {
      type: [memberSchema],
      required: true,

      validate: {
        validator: function (members) {
          return members.length === 3;
        },

        message:
          "Team must have exactly 3 additional members",
      },
    },

    fee: {
      type: Number,
      enum: [0, 100],
      required: true,
      default: 0,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    // ========================================
    // PAYMENT ACCESS TOKEN
    // ========================================
    // IMPORTANT:
    // Use undefined instead of null.
    // This works correctly with sparse + unique
    // MongoDB index.
    // ========================================

    paymentAccessToken: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    adminReview: {
      type: adminReviewSchema,
      required: true,
    },

    status: {
      type: String,

      enum: [
        "UNDER_VERIFICATION",
        "PAYMENT_REQUIRED",
        "PAYMENT_SUBMITTED",
        "APPROVED",
        "REJECTED",
      ],

      default: "UNDER_VERIFICATION",

      required: true,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    eventPass: {
      passUrl: {
        type: String,
        default: null,
      },

      qrCode: {
        type: String,
        default: null,
      },

      generatedAt: {
        type: Date,
        default: null,
      },
    },
  },

  {
    timestamps: true,
  }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

export default Registration;