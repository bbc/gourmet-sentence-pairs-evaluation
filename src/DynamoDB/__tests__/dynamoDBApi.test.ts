import { getSentencePairScores, putSentencePairScore } from '../dynamoDBApi';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import '../../config';
import { SentencePairScore, Language } from '../../models/models';

describe('getSentencePairScores', () => {
  const config = {
    convertEmptyValues: true,
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  };

  const mockDynamoClient = new DocumentClient(config);

  beforeAll(() => {
    const sentencePairScoreBG1 = new SentencePairScore(
      '1',
      '2',
      5,
      'BG',
      'human',
      'machine',
      'original',
      '10'
    );
    const sentencePairScoreBG2 = new SentencePairScore(
      '1',
      '2',
      5,
      'BG',
      'human',
      'machine',
      'original',
      '11'
    );
    const sentencePairScoreGU1 = new SentencePairScore(
      '1',
      '2',
      5,
      'GU',
      'human',
      'machine',
      'original',
      '12'
    );
    return putSentencePairScore(sentencePairScoreBG1, mockDynamoClient)
      .then(_ => putSentencePairScore(sentencePairScoreBG2, mockDynamoClient))
      .then(_ => putSentencePairScore(sentencePairScoreGU1, mockDynamoClient));
  });

  test('should only retrieve scores put into the DB with the requested language', () => {
    return getSentencePairScores(Language.BULGARIAN, mockDynamoClient).then(
      scores => {
        expect(scores.length).toEqual(2);
      }
    );
  });

  test('should retrieve scores put into the DB', () => {
    return getSentencePairScores(Language.BULGARIAN, mockDynamoClient).then(
      scores => {
        expect(
          scores.filter(
            score =>
              score.sentencePairId === '1' &&
              score.evaluatorId === '2' &&
              score.q1Score === 5 &&
              score.targetLanguage === 'BG' &&
              score.humanTranslation === 'human' &&
              score.machineTranslation === 'machine' &&
              score.original === 'original' &&
              score.scoreId === '10'
          ).length
        ).toEqual(1);
      }
    );
  });

  test('should return an empty list if there are no scores for a specified language', () => {
    return getSentencePairScores(Language.SWAHILI, mockDynamoClient).then(
      scores => {
        expect(scores.length).toEqual(0);
      }
    );
  });

  test('should handle items with missing parameters', async () => {
    await mockDynamoClient
      .put({
        Item: { scoreId: '123', targetLanguage: 'BG' },
        TableName: 'SentenceScoreDynamoDBTable-dev',
      })
      .promise();
    return getSentencePairScores(Language.BULGARIAN, mockDynamoClient).then(
      scores => {
        expect(
          scores.filter(
            score =>
              score.scoreId === '123' &&
              score.targetLanguage === 'BG' &&
              score.sentencePairId === 'undefined' &&
              score.evaluatorId === 'undefined' &&
              score.q1Score === 0 &&
              score.humanTranslation === 'undefined' &&
              score.machineTranslation === 'undefined' &&
              score.original === 'undefined'
          ).length
        ).toEqual(1);
      }
    );
  });
});
