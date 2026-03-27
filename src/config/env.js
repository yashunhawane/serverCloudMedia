import dotenv from "dotenv";

dotenv.config();

export const requireEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined in .env`);
  }

  return value;
};
