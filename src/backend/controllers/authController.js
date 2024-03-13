const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const authController = {
  login: async (req, res) => {
    try {
    } catch (error) {
      console.error("Login failed", error);
      res.status(500).json({
        success: false,
        error: "An error occured. Please try again later",
      });
    }
  },
  signup: async (req, res) => {
    try {
    } catch (error) {
      console.error("Signup failed", error);
      res.status(500).json({
        success: false,
        error: "An error occured. Please try again later",
      });
    }
  },
};

module.exports = authController;
