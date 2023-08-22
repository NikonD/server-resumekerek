import axios from 'axios'
import config from '../config/config.json'
const formUrlEncoded = x =>
  Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')


const epayAuthToken = async () => {
  try {
    let result = await axios({
      url: `${config.EPAY_URL}/epay2/oauth2/token`,
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: formUrlEncoded({
        grant_type: "client_credentials",
        scope: "webapi usermanagement email_send verification statement statistics payment",
        client_id: config.EPAY_ClientID,
        client_secret: config.EPAY_CLIENT_SECRET,
        invoiceID: `${new Date().getTime()}`,
        amount: 123,
        currency: "KZT",
        terminal: config.EPAY_TerminalID,
        postLink: "https://example.kz/?s",
        failurePostLink: "https://example.kz/?e",
      })
    })

    console.log("AUTH", result.data)
    return result.data
  } catch (e: any) {
    console.log("AUTH", e)
    return null
  }
}


export { epayAuthToken }