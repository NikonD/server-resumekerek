import { Request, Response, Router } from "express";
// import jwt from 'jsonwebtoken';
import config from '../config/config.json'
import { models } from "../models";
import multer from 'multer';
import { join } from "path";
import { writeFile } from "fs";
import jwt from 'jsonwebtoken';





let resumeRoute = Router()
const upload = multer({ dest: 'uploads/' });

resumeRoute.route('/list').post(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };
    console.log("DECODED", decoded)
    // request to database

    let user = await models.users.findOne({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let resumes = await models.resumes.findAll({
      where: {
        user_id: user.id
      }
    })

    res.json({ status: "ok", resumes })
  } catch (e) {
    res.json({ status: "error" })
  }
})

resumeRoute.route('/create').post(async (req: Request, res: Response) => {
  console.log(req.body)
  try {

    // await resumes.create({
    //   "resume": req.body.resumeData,
    //   "user_id": 1
    // })
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

  writeFile(filePath, buffer, (error) => {
    if (error) {
      console.error('Error saving file:', error);
      res.status(500).send('Error saving file on server.');
    } else {
      res.json({ qr: fileName });
    }
  })

})

resumeRoute.route('/onefile').post(async (req: Request, res: Response) => {
  const { data, fileName, resumeObject, theme, settings } = req.body;

  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log(req.body)
  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!data) {
    res.status(400).send('No file data provided.');
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };

    let user = await models.users.findOne({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }


    let dateCode = `${new Date().getDate()}${new Date().getMonth()}${new Date().getHours()}${new Date().getMinutes()}`
    let fullFileName = `resume-${dateCode}-${theme}-${fileName.replace(/\s/g, '')}.pdf`

    await models.resumes.create({
      user_id: user.id,
      filename: fullFileName,
      resume: resumeObject,
      template: theme,
      preview: "",
      settings: settings
      // date_create: new Date()
    })

    const base64Data = data.replace(/^data:.*,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = join(__dirname, '..', '..', 'uploads', 'pdf', fullFileName)

    writeFile(filePath, buffer, (error) => {
      if (error) {
        console.error('Error saving file:', error);
        res.status(500).send('Error saving file on server.');
      } else {
        res.json({ status: "ok", filename: fullFileName });
      }
    })
  }
  catch (e) {
    console.log((e as Error).message)
    res.json({ status: "error" })
  }

})

resumeRoute.route(`/upload/pdf`).post(async (req: Request, res: Response) => {
  const { data, fileName, resumeObject, theme, preview, settings } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log(req.body)
  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!data) {
    res.status(400).send('No file data provided.');
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };
    console.log("DECODED", decoded)
    // request to database

    let user = await models.users.findOne({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }


    let dateCode = `${new Date().getDate()}${new Date().getMonth()}${new Date().getHours()}${new Date().getMinutes()}`
    let fullFileName = `resume-${dateCode}-${theme}-${fileName.replace(/\s/g, '')}.pdf`

    await models.resumes.create({
      user_id: user.id,
      filename: fullFileName,
      resume: resumeObject,
      template: theme,
      preview: preview,
      settings: settings
      // date_create: new Date()
    })

    const base64Data = data.replace(/^data:.*,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = join(__dirname, '..', '..', 'uploads', 'pdf', fullFileName)

    writeFile(filePath, buffer, (error) => {
      if (error) {
        console.error('Error saving file:', error);
        res.status(500).send('Error saving file on server.');
      } else {
        res.json({ status: "ok", filename: fullFileName });
      }
    })
  } catch (e) {
    console.log((e as Error).message)
    res.json({ status: "error" })
  }
})

resumeRoute.route('/remove').post(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  const {
    resume_id
  } = req.body

  if (!token) {
    console.log(token)
    return res.status(401).json({status: "error", message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };

    let user = await models.users.findOne({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({status: "error", message: 'Unauthorized' });
    }

    await models.resumes.destroy({
      where: {
        id: resume_id
      }
    })
    
    res.json({ status: "ok" })
  } catch (e) {
    console.log((e as Error).message)
    res.json({ status: "error" })
  }


})

resumeRoute.route(`/upload/photo`).post(async (req: Request, res: Response) => {

})

export { resumeRoute }