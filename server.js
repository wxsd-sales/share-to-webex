import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import 'dotenv/config';
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 5000;

const MAX_COOKIE_AGE_DAYS = 7
const cookieOptions = { maxAge: 86400 * 1000 * MAX_COOKIE_AGE_DAYS, secure:true, sameSite: "lax"}

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(path.join(__dirname, 'src'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.json());

var router = express.Router();
// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function(req, res, next) {
  if(req.url !== "/status"){
    console.log('%s %s', req.method, req.url);
  }
  next();
});

router.get('/', (req, res) => {
  console.log("Cookies:");
  console.log(req.cookies)
  if(req.cookies?.access_token){
    res.sendFile(path.join(__dirname, 'src', 'main.html'));
  } else {
    let redirectUri = `https://webexapis.com/v1/authorize?client_id=${process.env.CLIENT_ID}&response_type=code`;
    redirectUri += `&redirect_uri=${encodeURIComponent(process.env.BASE_URI)}%2Foauth&scope=${process.env.SCOPES}`;
    redirectUri += `&state=${req.url}`
    console.log('redirectUri:', redirectUri);
    res.redirect(redirectUri);
  }
});

router.get('/oauth', async (req, res) => {
  console.log('req.query:');
  console.log(req.query);
  let payload = `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&`;
  payload += `grant_type=authorization_code&code=${req.query.code}&`;
  payload += `redirect_uri=${process.env.BASE_URI}/oauth`;
  let resp = await fetch('https://webexapis.com/v1/access_token',{
    method: "POST",
    headers:{
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload
  });
  let json = await resp.json();
  console.log('/access_token response json:', json);
  res.cookie("access_token", json.access_token, cookieOptions);

  let meetingPrefs = await fetch('https://webexapis.com/v1/meetingPreferences',{
    method: "GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${json.access_token}`
    },
  });
  let meetJson = await meetingPrefs.json();
  console.log('/meetingPreferences response json:', meetJson);
  let siteUrl;
  if(meetJson.sites?.length > 0){
    for(let site of meetJson.sites){
      siteUrl = site.siteUrl;
      if(site.default){
        break;
      }
    }
  }
  if(!siteUrl){
    siteUrl = "null";
  }
  console.log("siteUrl:", siteUrl);
  res.cookie("webex_site", siteUrl, cookieOptions);
  res.redirect(req.query.state);
})


app.use(`/`, router);
app.listen(port, async () => {
  console.log(`listening on ${port}`);
});
