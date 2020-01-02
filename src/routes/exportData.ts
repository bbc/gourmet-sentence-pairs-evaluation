import { Request, Response, Application } from 'express';
import { getSentencePairScores } from '../DynamoDB/dynamoDBApi';
import { logger } from '../utils/logger';
import { SentencePairScore } from '../models/models';
import { createObjectCsvWriter } from 'csv-writer';

const buildExportDataRoute = (app: Application) => {
  getExportData(app);
  getExportDataCSV(app);
};

const getExportData = (app: Application) => {
  app.get('/exportData', (req: Request, res: Response) => {
    res.render('exportData', {});
  });
};

const getExportDataCSV = (app: Application) => {
  app.get('/exportData/:language.csv', (req: Request, res: Response) => {
    getSentencePairScores()
      .then(scores => {
        const fileName = '/tmp/sentence-pair-scores.csv';
        return createScoresCSVFile(scores, fileName).then(() => {
          res.sendFile(fileName);
        });
      })
      .catch(error => {
        logger.error(`Could not create CSV file. Error: ${error}`);
        res.redirect('/error?errorCode=getScoresCSV');
      });
  });
};

const createScoresCSVFile = (
  scores: SentencePairScore[],
  fileName: string
): Promise<void> => {
  const csvWriter = createObjectCsvWriter({
    path: fileName,
    header: [
      { id: 'scoreId', title: 'id' },
      { id: 'sentencePairId', title: 'sentence pair id' },
      { id: 'evaluatorId', title: 'evaluator id' },
      { id: 'q1Score', title: 'q1 score' },
      { id: 'targetLanguage', title: 'target language' },
      { id: 'humanTranslation', title: 'human translation' },
      { id: 'machineTranslation', title: 'machine translation' },
      { id: 'original', title: 'original' },
    ],
    encoding: 'utf8',
  });

  return csvWriter.writeRecords(scores);
};

export { buildExportDataRoute };
