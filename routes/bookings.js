const express = require("express");
const router = express.Router();
const Bookings = require("../model/bookings");
const verifyToken = require("../controller/verifyToken");

router.post("/addBooking", async (req, res) => {
  const {
    bookingId,
    email,
    serviceId,
    date,
    serviceDate,
    serviceTime,
    price,
    employeeId,
    address,
    status,
    phone,
    name,
    autoAssign,
  } = req.body;
  try {
    const employee = new Bookings({
      bookingId,
      name,
      email,
      serviceId,
      date,
      serviceDate,
      serviceTime,
      price,
      employeeId,
      address,
      status,
      phone,
      name,
    });
    const result = await employee.save();
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Booking added Successfully",
    });
  } catch (error) {
    // console.log(error, "ERR");
    res.status(400).send({ status: "error", message: "Something went wrong" });
  }
});

router.get("/getAllBookings", verifyToken, async (req, res) => {
  try {
    const result = await Bookings.find();
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.post("/getSBookingDetailsById/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Bookings.findOne({ _id: id });
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.delete("/deleteBooking/:id", verifyToken, async (req, res) => {
  try {
    const result = await Bookings.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Booking deleted Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.put("/updateBooking/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Bookings.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Booking Updated Successfully",
    });
  } catch (error) {
    //   console.log(error, "ERR");
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});
module.exports = router;
