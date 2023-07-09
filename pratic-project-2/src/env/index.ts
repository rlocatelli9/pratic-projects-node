import 'dotenv/config'
import { z as zod } from 'zod'

const envSchema = zod.object({
  NODE_ENV: zod
    .enum(['development', 'staging', 'production'])
    .default('production'),
  DATABASE_CLIENT: zod.string(),
  DATABASE_URL: zod.string(),
  PORT: zod.number().default(3333),
})

export const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const parsedEnv = _env.data
