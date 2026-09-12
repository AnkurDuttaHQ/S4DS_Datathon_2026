import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB Atlas connected");

  // ==========================================
  // REMOVE NULL PAYMENT TOKENS
  // ==========================================

  const result = await mongoose.connection
    .collection("registrations")
    .updateMany(
      {
        paymentAccessToken: null,
      },
      {
        $unset: {
          paymentAccessToken: "",
        },
      }
    );

  console.log(
    "Matched documents:",
    result.matchedCount
  );

  console.log(
    "Modified documents:",
    result.modifiedCount
  );

  await mongoose.disconnect();

  console.log(
    "Payment token cleanup completed successfully."
  );
} catch (error) {
  console.error(
    "Payment token cleanup failed:",
    error
  );

  process.exit(1);
}