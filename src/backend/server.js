const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

const app = express();

//enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());

// Your routes and other middleware go here
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
