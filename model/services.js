const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    priceOptions:{type:Array,default:[]},
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // Reference to Category schema
    date: { type: String },
    date: { type: String},
    isShow: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    noOfBookings: { type: Number, defalut: 0 },
    faqs:{type:Array,default:[]},
    features:{type:Array,default:[]},
  },
  {
    collection: "Services",
  }
);

const model = mongoose.model("Services", ServicesSchema);

module.exports = model;