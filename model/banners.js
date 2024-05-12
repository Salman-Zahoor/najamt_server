const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    bannerUrl: { type: String, required: true },
  },
  {
    collection: "Banners",
  }
);

const model = mongoose.model("Banners", BannerSchema);

module.exports = model;
