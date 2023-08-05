import { Request, Response, Router } from "express";
// import jwt from 'jsonwebtoken';
// import config from '../config/config.json'
import { models } from "../models";
import { resumes } from "../models/resumes";
import multer from 'multer';
import { join } from "path";
import { writeFile } from "fs";

let resumeRoute = Router()
const upload = multer({ dest: 'uploads/' });

resumeRoute.route('/list').post(async (req: Request, res: Response) => {
  try {
    let resumes = await models.resumes.findAll()
    res.json(resumes)
  } catch (e) {
    res.json({ status: "error" })
  }
})

resumeRoute.route('/create').post(async (req: Request, res: Response) => {
  console.log(req.body)
  try {

    await resumes.create({
      "resume": req.body.resumeData,
      "user_id": 1
    })
    res.json({ status: "ok" })
  } catch (e) {
    console.log(e)
    res.json({ status: "error" })
  }
})

resumeRoute.route(`/upload/qr`).post(upload.single('file'), async (req: Request, res: Response) => {
  const { file } = req.body;
  if (!file) {
    res.status(400).send('No file data provided.');
    return;
  }

  const base64Data = file.replace(/^data:.*,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `${new Date().getTime()}`
  const filePath = join(__dirname, '..', '..', 'uploads', 'qr', fileName)

  writeFile(filePath,  buffer, (error) => {
    if (error) {
      console.error('Error saving file:', error);
      res.status(500).send('Error saving file on server.');
    } else {
      res.json({qr: fileName});
    }
  })

})

resumeRoute.route(`/upload/photo`).post(async (req: Request, res: Response) => {

})

export { resumeRoute }