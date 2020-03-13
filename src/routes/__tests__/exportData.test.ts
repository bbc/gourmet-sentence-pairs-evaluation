import * as supertest from 'supertest';
import app from '../../app';
import { SuperTest, Test } from 'supertest';
import {
  SentencePairScore,
  SentenceSetFeedback,
  SentenceSet,
  Language,
} from '../../models/models';
import { generateLanguageOptions } from '../exportData';

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
          Language.BULGARIAN,
          Language.ENGLISH,
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

    const response = await mockApp
      .post('/exportData')
      .send({ language: 'SWAHILI' });
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

  test('should redirect to the error page with a 404 if the language value sent is not valid', async () => {
    const response = await mockApp
      .post('/exportData')
      .send({ language: 'FAKE' });
    expect(response.status).toBe(404);
    expect(response.header['location']).toEqual(
      '/error?errorCode=postExportFailLanguage'
    );
  });
});

describe('generateLanguageOptions', () => {
  test('should return a list with an object for all language options available according to the Language enum', () => {
    const expectedResponse = [
      { displayName: 'Bulgarian', language: 'BULGARIAN' },
      { displayName: 'Gujarati', language: 'GUJARATI' },
      { displayName: 'Swahili', language: 'SWAHILI' },
      { displayName: 'Turkish', language: 'TURKISH' },
      { displayName: 'English', language: 'ENGLISH' },
    ];

    expect(generateLanguageOptions()).toEqual(expectedResponse);
  });
});
