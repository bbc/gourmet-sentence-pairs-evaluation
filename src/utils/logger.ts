import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, label, printf } = format;
const { Console, File } = transports;
import * as WinstonCloudWatch from 'winston-cloudwatch';
import '../config';

const logFormat = printf(logInfo => {
  return `${logInfo.timestamp} [${logInfo.label}] ${logInfo.level}: ${logInfo.message}`;
});

const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: combine(
    label({ label: process.env.LOG_NAME }),
    timestamp(),
    logFormat
  ),
  transports: new File({
    filename: `./logs/${process.env.LOG_FILE}`,
    level: process.env.LOG_LEVEL,
  }),
});

if (process.env.NODE_ENV === 'development') {
  logger.add(new Console());
} else {
  logger.add(
    new WinstonCloudWatch({
      level: process.env.LOG_LEVEL,
      logGroupName: process.env.LOG_NAME,
      logStreamName: process.env.LOG_NAME,
      awsRegion: process.env.AWS_REGION,
    })
  );
}

export { logger };
