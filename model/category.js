const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    collection: "Category",
  }
);

const model = mongoose.model("Category", CategorySchema);

module.exports = model;
