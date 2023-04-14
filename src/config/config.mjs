import * as dotenv from 'dotenv';

dotenv.config();

const config = {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB,
    JWT_SECRET: process.env.JWT_SECRET,
}

export default config;