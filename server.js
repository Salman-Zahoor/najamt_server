const express=require("express");
const mongoose=require("mongoose")
const cors=require("cors")
const bodyParser = require("body-parser");
const services=require("./routes/services");
const banners=require("./routes/banners");
const bookings=require("./routes/bookings");
const admin=require("./routes/admin");
const category=require("./routes/category");
const employee=require("./routes/employee");

const PORT=process.env.PORT || 5000;


// mongoose
//   .connect(
//     "mongodb+srv://bhsjobportal:fbz4lRVJYtXs7qKe@cluster0.itkhalq.mongodb.net/"
//   )
mongoose
  .connect("mongodb://0.0.0.0:27017/najamt_saloon", {})
  .then((res) => {
    console.log("ressss=>>");
  })
  .catch((err) => {
    console.log("errrr=>", err);
  });


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1",services)
app.use("/api/v1",bookings)
app.use("/api/v1",admin)
app.use("/api/v1",category)
app.use("/api/v1",employee)
app.use("/api/v1",banners)

app.listen(PORT, (req, res) => {
    console.log("server is running on port", PORT);
  });
  