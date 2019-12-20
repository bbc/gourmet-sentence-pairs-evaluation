import { Request, Response, Application } from 'express';
import { getSentencePairScores } from '../DynamoDB/dynamoDBApi';
import { createWriteStream } from 'fs';
import { logger } from '../utils/logger';
import { SentencePairScore } from '../models/models';

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
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const writeStream = createWriteStream(fileName);

    scores.map(score => {
      writeStream.write(`${score.convertToCSV()}\n`);
    });
    writeStream.end();

    writeStream.on('error', error => reject(error.toString()));
    writeStream.on('finish', () => {
      logger.info(`Successfully created Score Data Set CSV file`);
      resolve(fileName);
    });
  });
};

export { buildExportDataRoute };
