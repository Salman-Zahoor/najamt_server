const mongoose = require("mongoose");

const Bookings = new mongoose.Schema(
  {
    email: { type: String, required: true },
    serviceId: { type: String, required: true },
    date: { type: String, required: true },
    serviceDate: { type: String, required: true },
    serviceTime: { type: String, required: true },
    price:{type:String,required:true},
    employeeId:{type:String,reuired:true},
    address:{type:String,reuired:true},
    status:{type:String,defualt:"Pending"},
    phone:{type:String,reuired:true},
    name:{type:String,reuired:true},
  },
  {
    collection: "Bookings",
  }
);

const model = mongoose.model("Bookings", Bookings);

module.exports = model;
