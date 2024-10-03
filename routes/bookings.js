const express = require("express");
const router = express.Router();
const Bookings = require("../model/bookings");
const Employees = require("../model/employee");
const verifyToken = require("../controller/verifyToken");

async function findFreeEmployee(serviceDate, serviceTime) {
  try {
    // Find all employees who are not booked at the given date and time
    const availableEmployees = await Employees.find({
      _id: {
        $nin: await Bookings.find({
          serviceDate,
          serviceTime
        }).distinct('employeeId')
      }
    });

    // Return the first available employee, or null if none are available
    return availableEmployees.length > 0 ? availableEmployees[0] : null;
  } catch (error) {
    console.error('Error in findFreeEmployee:', error);
    throw new Error('Error while finding a free employee.');
  }
}


router.post("/checkBooking", async (req, res) => {
  try {
    // Destructure the required fields from req.body
    const { selectedTime, employeeId, autoAssign } = req.body;
    console.log(req.body, "reqqq");

    // Convert selectedTime string to a Date object
    const selectedDateTime = new Date(selectedTime);

    // Define time boundaries for the check (+/- 30 minutes)
    const timeBefore = new Date(selectedDateTime.getTime() - 30 * 60000);
    const timeAfter = new Date(selectedDateTime.getTime() + 30 * 60000);

    let booking;

    if (autoAssign) {
      // Find any bookings within the specified date and time range
      booking = await Bookings.findOne({
        serviceDate: selectedDateTime.toISOString().split("T")[0],
        serviceTime: {
          $gte: timeBefore.toISOString().split("T")[1].slice(0, 5),
          $lte: timeAfter.toISOString().split("T")[1].slice(0, 5),
        },
      });

      if (booking) {
        return res.status(400).json({ error: "No available employees at the selected time." });
      }

      // Find a free employee based on the given date and time
      const freeEmployee = await findFreeEmployee(
        selectedDateTime.toISOString().split("T")[0],
        selectedDateTime.toISOString().split("T")[1].slice(0, 5)
      );

      if (freeEmployee) {
        return res.status(200).json({
          message: "Employee auto-assigned successfully.",
          employeeId: freeEmployee._id,
        });
      } else {
        return res.status(400).json({ error: "No employees available for auto-assignment." });
      }
    } else {
      // Check for existing bookings for the selected employee within the time boundaries
      booking = await Bookings.findOne({
        employeeId,
        serviceDate: selectedDateTime.toISOString().split("T")[0], // Extract date part
        serviceTime: {
          $gte: timeBefore.toISOString().split("T")[1].slice(0, 5),
          $lte: timeAfter.toISOString().split("T")[1].slice(0, 5),
        },
      });

      if (booking) {
        return res.status(400).json({
          error: "Booking already exists within 30 minutes of the selected time.",
        });
      }

      return res.status(200).json({ message: "No conflicting booking found. Proceed with booking." });
    }
  } catch (error) {
    console.log(error, "error========>");
    return res.status(500).json({ error: "An error occurred while checking bookings." });
  }
});


// router.post("/checkBooking", async (req, res) => {
//   try {
//     const { selectedTime, selectedDate, employeeId, autoAssign } = req.body;

//     // Convert selectedTime to a Date object
//     const selectedTimeDate = new Date(`${selectedDate}T${selectedTime}`);

//     // Define time boundaries for the check (+/- 30 minutes)
//     const timeBefore = new Date(selectedTimeDate.getTime() - 30 * 60000);
//     const timeAfter = new Date(selectedTimeDate.getTime() + 30 * 60000);

//     let booking;

//     if (autoAssign) {
//       // Find an employee who is free at the selected time
//       booking = await Bookings.findOne({
//         serviceDate: selectedDate,
//         serviceTime: {
//           $gte: timeBefore.toISOString().split("T")[1].slice(0, 5),
//           $lte: timeAfter.toISOString().split("T")[1].slice(0, 5),
//         },
//       });

//       if (booking) {
//         return res
//           .status(400)
//           .json({ error: "No available employees at the selected time." });
//       }

//       // Logic to assign a free employee
//       const freeEmployee = await findFreeEmployee(selectedDate, selectedTime);
//       if (freeEmployee) {
//         return res
//           .status(200)
//           .json({
//             message: "Employee auto-assigned successfully.",
//             employeeId: freeEmployee._id,
//           });
//       } else {
//         return res
//           .status(400)
//           .json({ error: "No employees available for auto-assignment." });
//       }
//     } else {
//       // Check for existing bookings for the selected employee within the time boundaries
//       booking = await Bookings.findOne({
//         employeeId,
//         serviceDate: selectedDate,
//         serviceTime: {
//           $gte: timeBefore.toISOString().split("T")[1].slice(0, 5),
//           $lte: timeAfter.toISOString().split("T")[1].slice(0, 5),
//         },
//       });

//       if (booking) {
//         return res
//           .status(400)
//           .json({
//             error:
//               "Booking already exists within 30 minutes of the selected time.",
//           });
//       }

//       return res
//         .status(200)
//         .json({
//           message: "No conflicting booking found. Proceed with booking.",
//         });
//     }
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "An error occurred while checking bookings." });
//   }
// });

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
    // Fetch query params for pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit; // Calculate how many items to skip

    // Fetch bookings with pagination and populate serviceId and employeeId
    const result = await Bookings.find()
      .populate("serviceId","name") // Populate the service details
      .populate("employeeId","name") // Populate the employee details
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip) // Skip previous pages
      .limit(limit); // Limit results to the page size

    // Get the total count of bookings for pagination metadata
    const total = await Bookings.countDocuments();

    res.status(200).send({
      data: result,
      totalPages: Math.ceil(total / limit), // Calculate total pages
      currentPage: page,
      totalItems: total,
      status: "ok",
    });
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
