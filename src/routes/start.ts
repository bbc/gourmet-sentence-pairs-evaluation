import { Response, Application } from 'express';
import { getSentenceSets } from '../DynamoDB/dynamoDBApi';

const buildStartRoute = (app: Application) => {
  app.get('/start', (res: Response) => {
    getSentenceSets().then(sentenceSets => {
      res.render('start', { sentenceSets });
    });
  });
};

export { buildStartRoute };
