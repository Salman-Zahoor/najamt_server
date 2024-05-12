const express = require("express");
const router = express.Router();
const Banner = require("../model/banners");
const verifyToken = require("../controller/verifyToken");

router.post("/addBanner",verifyToken,async (req, res) => {
  const { bannerUrl } = req.body;
  try {
    const banner = new Banner({
        bannerUrl,
    });
    const result = await banner.save();
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Banner Image added Successfully",
    });
  } catch (error) {
    console.log(error, "ERR");
    res.status(400).send({ status: "error", message: "Something went wrong" });
  }
});


router.get("/getBanners",async (req, res) => {
  try {
    const result = await Banner.find()
    res.status(200).send({ data: result.reverse(), status: "ok" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.get("/getAllBanners", verifyToken, async (req, res) => {
  const { page = 1, perPage = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const skip = (page - 1) * perPage;
    const productCount = await Banner.countDocuments();
    const products = await Banner.find()
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .skip(skip)
      .limit(perPage);

    res.status(200).send({
      data: products,
      totalItems: productCount,
      currentPage: page,
      totalPages: Math.ceil(productCount / perPage),
      status: "ok",
    });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong", status: "error" });
  }
});


router.delete("/deleteBanner/:id", verifyToken,async (req, res) => {
  try {
    const result = await Banner.findByIdAndDelete({ _id: req.params.id })
    res.status(200).send({
        data: result,
        status: "ok",
        message: "Banner deleted Successfully",
      });
  } catch (error) {
    res.status(400).send({
        status: "error",
        message: "Something went wrong",
      });
  }
});

module.exports = router;
