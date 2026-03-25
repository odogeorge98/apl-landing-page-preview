import * as yup from "yup";
import {
  ForgetPasswordData,
  LoginData,
  ResetPasswordData,
} from "../interfaces/auth";

const authValidations = {
  async forgotPassword(payload: ForgetPasswordData) {
    const schema = yup.object({
      email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    });

    return await schema.validate(payload, { abortEarly: false });
  },

  async login(payload: LoginData) {
    const schema = yup.object({
      email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
      password: yup
        .string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
    });
    return await schema.validate(payload, { abortEarly: false });
  },

  async resetPassword(payload: ResetPasswordData) {
    const schema = yup.object({
      token: yup.string().required("Reset token is required"),
      password: yup
        .string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Password confirmation is required"),
    });

    return await schema.validate(payload, { abortEarly: false });
  },
};

export default authValidations;
