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

loginRoute.route("/login").post(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("111")
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, config.JWT_SECRET);

  res.json({ 
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
      }, attributes: ["email", "fullname", "id", "plan", "active_until"]
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
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Создание хеша пароля перед сохранением в базу данных.
  const hashedPassword = hashSync(password, 10);

  let newUser = await models.users.upsert({
    email: email,
    password: hashedPassword,
    verify: false,
    fullname: fullname
  }, { returning: false })
  // Создание новой записи пользователя.
  // const newUser = { id: users.length + 1, username, password: hashedPassword };
  // users.push(newUser);

  // Создание JWT для нового пользователя и его отправка в ответе.
  const token = jwt.sign({ userId: newUser[0].id }, config.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
})

export { loginRoute }