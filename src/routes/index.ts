import express from "express";
import { loginRoute } from "./login";
import { resumeRoute } from "./resume";

let Routes = express.Router()

Routes.use("/api/auth", loginRoute)
Routes.use("/api/resume", resumeRoute)

export {Routes}