import express, { Express } from "express";
import cors from 'cors';
import { Routes } from "./routes";
import bodyParser from "body-parser";
import config from './config/config.json'
import cookieParser from 'cookie-parser';
import session from 'express-session';
let app: Express = express()

const allowedOrigins = ['http://localhost:3000', 'http://resumekerek.com'];

app.use(bodyParser.urlencoded({ extended: true, limit:"50mb" }))

// parse application/json
app.use(bodyParser.json({limit: "50mb"}))
// Разрешение CORS только для указанных источников
app.use(cookieParser())
app.use(
  session({
    secret: config.JWT_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use('/uploads', express.static('uploads'));

app.use('/', Routes)

app.listen(config.PORT, ()=>{
  console.log("start server")
})