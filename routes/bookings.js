const express = require("express");
const router = express.Router();
const Bookings = require("../model/bookings");
const Employees = require("../model/employee");
const verifyToken = require("../controller/verifyToken");
const nodemailer = require("nodemailer");

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
    phone,
    name,
    autoAssign,
    paymentType,
  } = req.body;

  try {
    // Save booking details to the database
    const booking = new Bookings({
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
      phone,
      paymentType,
    });

    const result = await booking.save();

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your email service provider
      auth: {
        user: "Jobia4801@gmail.com",
        pass: "grhtvruaqsucqcsz",
      },
    });

    // Prepare email content based on payment type
    let emailSubject = "Booking Confirmation";
    let emailBody = `Dear ${name},\n\nYour booking with ID ${bookingId} has been successfully added.\n\n`;

    if (paymentType === "cash") {
      emailBody += "Our representative will contact you for confirmation shortly.";
    } else if (paymentType === "online") {
      emailBody += `Please pay the price of the service to the following bank account details:\n\n` +
        `IBAN: AE58 0260 0010 1587 5678 901\n` +
        `Account Number: 1015875678901\n` +
        `Currency: AED\n` +
        `Swift Code: EBILAEAD\n` +
        `Routing Number: 302620122\n\n` +
        `Our representative will connect with you shortly.`;
    }

    emailBody += "\n\nThank you for choosing our service!";

    // Send the email
    await transporter.sendMail({
      from: "najamtalhuda@gmail.com", // sender address
      to: email, // recipient email
      subject: emailSubject, // Subject line
      text: emailBody, // plain text body
    });

    // Respond with success
    res.status(200).send({
      data: result,
      status: "ok",
      message: "Booking added successfully and email sent.",
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(400).send({
      status: "error",
      message: "Something went wrong.",
    });
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
    const findBooking = await Bookings.findById(id);

    if (!findBooking) {
      return res.status(404).send({
        status: "error",
        message: "Booking not found",
      });
    }

    const { status, email, name, bookingId } = findBooking; // Extract details from the existing booking
    const result = await Bookings.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // Check status and prepare email content
    if (req.body.status === "confirmed" || req.body.status === "cancelled") {
      const transporter = nodemailer.createTransport({
        service: "gmail", // or your email service provider
        auth: {
        user: "Jobia4801@gmail.com",
        pass: "grhtvruaqsucqcsz",
        },
      });

      let emailSubject = "Booking Update";
      let emailBody = `Dear ${name},\n\n`;

      if (req.body.status === "confirmed") {
        emailBody += `Your booking with ID ${bookingId} has been confirmed.\n\nThank you for choosing our service!`;
      } else if (req.body.status === "cancelled") {
        emailBody += `We regret to inform you that your booking with ID ${bookingId} has been cancelled.\n\nIf you have any questions, feel free to contact our support team.`;
      }

      // Send the email
      await transporter.sendMail({
        from: "najamtalhuda@gmail.com", // sender address
        to: email, // recipient email
        subject: emailSubject, // Subject line
        text: emailBody, // plain text body
      });
    }

    res.status(200).send({
      data: result,
      status: "ok",
      message: "Booking Updated Successfully",
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

module.exports = router;
