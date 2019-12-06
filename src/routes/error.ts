import { Request, Response, Application } from 'express';
import { getErrorText } from '../uiText';
import { logger } from '../utils/logger';

const buildErrorRoute = (app: Application) => {
  app.get('/error', (req: Request, res: Response) => {
    const errorCode = req.query.errorCode || 'generalError';
    const errorMessage = getErrorText(errorCode);
    logger.info(`Error page triggered. Error code: ${errorCode}`);
    res.status(404).render('error', { errorMessage });
  });
};

export { buildErrorRoute };
