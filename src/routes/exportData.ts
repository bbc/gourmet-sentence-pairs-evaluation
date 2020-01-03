import { Request, Response, Application } from 'express';
import { getSentencePairScores } from '../DynamoDB/dynamoDBApi';
import { logger } from '../utils/logger';
import { SentencePairScore } from '../models/models';
import { createObjectCsvWriter } from 'csv-writer';
import { Language } from '../models/models';
import { ExportRequest } from '../models/requests';

const buildExportDataRoute = (app: Application) => {
  getExportData(app);
  postExportData(app);
};

const getExportData = (app: Application) => {
  app.get('/exportData', (req: Request, res: Response) => {
    const languageOptions = generateLanguageOptions();
    res.status(200).render('exportData', { languageOptions });
  });
};

const postExportData = (app: Application) => {
  app.post('/exportData', (req: ExportRequest, res: Response) => {
    const language = req.body.language.toUpperCase();

    const languageEnum: Language = (Language as any)[language];
    if (languageEnum === undefined) {
      logger.error(
        `Invalid language parameter could not convert ${language} into Language enum`
      );
      res.redirect(404, '/error?errorCode=postExportFailLanguage');
    } else {
      sendScoresCSVFile(languageEnum, res);
    }
  });
};

const sendScoresCSVFile = (language: Language, res: Response) => {
  getSentencePairScores(language)
    .then(scores => {
      const fileName = '/tmp/sentence-pair-scores.csv';
      return createScoresCSVFile(scores, fileName).then(() => {
        res.set({
          'Content-Disposition': `attachment; filename="${language}.csv"`,
        });
        res.status(200).sendFile(fileName);
      });
    })
    .catch(error => {
      logger.error(`Could not create CSV file. Error: ${error}`);
      res.redirect(500, '/error?errorCode=postExportDataFailCSVCreate');
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
      { id: 'q2Score', title: 'q2 score' },
      { id: 'targetLanguage', title: 'target language' },
      { id: 'humanTranslation', title: 'human translation' },
      { id: 'machineTranslation', title: 'machine translation' },
      { id: 'original', title: 'original' },
    ],
    encoding: 'utf8',
  });

  return csvWriter.writeRecords(scores);
};

const generateLanguageOptions = () => {
  const languages = Object.keys(Language);
  // Get all possible values for Language enum
  const languageOptions = languages.map((languageName, i) => {
    return {
      displayName:
        languageName.charAt(0).toUpperCase() +
        languageName.slice(1).toLowerCase(),
      language: languageName,
    };
  });
  return languageOptions;
};

export { buildExportDataRoute, generateLanguageOptions };
