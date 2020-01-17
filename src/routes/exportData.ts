import { Request, Response, Application } from 'express';
import {
  getSentencePairScores,
  getSentenceSetFeedback,
} from '../DynamoDB/dynamoDBApi';
import { logger } from '../utils/logger';
import { SentencePairScore, SentenceSetFeedback } from '../models/models';
import { createObjectCsvWriter } from 'csv-writer';
import { Language } from '../models/models';
import { ExportRequest } from '../models/requests';
import { groupBy, flatten } from 'underscore';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';

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
      sendData(languageEnum, res);
    }
  });
};

const sendData = (language: Language, res: Response) => {
  const zipFileName = `/tmp/${language}.zip`;
  Promise.all([generateScoresCSV(language), generateFeedbackCSV(language)])
    .then(filesToZip => zipFiles(filesToZip, zipFileName))
    .then(_ => {
      res.set({
        'Content-Disposition': `attachment; filename="${language}.zip"`,
      });
      res.sendFile(zipFileName);
    })
    .catch(error => {
      logger.error(`Could not create CSV files. Error: ${error}`);
      res.redirect(500, '/error?errorCode=postExportDataFailCSVCreate');
    });
};

const generateScoresCSV = (language: Language): Promise<string> => {
  const filename = `/tmp/${language}-sentence-pair-scores.csv`;
  return getSentencePairScores(language)
    .then(scores => createScoresCSVFile(scores, filename, language))
    .then(_ => filename);
};

const generateFeedbackCSV = (language: Language): Promise<string> => {
  const filename = `/tmp/${language}-feedback.csv`;
  return getSentenceSetFeedback(language)
    .then(feedback => createFeedbackCSVFile(feedback, filename))
    .then(_ => filename);
};

const zipFiles = (filesToZip: string[], zipFileName: string): Promise<void> => {
  const stream = createWriteStream(zipFileName);
  const archive = archiver('zip');
  archive.pipe(stream);
  filesToZip.map(filename => archive.file(filename, {}));
  archive.finalize();

  return new Promise<void>((resolve, reject) => {
    stream.on('close', resolve);
    stream.on('error', reject);
  });
};

const createScoresCSVFile = (
  scores: SentencePairScore[],
  fileName: string,
  language: Language
): Promise<void> => {
  const scoresWithHumanReadableSentenceId = makeSentenceIdsHumanReadable(
    scores,
    language
  );

  const csvWriter = createObjectCsvWriter({
    path: fileName,
    header: [
      { id: 'sentencePairId', title: 'sentence pair id' },
      { id: 'sentencePairType', title: 'sentence pair type' },
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

  return csvWriter.writeRecords(scoresWithHumanReadableSentenceId);
};

/**
 * When data is exported the sentenceIds need to be human readable
 * This groups the sentences by ID and reassigns sentences a human readable ID
 */
const makeSentenceIdsHumanReadable = (
  scores: SentencePairScore[],
  language: Language
): SentencePairScore[] => {
  const scoresGroupedBySentencePairId = groupBy<SentencePairScore>(
    scores,
    'sentencePairId'
  );
  const sentenceGroups: SentencePairScore[][] = Object.values(
    scoresGroupedBySentencePairId
  );

  const scoresWithHumanReadableSentenceId = sentenceGroups.map(
    (sentenceScores, i) => {
      return sentenceScores.map(
        score =>
          new SentencePairScore(
            `${language.toUpperCase()}_SE_${i + 1}`,
            score.evaluatorId,
            score.q1Score,
            score.q2Score,
            score.targetLanguage,
            score.humanTranslation,
            score.machineTranslation,
            score.original,
            score.sentencePairType,
            score.scoreId
          )
      );
    }
  );
  return flatten(scoresWithHumanReadableSentenceId);
};

const createFeedbackCSVFile = (
  feedback: SentenceSetFeedback[],
  filename: string
): Promise<void> => {
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      { id: 'evaluatorId', title: 'evaluator id' },
      { id: 'feedback', title: 'feedback' },
      { id: 'targetLanguage', title: 'target language' },
    ],
    encoding: 'utf8',
  });
  return csvWriter.writeRecords(feedback);
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
