import * as supertest from 'supertest';
import app from '../../app';
import { SuperTest, Test } from 'supertest';
import { SentencePairScore } from '../../models/models';

jest.mock('../../DynamoDB/dynamoDBApi');
const dynamoDBApi = require('../../DynamoDB/dynamoDBApi');

describe('/exportData/:language.csv', () => {
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
          'bg',
          'human',
          'machine',
          'original',
          'id'
        ),
      ]);
    });

    const response = await mockApp.get('/exportData/bulgarian.csv');
    expect(response.status).toBe(200);
  });

  test('should redirect and never call createScoresCSVFile if data cannot be got from dynamoDB', async () => {
    dynamoDBApi.getSentencePairScores.mockImplementation(() => {
      return Promise.reject('error');
    });

    const response = await mockApp.get('/exportData/bulgarian.csv');
    expect(response.redirect).toBeTruthy();
  });
});

describe('GET /exportData', () => {
  let mockApp: SuperTest<Test>;
  beforeAll(() => {
    mockApp = supertest(app);
  });

  test('should return 200', async () => {
    const response = await mockApp.get('/exportData');
    expect(response.status).toBe(200);
  });
});
