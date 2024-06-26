const configurar = require("dotenv")

configurar.config()

const AWS_ACCESS_KEY = process.env.DIEGO_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.DIEGO_SECRET_ACCESS_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;

console.log(AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_BUCKET_REGION)