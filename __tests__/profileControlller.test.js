jest.mock("../src/models/userModel");
jest.mock("../src/utils/validation", () => ({
  validateEditProfileData: jest.fn(() => true),
}));

jest.mock("../src/middlewares/authMiddleware", () => ({
  isLoggedIn: (req, res, next) => {
    req.user = {
      _id: "user123",
      firstName: "Test",
      lastName: "User",
      emailId: "test@example.com",
      save: jest.fn().mockResolvedValue({
        _id: "user123",
        firstName: "Updated",
        lastName: "User",
        emailId: "test@example.com",
      }),
    };
    next();
  },
}));

const request = require("supertest");
const { app } = require("../src/app"); // your Express app
const User = require("../src/models/userModel");

describe("User Profile Controller", () => {
  describe("GET /profile/view", () => {
    it("should return user profile data", async () => {
      const res = await request(app).get("/profile/view");
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("profile data");
      expect(res.body.data.emailId).toBe("test@example.com");
    });
  });

  describe("PUT /profile/edit", () => {
    it("should update user profile data", async () => {
      const updatedData = {
        firstName: "Updated",
        lastName: "User",
      };

      const res = await request(app).patch("/profile/edit").send(updatedData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("profile data");
      expect(res.body.data.firstName).toBe("Updated");
    });
  });

  describe("DELETE /profile/delete", () => {
    it("should delete the user profile", async () => {
      const deletedUser = {
        _id: "user123",
        emailId: "test@example.com",
      };

      User.findByIdAndDelete.mockResolvedValue(deletedUser);

      const res = await request(app).delete("/profile/delete");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("profile delete successfully");
      expect(res.body.data._id).toBe("user123");
    });
  });
});
