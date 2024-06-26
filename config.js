const configurar = require("dotenv")

configurar.config()

export const AWS_ACCESS_KEY = process.env.DIEGO_ACCESS_KEY;
export const AWS_SECRET_ACCESS_KEY = process.env.DIEGO_SECRET_ACCESS_KEY;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
