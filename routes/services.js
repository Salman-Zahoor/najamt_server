const express = require("express");
const router = express.Router();
const Services = require("../model/services");
const verifyToken = require("../controller/verifyToken");

router.post("/addService", verifyToken, async (req, res) => {
  const { name, image, description, price, category, date, discount, faqs } =
    req.body;
  try {
    const employee = new Services({
      name,
      image,
      description,
      price,
      category,
      date,
      discount,
      faqs,
    });
    const result = await employee.save();
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Service added Successfully",
    });
  } catch (error) {
    // console.log(error, "ERR");
    res.status(400).send({ status: "error", message: "Something went wrong" });
  }
});

router.get("/getAllServices", verifyToken, async (req, res) => {
  try {
    const result = await Services.find();
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.get("/getAllServicesUser", async (req, res) => {
  try {
    const result = await Services.find();
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.post("/getServicesbyCategory", async (req, res) => {
  try {
    const { category } = req.body;
    const result = await Services.find({ category: category });
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.post("/getServiceDetailsById/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Services.findOne({ _id: id });
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.delete("/deleteService/:id", verifyToken, async (req, res) => {
  try {
    const result = await Services.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Service deleted Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.put("/updateService/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Services.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Service Updated Successfully",
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
