import { getSentencePairScores, putSentencePairScore } from '../dynamoDBApi';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import '../../config';
import { SentencePairScore } from '../../models/models';

describe('getSentencePairScores', () => {
  const config = {
    convertEmptyValues: true,
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  };

  const mockDynamoClient = new DocumentClient(config);

  test('should retrieve scores put into the DB', () => {
    const sentencePairScore = new SentencePairScore(
      '1',
      '2',
      5,
      'bg',
      'human',
      'machine',
      'original',
      '10'
    );
    return putSentencePairScore(sentencePairScore, mockDynamoClient).then(_ => {
      return getSentencePairScores(mockDynamoClient).then(scores => {
        expect(
          scores.filter(
            score =>
              score.sentencePairId === '1' &&
              score.evaluatorId === '2' &&
              score.q1Score === 5 &&
              score.targetLanguage === 'bg' &&
              score.humanTranslation === 'human' &&
              score.machineTranslation === 'machine' &&
              score.original === 'original' &&
              score.scoreId === '10'
          ).length
        ).toEqual(1);
      });
    });
  });

  test('should handle items with missing parameters', async () => {
    await mockDynamoClient
      .put({
        Item: { scoreId: '123' },
        TableName: 'SentenceScoreDynamoDBTable-dev',
      })
      .promise();
    return getSentencePairScores(mockDynamoClient).then(scores => {
      expect(
        scores.filter(
          score =>
            score.scoreId === '123' &&
            score.sentencePairId === 'undefined' &&
            score.evaluatorId === 'undefined' &&
            score.q1Score === 0 &&
            score.targetLanguage === 'undefined' &&
            score.humanTranslation === 'undefined' &&
            score.machineTranslation === 'undefined' &&
            score.original === 'undefined'
        ).length
      ).toEqual(1);
    });
  });
});
