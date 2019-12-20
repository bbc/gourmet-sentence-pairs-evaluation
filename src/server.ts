const port = process.env.PORT || 8080;
import { logger } from './utils/logger';
import app from './app';

app.listen(port, () => {
  logger.info(`App running on port ${port}`);
});
