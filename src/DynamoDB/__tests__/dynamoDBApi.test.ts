import { getSentencePairScores, putSentencePairScore } from '../dynamoDBApi';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import '../../config';

describe('getSentencePairScores', () => {
  const config = {
    convertEmptyValues: true,
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  };

  const mockDynamoClient = new DocumentClient(config);

  test('should retrieve scores put into the DB', () => {
    return putSentencePairScore('1', 5, '2', mockDynamoClient).then(_ => {
      return getSentencePairScores(mockDynamoClient).then(scores => {
        expect(
          scores.filter(
            score =>
              score.sentencePairId === '1' &&
              score.evaluatorId === '2' &&
              score.score === 5
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
            score.score === 0
        ).length
      ).toEqual(1);
    });
  });
});
