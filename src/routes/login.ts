import { Request, Response, Router } from "express";
import jwt from 'jsonwebtoken';
import config from '../config/config.json'
import { models } from "../models";
import { compareSync, hashSync } from 'bcrypt'
// import { users } from "../models/users";
let loginRoute = Router()

const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await models.users.findOne({
      where: {
        email: email
      },
    });
    if (user && compareSync(password, user.password)) {
      return user;
    }
    return null;
  } catch (e) {
    console.log(e)
    return null
  }

};


loginRoute.route("/update").post(async (req: Request, res: Response) => {
  const { email, phone, photo, address, fullname, language, password, newPassword } = req.body
  console.log(req.body)
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as { userId: number };

    const user = await models.users.findOne({
      where: {
        id: decodedToken.userId
      }
    })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (password && newPassword) {
      if (compareSync(user.password, password)) {
        return res.status(401).json({ staus: "error", code: 5, message: "password mismatch" })
      }
    }


    if (newPassword) {
      const hashedPassword = hashSync(newPassword, 10);

      await models.users.update({
        email: email,
        address: address,
        phone: phone,
        photo: photo,
        password: hashedPassword,
        language: language,
        fullname: fullname
      }, {
        where: {
          id: user.id
        }
      })
    }
    else {
      await models.users.update({
        email: email,
        address: address,
        phone: phone,
        photo: photo,
        language: language,
        fullname: fullname
      }, {
        where: {
          id: user.id
        }
      })
    }




    res.json({ status: "ok" })
    // return res.status(401).json({ message: 'Unauthorized' });
  } catch (e) {
    console.log(e)
    res.json({ status: "error" })
  }

})

loginRoute.route("/login").post(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ status: "401", message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, config.JWT_SECRET);

  res.json({
    status: "200",
    message: 'Logged in successfully',
    token: token,
    user: {
      email: user.email,
      fullname: user.fullname,
      plan: user.plan,
      active_until:
        user.active_until
    }
  });
})

loginRoute.route("/verify").post(async (req: Request, res: Response) => {
  // Получение JWT из заголовков запроса.
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log(token)
  console.log(req.headers)
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as { userId: number };
    console.log(decodedToken)
    const user = await models.users.findOne({
      where: {
        id: decodedToken.userId
      }, attributes: [
        "email",
        "fullname",
        "id",
        "plan",
        "active_until",
        "address",
        "photo",
        "phone",
        "language"
      ]
    })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ message: 'Access granted to protected route', user: user });
  } catch (error) {
    console.error('Protected route error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
})

loginRoute.route("/registration").post(async (req: Request, res: Response) => {
  const { email, password, fullname } = req.body;

  // Проверка, что пользователь с таким именем пользователя не существует.
  if (await models.users.findOne({ where: { email: email } })) {
    return res.status(400).json({ message: 'Username already exists', code: "1" });
  }

  // Создание хеша пароля перед сохранением в базу данных.
  const hashedPassword = hashSync(password, 10);
  try {
    let newUser = await models.users.upsert({
      email: email,
      password: hashedPassword,
      verify: false,
      fullname: fullname
    })
    // Создание новой записи пользователя.
    // const newUser = { id: users.length + 1, username, password: hashedPassword };
    // users.push(newUser);

    // Создание JWT для нового пользователя и его отправка в ответе.
    console.log(newUser[0])
    const token = jwt.sign({ userId: newUser[0].id }, config.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token: token, user: newUser[0] });
  }
  catch (e) {

    res.json({ message: "server error", code: "2" })
  }

})

export { loginRoute }