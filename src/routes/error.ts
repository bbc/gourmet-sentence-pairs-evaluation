import { Request, Response, Application } from 'express';
import { getErrorText } from '../uiText';

const buildErrorRoute = (app: Application) => {
  app.get('/error', (req: Request, res: Response) => {
    const errorCode = req.query.errorCode || 'generalError';
    const errorMessage = getErrorText(errorCode);
    res.status(404).render('error', { errorMessage });
  });
};

export { buildErrorRoute };
