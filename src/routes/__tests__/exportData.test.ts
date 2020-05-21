import * as supertest from 'supertest';
import app from '../../app';
import { SuperTest, Test } from 'supertest';
import {
  SentencePairScore,
  SentenceSetFeedback,
  SentenceSet,
} from '../../models/models';
import { removeDuplicateAnswers } from '../exportData';

jest.mock('../../DynamoDB/dynamoDBApi');
const dynamoDBApi = require('../../DynamoDB/dynamoDBApi');

describe('GET /exportData', () => {
  let mockApp: SuperTest<Test>;
  beforeAll(() => {
    mockApp = supertest(app);
  });

  test('should return 200', async () => {
    dynamoDBApi.getSentenceSets.mockImplementation(() => {
      return Promise.resolve([
        new SentenceSet(
          'name',
          'bg',
          'en',
          new Set(),
          new Set(),
          'setId',
          new Set()
        ),
      ]);
    });
    const response = await mockApp.get('/exportData');
    expect(response.status).toBe(200);
  });
});

describe('POST /exportData', () => {
  let mockApp: SuperTest<Test>;

  beforeAll(() => {
    mockApp = supertest(app);
  });

  test('should return 200 if scores were successfully retrieved and saved to file', async () => {
    dynamoDBApi.getSentencePairScores.mockImplementation(() => {
      return Promise.resolve([
        new SentencePairScore(
          'sentencePairId',
          'evaluatorId',
          1,
          2,
          'bg',
          'human',
          'machine',
          'original',
          'id'
        ),
      ]);
    });

    dynamoDBApi.getSentenceSetFeedback.mockImplementation(() => {
      return Promise.resolve([
        new SentenceSetFeedback(
          'feedbackId',
          'evaluatorId',
          'feedback',
          'setId',
          'targetLanguage'
        ),
      ]);
    });

    const response = await mockApp.post('/exportData').send({ language: 'sw' });
    expect(response.status).toBe(200);
    expect(response.header['content-disposition']).toEqual(
      'attachment; filename="sw.zip"'
    );
    expect(response.header['content-type']).toEqual('application/zip');
  });

  test('should redirect to the error page with a 500 if scores cannot be retrieved from dynamoDB', async () => {
    dynamoDBApi.getSentencePairScores.mockImplementation(() => {
      return Promise.reject('error');
    });

    dynamoDBApi.getSentenceSetFeedback.mockImplementation(() => {
      return Promise.resolve([
        new SentenceSetFeedback(
          'feedbackId',
          'evaluatorId',
          'feedback',
          'setId',
          'targetLanguage'
        ),
      ]);
    });

    const response = await mockApp
      .post('/exportData')
      .send({ language: 'SWAHILI' });
    expect(response.status).toBe(500);
    expect(response.header['location']).toEqual(
      '/error?errorCode=postExportDataFailCSVCreate'
    );
  });

  test('should redirect to the error page with a 500 if feedback cannot be retrieved from dynamoDB', async () => {
    dynamoDBApi.getSentencePairScores.mockImplementation(() => {
      return Promise.resolve([
        new SentencePairScore(
          'sentencePairId',
          'evaluatorId',
          1,
          2,
          'bg',
          'human',
          'machine',
          'original',
          'id'
        ),
      ]);
    });

    dynamoDBApi.getSentenceSetFeedback.mockImplementation(() => {
      return Promise.reject('error');
    });

    const response = await mockApp
      .post('/exportData')
      .send({ language: 'SWAHILI' });
    expect(response.status).toBe(500);
    expect(response.header['location']).toEqual(
      '/error?errorCode=postExportDataFailCSVCreate'
    );
  });
});

describe('removeDuplicateAnswers', () => {
  test('should remove newer duplicate answers created with the same evaluatorId', () => {
    const sentencePair1ScoreDuplicate = new SentencePairScore(
      'sentenceId1',
      'evaluatorId1',
      100,
      40,
      'target',
      'humanTranslation',
      'machineTranslation',
      'original',
      'type',
      'scoreId',
      200
    );

    const sentencePair1ScoreEarliest = new SentencePairScore(
      'sentenceId1',
      'evaluatorId1',
      100,
      40,
      'target',
      'humanTranslation',
      'machineTranslation',
      'original',
      'type',
      'scoreId',
      100
    );

    const sentencePair1Score = new SentencePairScore(
      'sentenceId1',
      'evaluatorId2',
      70,
      40,
      'target',
      'humanTranslation',
      'machineTranslation',
      'original',
      'type',
      'scoreId',
      123
    );

    const sentencePair2Score = new SentencePairScore(
      'sentenceId2',
      'evaluatorId1',
      90,
      30,
      'target',
      'humanTranslation',
      'machineTranslation',
      'original',
      'type',
      'scoreId',
      100
    );

    const sentencePairsScores = [
      sentencePair1ScoreDuplicate,
      sentencePair1ScoreEarliest,
      sentencePair1Score,
      sentencePair2Score,
    ];

    const expectedResult = [
      sentencePair1ScoreEarliest,
      sentencePair1Score,
      sentencePair2Score,
    ];

    expect(removeDuplicateAnswers(sentencePairsScores)).toEqual(expectedResult);
  });
});
