const jwt = require('jsonwebtoken');

const payload = {
  iss: "http://127.0.0.1:8000/api/system/movie/login",
  jti: "MfYy2h4yQr8n6JNE",
  sub: "134281",
  prv: "23bd5c8949f600adb39e701c400872db7a5976f7",
  token: "6af621ef-2bcb-413c-b9fd-be53079a736f",
  op: null,
  branch_id: null,
  roles: {
    movie_admin: "admin"
  },
  full_name: "Testerr"
};

const secret  = "secretsecretsecretsecretsecretsecret";
const expiresIn = "1d";

const token = jwt.sign(payload, secret, { expiresIn });
console.log(token);