const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

//enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());

// Your routes and other middleware go here

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
