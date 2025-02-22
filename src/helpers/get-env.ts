import dotenv from 'dotenv';
dotenv.config();

export default function getEnv(name: string): string {
  if (process.env[name]) return process.env[name]!;

  const error = new Error(`Missing envinronment variable: ${name}`);
  console.log(error);
  process.exit(1);
}
