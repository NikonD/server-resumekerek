import express, { Express } from "express";
import cors from 'cors';
import { Routes } from "./routes";
import bodyParser from "body-parser";


let app: Express = express()

const allowedOrigins = ['http://localhost:3000', 'http://example2.com'];



app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())
// Разрешение CORS только для указанных источников
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

app.listen(5000, ()=>{
  console.log("start server")
})