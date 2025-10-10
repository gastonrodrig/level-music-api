import { IsNumber, IsString, validateSync } from "class-validator";
import { plainToClass } from "class-transformer";

class EnvConfig {
  @IsNumber()
  API_PORT: number;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  ENVIRONMENT: string;

  @IsString()
  ISSUER_BASE_URL: string;

  @IsString()
  AUDIENCE: string;

  @IsString()
  AUTH0_ISSUER_BASE_URL: string;

  @IsString()
  TOKEN_ALG: string;

  @IsString()
  AUTH0_CLIENT_ID: string;

  @IsString()
  AUTH0_CLIENT_SECRET: string;

  @IsString()
  AUTH0_DOMAIN: string;

  @IsString()
  CULQI_PUBLIC: string;

  @IsString()
  CUQUI_SECRET: string;

  @IsString()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  TWILIO_WHATSAPP_NUMBER: string;
}

// Convertir y validar variables de entorno
function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvConfig,
    {
      ...config,
      API_PORT: config.API_PORT ? parseInt(config.API_PORT as string, 10) : undefined,
      DB_PORT: config.DB_PORT ? parseInt(config.DB_PORT as string, 10) : undefined,
    },
    { enableImplicitConversion: true },
  );
  
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}

export const envConfig = validateConfig(process.env);

export const envs = {
  API_PORT: envConfig.API_PORT,
  DB_PASSWORD: envConfig.DB_PASSWORD,
  DB_NAME: envConfig.DB_NAME,
  DB_HOST: envConfig.DB_HOST,
  DB_PORT: envConfig.DB_PORT,
  DB_USERNAME: envConfig.DB_USERNAME,
  ENVIRONMENT: envConfig.ENVIRONMENT,
  ISSUER_BASE_URL: envConfig.ISSUER_BASE_URL,
  AUDIENCE: envConfig.AUDIENCE,
  AUTH0_ISSUER_BASE_URL: envConfig.AUTH0_ISSUER_BASE_URL,
  TOKEN_ALG: envConfig.TOKEN_ALG,
  AUTH0_CLIENT_ID: envConfig.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: envConfig.AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN: envConfig.AUTH0_DOMAIN,
  CULQI_PUBLIC: envConfig.CULQI_PUBLIC,
  CUQUI_SECRET: envConfig.CUQUI_SECRET,
  TWILIO_ACCOUNT_SID: envConfig.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: envConfig.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER: envConfig.TWILIO_WHATSAPP_NUMBER
}