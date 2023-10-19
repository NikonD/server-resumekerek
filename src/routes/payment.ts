import { Request, Response, Router } from "express";
import config from '../config/config.json'
import { epayAuthToken } from "../helpers/epayAuth";
import * as CryptoJS from 'crypto';
import axios from "axios";
import FormData from "form-data";
import { parseStringPromise } from 'xml2js';
import { models } from "../models";
import moment from 'moment'
import jwt from 'jsonwebtoken';
let paymentRoute = Router()


paymentRoute.post('/check-payment', async (req, res) => {
  console.log("RESULT C", req.body)
  console.log("RESULT Q", req.query)
})

paymentRoute.post('/result-payment-file', async (req, res) => {
  console.log("RESULT C", req.body)
  console.log("RESULT Q", req.query)

  try {
    const {
      pg_result,
      pg_user_contact_email,
      pg_description,
      pg_amount,
      pg_currency,
      pg_order_id,
      pg_payment_id
    } = req.body

    if (pg_result == 1) {

      let user = await models.users.findOne({
        where: {
          email: pg_user_contact_email
        }
      })

      models.orders.create({
        pg_amount: pg_amount,
        pg_currency: pg_currency,
        pg_description: pg_description,
        pg_order_id: pg_order_id ? pg_order_id : "0",
        pg_result: pg_result,
        pg_contact_email: pg_user_contact_email,
        pg_payment_id: pg_payment_id,
        user_id: user?.id || 0
      })
    }
    res.json(req.body)
  } catch (e) {
    res.json(req.body)
  }

})

paymentRoute.post('/result-payment', async (req, res) => {
  console.log("RESULT R", req.body)
  console.log("RESULT Q", req.query)

  const currentDate = moment()
  const oneMonthLater = currentDate.clone().add(1, 'months')
  const sixMonthsLater = currentDate.clone().add(6, 'months')
  const oneYearLater = currentDate.clone().add(1, 'years')

  try {
    const {
      pg_result,
      pg_user_contact_email,
      pg_description,
      pg_amount,
      pg_currency,
      pg_order_id,
      pg_payment_id
    } = req.body
    if (pg_result == 1) {
      const arrayDecriptions = pg_description.split(';')

      let nextDate = moment()

      switch (arrayDecriptions[0]) {
        case 'sub1':
          nextDate = oneMonthLater
          break;
        case 'sub2':
          nextDate = sixMonthsLater
          break;
        case 'sub3':
          nextDate = oneYearLater
          break;
      }

      let user = await models.users.findOne({
        where: {
          email: pg_user_contact_email
        }
      })

      console.log(nextDate)
      models.users.update(
        {
          active_until: nextDate.toDate()
        },
        {
          where: {
            email: pg_user_contact_email
          }
        })

      models.orders.create({
        pg_amount: pg_amount,
        pg_currency: pg_currency,
        pg_description: pg_description,
        pg_order_id: pg_order_id ? pg_order_id : "0",
        pg_result: pg_result,
        pg_contact_email: pg_user_contact_email,
        pg_payment_id: pg_payment_id,
        user_id: user?.id || 0
      })
    }
    res.json(req.body)
  } catch (e) {
    res.json(req.body)
  }
})



paymentRoute.post('/initiate-payment', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const payboxMerchantId = config.PB_merchantID;
  const secretKey = config.PB_secretKey;

  const formData = req.body
  formData.pg_merchant_id = payboxMerchantId
  formData.pg_salt = config.PB_salt

  let signatureString = Object.entries(formData)
    .sort()
    .map(([key, value]) => {
        return value
    })
    .concat(secretKey)
    .join(';');

  signatureString = `${formData.script};${signatureString}`
  console.log(signatureString)

  const signature = CryptoJS.createHash('md5').update(signatureString).digest('hex');

  const requestData = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    requestData.append(key, value);
  });
  requestData.append('pg_sig', signature);

  try {
    const response = await axios.post('https://api.paybox.money/init_payment.php', requestData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const xmlResponse = response.data;
    const parsedResponse = await parseStringPromise(xmlResponse, { explicitArray: false });

    console.log('Разобранный XML-ответ:', parsedResponse);


    const paymentId = parsedResponse.response.pg_payment_id;
    const redirectUrl = parsedResponse.response.pg_redirect_url;

    res.json({ paymentId, redirectUrl })

    // console.log('Ответ от PayBox:', response.data);

  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
  }


});

// Handle Paybox callback
paymentRoute.post('/paybox-callback', (req, res) => {
  console.log("RESULT", req.body)
  console.log("RESULT Q", req.query)
  // Verify the callback data, update payment status, etc.
  // Return a response (HTTP status OK, for example)
});


paymentRoute.route("/auth/token").post(async (req: Request, res: Response) => {
  try {
    let token = await epayAuthToken();
    res.json({ status: "ok", data: token })
  } catch (e: any) {
    console.log(e)
    res.json({ status: "error", message: `${(e as Error).message}` })
  }
})

paymentRoute.route("/postlink").post(async (req: Request, res: Response) => {
  try {
    console.log("POSTLINK", req.body)
    res.json({})
  } catch (e) {

  }
})

paymentRoute.route('/findorder').post(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ isPaid: false, message: 'Unauthorized' });
  }
  try {

    const {
      order_id
    } = req.body

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };
    console.log("DECODED", decoded)


    let user = await models.users.findOne({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ isPaid: false, message: 'Unauthorized' });
    }
    console.log("FINDER", order_id)
    console.log("FINDER", user.email)
    const order = await models.orders.findOne({
      where: {
        pg_order_id: order_id,
        pg_contact_email: user.email
      }
    })
    console.log("FINDER", order)
    res.json({ isPaid: Boolean(order), message: "ok" })
  }
  catch (e) {
    res.json({ isPaid: false, message: "Internal error" })
  }
})

paymentRoute.route("/revoke").post(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log(token)
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payboxMerchantId = config.PB_merchantID;
    const secretKey = config.PB_secretKey;

    const formData = req.body
    formData.pg_merchant_id = payboxMerchantId
    formData.pg_salt = config.PB_salt

    let signatureString = Object.entries(formData)
      .sort()
      .map(([key, value]) => value)
      .concat(secretKey)
      .join(';');

    signatureString = `${formData.script};${signatureString}`
    console.log(signatureString)

    const signature = CryptoJS.createHash('md5').update(signatureString).digest('hex');

    const requestData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      requestData.append(key, value);
    });
    requestData.append('pg_sig', signature);

    const response = await axios.post('https://api.paybox.money/revoke.php', requestData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const xmlResponse = response.data;
    const parsedResponse = await parseStringPromise(xmlResponse, { explicitArray: false });

    console.log('Разобранный XML-ответ:', parsedResponse);

    // Теперь вы можете обращаться к полям ответа, например:
    const paymentId = parsedResponse.response.pg_payment_id;
    const redirectUrl = parsedResponse.response.pg_redirect_url;

    res.json({ paymentId, redirectUrl })

    // console.log('Ответ от PayBox:', response.data);
    // Здесь вы можете обработать ответ от PayBox
  } catch (e) {
    res.json()
  }
})

export { paymentRoute }