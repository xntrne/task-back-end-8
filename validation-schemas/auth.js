import { z } from "zod";

// register
export const registerSchema = z
  .object({
    username: z.string().min(2, "username must be at least 2 characters"),
    email: z.email("email must be a valid email"),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .regex(/[A-Z]/, "password must contain an uppercase letter")
      .regex(/[a-z]/, "password must contain a lowercase letter")
      .regex(/[0-9]/, "password must contain a digit")
      .regex(/[^A-Za-z0-9]/, "password must contain a special character"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "passwords do not match",
    path: ["password_confirmation"],
  });

// login
export const loginSchema = z.object({
  email: z.email("email must be a valid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
});
