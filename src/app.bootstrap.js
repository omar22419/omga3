import express from "express";
import {
  authRouter,
  projectRouter,
  taskRouter,
  userRouter,
  workspaceRouter,
} from "./Modules/index.js";
import { connectDB } from "./DB/db.connection.js";
import { PORT } from "../config/config.service.js";
import { globalErrorHandling, NotFoundException } from "./Common/index.js";
import { connectRedis } from "./DB/redis.connection.js";

const bootstrap = async (req,res) => {
  const port = PORT;

  const app = express();
  app.use(express.json());

  //DB connection
  await connectDB();
  await connectRedis();

  app.use("/auth", authRouter);
  app.use("/project", projectRouter);
  app.use("/task", taskRouter);
  app.use("/user", userRouter);
  app.use("/workspace", workspaceRouter);

  app.use("/*dummy", (req, res) => {
    return res.status(404).json({
      message: "Invalid application routing",
    });
  });

  app.use(globalErrorHandling);

  app.listen(port, () => {
    console.log("Server is running on port 3000");
  });
};

export default bootstrap;
