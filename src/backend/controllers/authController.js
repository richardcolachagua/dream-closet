const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const SALT_ROUNDS = 10;

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
      const { firstName, lastName, email, password } = req.body;

      // Check if the email already exists in the database
      const existingUser = await dynamoDB
        .get({
          TableName: "users",
          Key: { email },
        })
        .promise();

      if (existingUser.Item) {
        return res.status(400).json({ error: "Email address already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // If email doesn't exist, proceed with user registration

      const newUser = {
        email,
        firstName,
        lastName,
        password: hashedPassword,
      };

      await dynamoDB
        .put({
          TableName: "users",
          Item: newUser,
        })
        .promise();

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
