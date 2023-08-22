import { Request, Response, Router } from "express";
// import jwt from 'jsonwebtoken';
// import config from '../config/config.json'
// import { models } from "../models";
import { epayAuthToken } from "../helpers/epayAuth";

let paymentRoute = Router()

paymentRoute.route("/auth/token").post(async (req: Request, res: Response) => {
  try {
    let token = await epayAuthToken();
    res.json({status: "ok", data: token})
  } catch (e: any) {
    console.log(e)
    res.json({status:"error", message: `${(e as Error).message}`})
  }
})

paymentRoute.route("/postlink").post(async (req: Request, res: Response) => {
  try {
    console.log("POSTLINK", req.body)
    res.json({})
  } catch (e) {

  }
})

export {paymentRoute}