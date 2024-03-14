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
      const { email, password } = req.body;

      // Check if the email already exists in the database

      const existingUser = await dynamoDB
        .get({
          TableName: "users",
          Key: "email",
        })
        .promise();

      if (existingUser.Item) {
        return res.status(400).json({ error: "Email address already exists" });
      }

      // If email doesn't exist, proceed with user registration
      // (hash password, store user data in the database, etc.)

      res.status(201).json({ message: "User registerd successfully" });
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
