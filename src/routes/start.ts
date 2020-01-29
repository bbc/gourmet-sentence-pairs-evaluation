import { Request, Response, Application } from 'express';
import { getSentenceSets } from '../DynamoDB/dynamoDBApi';

const buildStartRoute = (app: Application) => {
  app.get('/start', (req: Request, res: Response) => {
    getSentenceSets().then(sentenceSets => {
      res.render('start', { sentenceSets, evaluatorIds });
    });
  });
};

const evaluatorIds = [
  'BBC_Bulgarian_01',
  'BBC_Bulgarian_02',
  'BBC_Bulgarian_03',
  'BBC_Bulgarian_04',
  'BBC_Swahili_01',
  'BBC_Swahili_02',
  'BBC_Swahili_03',
  'BBC_Swahili_04',
  'BBC_Gujarati_01',
  'BBC_Gujarati_02',
  'BBC_Gujarati_03',
  'BBC_Gujarati_04',
  'BBC_Turkish_01',
  'BBC_Turkish_02',
  'BBC_Turkish_03',
  'BBC_Turkish_04',
  'DW_Bulgarian_01',
  'DW_Bulgarian_02',
  'DW_Bulgarian_03',
  'DW_Bulgarian_04',
  'DW_Swahili_01',
  'DW_Swahili_02',
  'DW_Swahili_03',
  'DW_Swahili_04',
  'DW_Gujarati_01',
  'DW_Gujarati_02',
  'DW_Gujarati_03',
  'DW_Gujarati_04',
  'DW_Turkish_01',
  'DW_Turkish_02',
  'DW_Turkish_03',
  'DW_Turkish_04',
  'tester',
];

export { buildStartRoute };
