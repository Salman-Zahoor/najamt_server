const express = require("express");
const router = express.Router();
const Category = require("../model/category");
const verifyToken = require("../controller/verifyToken");

router.post("/createCategory",verifyToken,async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({
      name,
    });
    const result = await category.save();
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Category Created Successfully",
    });
  } catch (error) {
    console.log(error, "ERR");
    res.status(400).send({ status: "error", message: "Something went wrong" });
  }
});


router.get("/getCategory",async (req, res) => {
  try {
    const result = await Category.find().sort({createdAt: -1 });
    res.status(200).send({ data: result, status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.get("/getAllCategories", verifyToken, async (req, res) => {
  const { page = 1, perPage = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const skip = (page - 1) * perPage;
    const productCount = await Category.countDocuments();
    const products = await Category.find()
      .skip(skip)
      .limit(perPage);

    res.status(200).send({
      data: products.reverse(),
      totalItems: productCount,
      currentPage:  page,
      totalPages: Math.ceil(productCount / perPage),
      status: "ok",
    }); 
  } catch (error) {
    res.status(400).send({ message: "Something went wrong", status: "error" });
  }
});

router.put("/updateCategory/:id", verifyToken,async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Category Updated Successfully",
    });
  } catch (error) {
    console.log(error, "ERR");
    res.status(400).send({
        status: "error",
        message: "Something went wrong",
      });
  }
});

// router.delete("/deleteCategories",async (req, res) => {
//   try {
//     const result=await Category.deleteMany()
//     res.status(200).send({
//       status: "ok",
//       message: "Category Deleted Successfully",
//     });
//   } catch (error) {
//     res.status(400).send({
//         status: "error",
//         message: "Something went wrong",
//       });
//   }
// });
router.delete("/deleteCategory/:id", verifyToken,async (req, res) => {
  try {
    if (req.params.id) {
      const result =await Category.deleteMany({ _id: req.params.id })
    //   console.log(result,"resulttttttttttttttt");
      res.status(200).send({
       status: "ok",
       message: "Category Deleted Successfully",
     });
    }else{
      res.status(400).send({
        status: "error",
        message: "Category not found",
      });
    }
  
  } catch (error) {
    res.status(400).send({
        status: "error",
        message: "Something went wrong",
      });
  }
});

module.exports = router;
