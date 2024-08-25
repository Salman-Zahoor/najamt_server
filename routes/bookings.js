const express = require("express");
const router = express.Router();
const Bookings = require("../model/bookings");
const Employees = require("../model/employee");
const verifyToken = require("../controller/verifyToken");

// Function to find a free employee
async function findFreeEmployee(selectedDate, selectedTime) {
  // Logic to find an employee who has no booking at the selected time
  const employees = await Employees.find(); // Assuming you have an Employees model
  for (let employee of employees) {
    const booking = await Bookings.findOne({
      employeeId: employee._id,
      serviceDate: selectedDate,
      serviceTime: {
        $gte: selectedTime,
        $lt: new Date(new Date(selectedTime).getTime() + 30 * 60000)
          .toISOString()
          .split("T")[1]
          .slice(0, 5),
      },
    });
    if (!booking) {
      return employee;
    }
  }
  return null;
}

router.post("/checkBooking", async (req, res) => {
  try {
    const { selectedTimeDate, employeeId, autoAssign } = req.body;

    // Convert selectedTimeDate string to a Date object
    const selectedDateTime = new Date(selectedTimeDate);

    // Define time boundaries for the check (+/- 30 minutes)
    const timeBefore = new Date(selectedDateTime.getTime() - 30 * 60000);
    const timeAfter = new Date(selectedDateTime.getTime() + 30 * 60000);

    let booking;

    if (autoAssign) {
      // Find an employee who is free at the selected time
      booking = await Bookings.findOne({
        serviceDate: selectedDateTime.toISOString().split("T")[0], // Extract date part
        serviceTime: {
          $gte: timeBefore.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          $lte: timeAfter.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
        },
      });

      if (booking) {
        return res.status(400).json({ error: "No available employees at the selected time." });
      }

      // Logic to assign a free employee
      const freeEmployee = await findFreeEmployee(
        selectedDateTime.toISOString().split("T")[0],
        selectedDateTime.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
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
          $gte: timeBefore.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          $lte: timeAfter.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
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
