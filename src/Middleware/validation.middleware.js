import {z} from 'zod';

export const registerSchema = z.object({
    username:z.string().min(3,"user name is required"),
    email:z.string().email("Email is invalid"),
    password:z.string().min(8,"Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    phone:z.string().min(10,"Phone number is required").regex(/^(02|2|\+2)?01[0-25]\d{8}$/),
  })

export const loginSchema = z.object({
    email:z.string().email("Email is invalid"),
    password:z.string().min(1,"Password is required")
});

export const verifyEmailSchema = z.object({
    email:z.string().email("Email is invalid"),
    otp: z.string().length(6, "OTP must be exactly 6 characters").regex(/^[0-9]+$/, "OTP must only contain numbers")
})

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    email:z.string().email("Email is invalid"),
    otp: z.string().length(6, "OTP must be exactly 6 characters").regex(/^[0-9]+$/, "OTP must only contain numbers"),
    newPassword:z.string().min(8,"Password must be at least 8 characters long"),
});

export const verifyForgotPasswordCodeSchema = z.object({
  email:z.string().email("Email is invalid"),
  otp: z.string().length(6, "OTP must be exactly 6 characters").regex(/^[0-9]+$/, "OTP must only contain numbers"),
})

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});
