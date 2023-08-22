import express from "express";
import { loginRoute } from "./login";
import { resumeRoute } from "./resume";
import { paymentRoute } from "./payment";

let Routes = express.Router()

Routes.use("/api/auth", loginRoute)
Routes.use("/api/resume", resumeRoute)
Routes.use("/api/epay", paymentRoute)

export {Routes}