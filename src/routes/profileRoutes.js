const { Router } = require("express");
const {
  viewProfile,
  editProfile,
  deleteProfile,
} = require("../controllers/profileController");
const { isLoggedIn } = require("../middlewares/authMiddleware");

const router = Router();

router.get("/view", isLoggedIn, viewProfile);

router.patch("/edit", isLoggedIn, editProfile);

router.delete("/delete", isLoggedIn, deleteProfile);

module.exports = router;
