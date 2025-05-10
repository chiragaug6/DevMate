// Mocking necessary modules
jest.mock("../src/models/userModel");
jest.mock("../src/utils/isCaptchaValid");
jest.mock("../src/utils/validation");

jest.mock("../src/middlewares/authMiddleware", () => {
  return {
    isLoggedIn: jest.fn((req, res, next) => {
      // simulate unauthenticated user
      // req.user = null;
      next();
    }),
  };
});

const request = require("supertest");
const { app, server } = require("../src/app"); // Assuming the Express app is exported from here
const User = require("../src/models/userModel");
const AppError = require("../src/utils/AppError");
const { isCaptchaValid } = require("../src/utils/isCaptchaValid");
const { validateSignUpData } = require("../src/utils/validation");
const bcrypt = require("bcrypt");

describe("Auth Controller", () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      firstName: "John",
      lastName: "Doe",
      emailId: "john.doe@example.com",
      password: "StrongPassword123",
      generateToken: jest.fn().mockResolvedValue("mocked-jwt-token"),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /signup", () => {
    it("should successfully sign up a user", async () => {
      // Setup mock behavior
      User.findOne.mockResolvedValue(null); // No user exists with this email
      User.prototype.save.mockResolvedValue(mockUser);

      isCaptchaValid.mockReturnValue(true); // Mock CAPTCHA validation as successful
      validateSignUpData.mockReturnValue(true); // Mock validation as successful

      const response = await request(app).post("/auth/signup").send({
        firstName: "John",
        lastName: "Doe",
        emailId: "john.doe@example.com",
        password: "StrongPassword123",
        token: "captcha-token",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("user signup successfully");
    });

    it("should return an error if user already exists", async () => {
      // Setup mock behavior
      User.findOne.mockResolvedValue(mockUser); // User exists with this email

      const response = await request(app).post("/auth/signup").send({
        firstName: "John",
        lastName: "Doe",
        emailId: "john.doe@example.com",
        password: "StrongPassword123",
        token: "captcha-token",
      });

      expect(response.status).toBe(409); // Conflict
      expect(response.body.message).toBe(
        "Account already exists. Please login."
      );
    });

    it("should return an error if CAPTCHA validation fails", async () => {
      // Mock CAPTCHA validation as failed
      isCaptchaValid.mockReturnValue(false);

      const response = await request(app).post("/auth/signup").send({
        firstName: "John",
        lastName: "Doe",
        emailId: "john.doe@example.com",
        password: "StrongPassword123",
        token: "captcha-token",
      });

      expect(response.status).toBe(403); // Forbidden
      expect(response.body.message).toBe("reCAPTCHA verification failed");
    });
  });

  describe("POST /login", () => {
    beforeEach(() => {
      mockUser = {
        _id: "123",
        firstName: "John",
        lastName: "Doe",
        emailId: "john.doe@example.com",
        password: "hashed-password", // use hashed string if bcrypt is involved
        generateToken: jest.fn().mockResolvedValue("mocked-jwt-token"),
        checkPassword: jest.fn().mockResolvedValue(true),
      };

      // Fix for .findOne().select("+password")
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockReturnValue(mockUser),
      }));
    });

    it("should successfully log in a user", async () => {
      mockUser.checkPassword = jest.fn().mockResolvedValue(true);
      mockUser.generateToken = jest.fn().mockResolvedValue("mocked-jwt-token");

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const response = await request(app).post("/auth/login").send({
        emailId: "john.doe@example.com",
        password: "StrongPassword123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
    });

    it("should return an error if user is not found", async () => {
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockReturnValue(null),
      }));

      const response = await request(app).post("/auth/login").send({
        emailId: "unknown@example.com",
        password: "WrongPassword123",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Account not found. Please sign up.");
    });

    it("should return an error if password is incorrect", async () => {
      mockUser.checkPassword = jest.fn().mockResolvedValue(false); // Password mismatch
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockReturnValue(mockUser),
      }));

      const response = await request(app).post("/auth/login").send({
        emailId: "john.doe@example.com",
        password: "WrongPassword123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  describe("POST /auth/logout", () => {
    it("Logout successful", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logout successful");
    });
  });
});
