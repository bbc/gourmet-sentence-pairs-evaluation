import { existsSync, readFileSync } from 'fs';
import * as dotenv from 'dotenv';

const loadConfig = () => {
  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }

  try {
    if (existsSync('.env.override')) {
      const envConfig: dotenv.DotenvParseOutput = dotenv.parse(
        readFileSync('.env.override')
      );

      Object.keys(envConfig).map(key => {
        process.env[key] = envConfig[key];
      });
    }
  } catch (err) {
    console.info('No override file found');
  }
};

export { loadConfig };
