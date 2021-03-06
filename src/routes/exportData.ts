import { Request, Response, Router } from 'express';
import {
  getSentencePairScores,
  getSentenceSetFeedback,
  getSentenceSets,
} from '../DynamoDB/dynamoDBApi';
import { logger } from '../utils/logger';
import {
  SentencePairScore,
  SentenceSetFeedback,
  SentenceSet,
  EvaluatorSet,
} from '../models/models';
import { createObjectCsvWriter } from 'csv-writer';
import { ExportRequest } from '../models/requests';
import { groupBy, flatten, sortBy } from 'underscore';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';

const buildExportDataRoute = (router: Router) => {
  getExportData(router);
  postExportData(router);
};

const getExportData = (router: Router) => {
  router.get('/exportData', (req: Request, res: Response) => {
    getSentenceSets()
      .then(sentenceSets => {
        const evaluatorSets = sentenceSets
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(sentenceSet => convertSentenceSetToEvaluatorSet(sentenceSet));
        const languages = evaluatorSets.map(set => set.targetLanguage);
        const languageOptions: string[] = languages.filter(
          (item, index) => languages.indexOf(item) === index
        );
        res
          .status(200)
          .render('exportData', { evaluatorSets, languageOptions });
      })
      .catch(error => {
        logger.info(`Could not get sentence sets: Error: ${error}`);
        res
          .status(200)
          .render('exportData', { evaluatorSets: [], languageOptions: [] });
      });
  });
};

const convertSentenceSetToEvaluatorSet = (
  sentenceSet: SentenceSet
): EvaluatorSet => {
  const evaluatorIds = Array.from(sentenceSet.evaluatorIds || []);
  const evaluatorIdsAsString =
    evaluatorIds.length === 0
      ? 'NONE'
      : evaluatorIds.reduce((acc, evaluator) => `${acc}, ${evaluator}`);
  return {
    setName: sentenceSet.name,
    evaluators: evaluatorIdsAsString,
    targetLanguage: sentenceSet.targetLanguage,
  };
};

const postExportData = (router: Router) => {
  router.post('/exportData', (req: ExportRequest, res: Response) => {
    sendData(req.body.language, res);
  });
};

const sendData = (language: string, res: Response) => {
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

const generateScoresCSV = (language: string): Promise<string> => {
  const filename = `/tmp/${language}-sentence-pair-scores.csv`;
  return getSentencePairScores(language)
    .then(scores => createScoresCSVFile(scores, filename, language))
    .then(_ => filename);
};

const generateFeedbackCSV = (language: string): Promise<string> => {
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
  language: string
): Promise<void> => {
  const scoresWithHumanReadableSentenceId = makeSentenceIdsHumanReadable(
    scores,
    language
  );

  const filteredScores = removeDuplicateAnswers(
    scoresWithHumanReadableSentenceId
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

  return csvWriter.writeRecords(filteredScores);
};

const removeDuplicateAnswers = (
  scores: SentencePairScore[]
): SentencePairScore[] => {
  const scoresGroupedBySegmentId = Object.values(
    groupBy<SentencePairScore>(scores, 'sentencePairId')
  );

  const filteredScores: SentencePairScore[][] = scoresGroupedBySegmentId.map(
    score => {
      const scoresGroupedByEvaluatorId = Object.values(
        groupBy<SentencePairScore>(score, 'evaluatorId')
      );
      const sentenceScores: SentencePairScore[] = scoresGroupedByEvaluatorId.map(
        sentenceScore => {
          const earliestSentenceScore = sortBy<SentencePairScore>(
            sentenceScore,
            'timestamp'
          );
          return earliestSentenceScore[0];
        }
      );
      return sentenceScores;
    }
  );
  return flatten(filteredScores);
};

/**
 * When data is exported the sentenceIds need to be human readable
 * This groups the sentences by ID and reassigns sentences a human readable ID
 */
const makeSentenceIdsHumanReadable = (
  scores: SentencePairScore[],
  language: string
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

export { buildExportDataRoute, removeDuplicateAnswers };
