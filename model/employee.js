const mongoose = require("mongoose");

const Employee = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role:{type:String,default:"Employee"},
    image:{type: String, required: true},
    contactNo:{type: String, required: true},
    profession:{type: String, required: true},
    category:{type:String,required:true},
    description:{type: String, required: true},
  },
  {
    collection: "Employee",
  }
);

const model = mongoose.model("Employee", Employee);

module.exports = model;
