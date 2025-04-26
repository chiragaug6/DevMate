const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is Not Valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("please enter valid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("please Enter Strong Password");
  }
};

const validateEditProfileData = (req) => {
  const allowEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => {
    return allowEditFields.includes(field);
  });

  return isEditAllowed;
};

module.exports = { validateSignUpData, validateEditProfileData };
