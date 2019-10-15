import { Response, Application } from 'express';

const buildEndRoute = (app: Application) => {
  app.get('/end', (res: Response) => {
    res.render('infoGeneric', {
      title: 'Evaluation Complete',
      subtitle: 'Thank you for taking part.',
    });
  });
};
export { buildEndRoute };
