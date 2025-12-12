const cron = require("node-cron");
const Product = require("../models/Product");

/**
 * Cron job to update auction status for expired products
 * Runs every minute to check for products that have passed their endTime
 * Status changes: active -> pending
 */
const startAuctionStatusJob = () => {
  // Run every minute: "* * * * *"
  // Run every 5 minutes: "*/5 * * * *"
  // Run every 10 minutes "*/10 * * * *"
  // Run every hour: "0 * * * *"
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

      // Find all products where endTime has passed and status is still "active"
      const result = await Product.updateMany(
        {
          "auction.endTime": { $lt: now },
          "auction.status": "active",
        },
        {
          $set: {
            "auction.status": "pending",
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[${now.toISOString()}] Cron Job: Updated ${
            result.modifiedCount
          } expired auction(s) from "active" to "pending"`
        );
      }
    } catch (error) {
      console.error(
        "[Auction Status Job] Error updating expired auctions:",
        error.message
      );
    }
  });

  console.log("Auction status cron job started.");
};

module.exports = startAuctionStatusJob;
