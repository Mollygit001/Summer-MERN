import {body} from 'express-validator';

const loginValidator = [
  body("username")
    .notEmpty().withMessage("Username is required")
    .isEmail().withMessage("Username must be a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be 6 characters long"),
];

export default loginValidator;