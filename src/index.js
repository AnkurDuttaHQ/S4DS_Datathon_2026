import express from "express";
import dotenv from "dotenv";
import testEmailRoutes from "./routes/test-email.routes.js";
import connectDB from "./config/db.js";
import cors from 'cors';
import paymentPageRoutes from "./routes/payment-page.routes.js";
import registrationrouter from "./routes/registration.routes.js";
import capacityRoute from "./routes/capacity.routes.js";
import adminrouter from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import checkInRoutes from "./routes/check-in.routes.js";
import eventPassRoutes from "./routes/event-pass.routes.js";

dotenv.config();

connectDB();


const app = express();

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "S4DS Datathon API is running",
  });
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

// ==========================================
// REGISTRATION
// ==========================================

app.use(
  "/api/registration",
  registrationrouter
);


// ==========================================
// CAPACITY
// ==========================================

app.use(
  "/api/capacity",
  capacityRoute
);


// ==========================================
// ADMIN
// ==========================================

app.use(
  "/api/admin",
  adminrouter
);


// ==========================================
// PAYMENT SUBMISSION
// ==========================================

app.use(
  "/api/payment",
  paymentRoutes
);


// ==========================================
// SECURE PAYMENT PAGE DATA
// ==========================================

app.use(
  "/api/payment",
  paymentPageRoutes
);

// check in 

app.use(
  "/api/check-in",
  checkInRoutes
);

app.use(
  "/api/event-pass",
  eventPassRoutes
);

app.use("/api/test-email", testEmailRoutes);
// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `Server is running on PORT ${PORT}`
  );

});