import { Request, Response, Router } from "express";
// import jwt from 'jsonwebtoken';
import config from '../config/config.json'
// import { models } from "../models";
import { epayAuthToken } from "../helpers/epayAuth";
import * as CryptoJS from 'crypto';
import axios from "axios";
import FormData from "form-data";
import { parseStringPromise } from 'xml2js';

let paymentRoute = Router()


paymentRoute.post('/initiate-payment', async (req, res) => {

  const payboxMerchantId = config.PB_merchantID;
  const secretKey = config.PB_secretKey;

  const formData = req.body
  formData.pg_merchant_id = payboxMerchantId

  // Создание строки для подписи
  let signatureString = Object.entries(formData)
    .sort()
    .map(([key, value]) => value)
    .concat(secretKey)
    .join(';');

  signatureString = `${formData.script};${signatureString}`
  console.log(signatureString)
  // Генерация подписи
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
    
    // Теперь вы можете обращаться к полям ответа, например:
    const paymentId = parsedResponse.response.pg_payment_id;
    const redirectUrl = parsedResponse.response.pg_redirect_url;
    
    res.json({paymentId, redirectUrl})

    // console.log('Ответ от PayBox:', response.data);
    // Здесь вы можете обработать ответ от PayBox
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

export { paymentRoute }