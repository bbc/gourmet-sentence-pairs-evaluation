import { Request, Response, Application } from 'express';

const buildIndexRoute = (app: Application) => {
  app.get('/', (req: Request, res: Response) => {
    res.render('index', {
      datasetSubmissionUrl: '/auth/dataset',
      exportDataUrl: '/auth/exportData',
    });
  });
};

export { buildIndexRoute };
