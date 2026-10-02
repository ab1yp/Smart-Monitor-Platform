require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db")
const authRoute = require("./routes/auth.route")
const userRoute = require("./routes/user.route")
const deviceRoute = require("./routes/device.route")
const DeviceMemberRoute = require("./routes/deviceMember.route")
const authMiddleware = require('./middleware/auth.middleware')
const cors = require("cors")
const cookieParser = require("cookie-parser");


const app = express();

app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/devices", deviceRoute);
app.use("/api/devicemembers", DeviceMemberRoute);
app.use("/api/users", userRoute);

// Protected route (only accessible with a valid token)
app.get("/api/private", authMiddleware, (req, res) => {
  res.send("This is a protexted route")
})

app.get("/", (req, res) => {
  res.send("Hello, The API working successfully!");
});

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at: ${process.env.BACK_URL}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });