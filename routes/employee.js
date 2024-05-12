const express = require("express");
const router = express.Router();
const Employee = require("../model/employee");
const verifyToken = require("../controller/verifyToken");

router.post("/addEmployee", verifyToken, async (req, res) => {
  const { name, email, image, contactNo, profession, category,description } = req.body;
  try {
    const employee = new Employee({
      name,
      email,
      image,
      contactNo,
      profession,
      category,
      description
    });
    const result = await employee.save();
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Employee added Successfully",
    });
  } catch (error) {
    // console.log(error, "ERR");
    res.status(400).send({ status: "error", message: "Something went wrong" });
  }
});

router.get("/getEmployees", verifyToken, async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query; // Default to page 1 and 10 items per page
    const skip = (page - 1) * perPage;
    const employeeCount = await Employee.countDocuments();
    const employees = await Employee.find()
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .skip(skip)
      .limit(perPage);
      res.status(200).send({
        data: employees,
        totalItems: employeeCount,
        currentPage: page,
        totalPages: Math.ceil(employeeCount / perPage),
        status: "ok",
      });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.post("/getEmployeesbyCategory", async (req, res) => {
  try {
    const { category } = req.body;
    const result = await Employee.find({ category: category });
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});
// router.get("/getAllBanners", verifyToken, async (req, res) => {
//   const { page = 1, perPage = 10 } = req.query; // Default to page 1 and 10 items per page

//   try {
//     const skip = (page - 1) * perPage;
//     const productCount = await Banner.countDocuments();
//     const products = await Banner.find()
//       .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//       .skip(skip)
//       .limit(perPage);

//     res.status(200).send({
//       data: products,
//       totalItems: productCount,
//       currentPage: page,
//       totalPages: Math.ceil(productCount / perPage),
//       status: "ok",
//     });
//   } catch (error) {
//     res.status(400).send({ message: "Something went wrong", status: "error" });
//   }
// });

router.delete("/deleteEmployee/:id", verifyToken, async (req, res) => {
  try {
    const result = await Employee.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Employee deleted Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.put("/updateEmployee/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Employee Updated Successfully",
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
