import { Request, Response, Router } from "express";
import jwt from 'jsonwebtoken';
import config from '../config/config.json'
import { models } from "../models";
import { compareSync, hashSync } from 'bcrypt'
let loginRoute = Router()

const authenticateUser = async (email: string, password: string) => {
  const user = await models.users.findOne({
    where: {
      email: email
    }
  });
  if (user && compareSync(password, user.password)) {
    return user;
  }
  return null;
};

loginRoute.route("/login").post(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Создание JWT и отправка его в ответе.
  const token = jwt.sign({ userId: user.id}, config.JWT_SECRET);
  res.json({ token });

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
    // Проверка и верификация JWT.
    const decoded = jwt.verify(token, config.JWT_SECRET);
    // decoded.userId содержит идентификатор пользователя или другие данные, которые вы могли закодировать в токен при создании.

    // Вместо этого, здесь вы можете выполнить запрос к базе данных или другие действия, чтобы получить данные пользователя на основе decoded.userId.

    // В этом примере, для простоты, мы просто возвращаем данные пользователя, которые могли бы быть получены из базы данных.
    const user = { id: decoded, username: 'user1' };
    res.json(user);
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
})

loginRoute.route("/register").post(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Проверка, что пользователь с таким именем пользователя не существует.
  if (await models.users.findOne({where: {email: email}})) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Создание хеша пароля перед сохранением в базу данных.
  const hashedPassword = hashSync(password, 10);

  let newUser = await models.users.upsert({
    email: email,
    password: hashedPassword,
    verify: false,
    fullname: ""
  },{ returning: false })
  // Создание новой записи пользователя.
  // const newUser = { id: users.length + 1, username, password: hashedPassword };
  // users.push(newUser);

  // Создание JWT для нового пользователя и его отправка в ответе.
  const token = jwt.sign({ userId: newUser[0].id }, config.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
})

export { loginRoute }