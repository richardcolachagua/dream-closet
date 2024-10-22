const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = process.env.JWT_SECRET || "your=secret-key";
const SALT_ROUNDS = 10;

// Helper function to create a response

const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(body),
  };
};

const login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    const result = await dynamoDB
      .get({
        TableName: "users",
        key: { email },
      })
      .promise();

    const user = result.Item;

    if (!user) {
      return createResponse(401, {
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return createResponse(401, {
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return createResponse(200, {
      success: true,
      token,
      user: {
        email: user.email,
        FirstName: user.FirstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login Failed", error);
    return createResponse(500, {
      success: false,
      error: "An error occurred. Please try again later",
    });
  }
};

const protectedRoute = async (event) => {
  try {
    const token = event.headers.Authorization.split(" ")[1]; // Extract token from header

    const decoded = jwt.verify(token, JWT_SECRET); // verify token

    return createResponse(200, {
      success: true,
      message: "You have access to this protected route!",
      user: decoded.email, // include the users email from the token
    });
  } catch (error) {
    console.error("Access denied", error);
    return createResponse(401, {
      success: false,
      error: "Unauthorized access",
    });
  }
};

const signup = async (event) => {
  try {
    const { FirstName, lastName, email, password } = JSON.parse(event.body);

    // Check if the email already exists in the database

    const existingUser = await dynamoDB
      .get({
        TableName: "users",
        key: { email },
      })
      .promise();

    if (existingUser.Item) {
      return createResponse(400, { error: "Email address already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // if email does not exist, create user registration
    const newUser = {
      email,
      FirstName,
      lastName,
      password: hashedPassword,
    };
    await dynamoDB
      .put({
        TableName: "users",
        Item: newUser,
      })
      .promise();

    return createResponse(201, { message: "User registered successfully" });
  } catch (error) {
    console.error("Signup failed", error);
    return createResponse(500, {
      success: false,
      error: "An error occurred. Please try again later",
    });
  }
};

// Main handler function
exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  switch (event.path) {
    case "/login":
      if (event.httpMethod === "POST") {
        return await login(event);
      }
      break;
    case "/signup":
      if (event.httpMethod === "POST") {
        return await signup(event);
      }
      break;
    case "/protected":
      if (event.httpMethod === "GET") {
        return await protectedRoute(event);
      }
      break;
    default:
      return createResponse(404, { error: "Not Found" });
  }
  return createResponse(405, { error: "Method Now Allowed" });
};
