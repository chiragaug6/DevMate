const validator = require("validator");
const AppError = require("./AppError");

const validateSignUpData = (signUpData) => {
  const { firstName, lastName, emailId, password } = signUpData;

  if (!firstName || !lastName) {
    throw new AppError("Name is not valid", 400);
  }
  if (!validator.isEmail(emailId)) {
    throw new AppError("Invalid email address", 400);
  }
  if (!validator.isStrongPassword(password)) {
    throw new AppError("Password must be stronger", 400);
  }
};

const validateEditProfileData = (editProfileData) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const invalidFields = Object.keys(editProfileData).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new AppError(
      `Invalid fields in request: ${invalidFields.join(", ")}`,
      400
    );
  }
};

module.exports = { validateSignUpData, validateEditProfileData };
