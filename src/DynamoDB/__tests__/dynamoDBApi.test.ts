import {
  getSentencePairScores,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSetFeedback,
} from '../dynamoDBApi';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import '../../config';
import { SentencePairScore, Language } from '../../models/models';

const config = {
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'local-env',
};

const mockDynamoClient = new DocumentClient(config);

describe('getSentenceSetFeedback', () => {
  beforeAll(() => {
    return putSentenceSetFeedback(
      '1',
      'good',
      '1',
      Language.BULGARIAN,
      mockDynamoClient
    )
      .then(_ =>
        putSentenceSetFeedback(
          '2',
          'good',
          '1',
          Language.BULGARIAN,
          mockDynamoClient
        )
      )
      .then(_ => {
        putSentenceSetFeedback(
          '2',
          'good',
          'tester',
          Language.GUJARATI,
          mockDynamoClient
        );
      });
  });

  test('should only retrieve feedback with the requested target language', () => {
    return getSentenceSetFeedback(Language.BULGARIAN, mockDynamoClient).then(
      scores => {
        expect(scores.length).toEqual(2);
        expect(scores.filter(score => score.setId === '1').length).toEqual(1);
      }
    );
  });

  test('should not retrieve feedback where the evaluatorId is tester', () => {
    return getSentenceSetFeedback(Language.GUJARATI, mockDynamoClient).then(
      scores => {
        expect(
          scores.filter(score => score.evaluatorId === 'tester').length
        ).toEqual(0);
      }
    );
  });

  test('should return an empty list if there is no feedback for a specified language', () => {
    return getSentenceSetFeedback(Language.SWAHILI, mockDynamoClient).then(
      scores => {
        expect(scores.length).toEqual(0);
      }
    );
  });

  test('should handle items with missing parameters', async () => {
    await mockDynamoClient
      .put({
        Item: { feedbackId: '123', targetLanguage: 'BG' },
        TableName: 'SentenceSetFeedbackDynamoDBTable-dev',
      })
      .promise();
    return getSentenceSetFeedback(Language.BULGARIAN, mockDynamoClient).then(
      scores => {
        expect(
          scores.filter(
            score =>
              score.feedbackId === '123' &&
              score.targetLanguage === 'BG' &&
              score.feedback === 'undefined' &&
              score.evaluatorId === 'undefined' &&
              score.setId === 'undefined'
          ).length
        ).toEqual(1);
      }
    );
  });
});

describe('getSentencePairScores', () => {
  beforeAll(() => {
    const sentencePairScoreBG1 = new SentencePairScore(
      '1',
      '2',
      5,
      5,
      'BG',
      'human',
      'machine',
      'original',
      'A',
      '10'
    );
    const sentencePairScoreBG2 = new SentencePairScore(
      '1',
      '2',
      5,
      5,
      'BG',
      'human',
      'machine',
      'original',
      'A',
      '11'
    );
    const sentencePairScoreGU1 = new SentencePairScore(
      '1',
      '2',
      5,
      5,
      'GU',
      'human',
      'machine',
      'original',
      'A',
      '12'
    );

    const sentencePairScoreTester = new SentencePairScore(
      '1',
      'tester',
      5,
      5,
      'GU',
      'human',
      'machine',
      'original',
      'A',
      '12'
    );

    return putSentencePairScore(sentencePairScoreBG1, mockDynamoClient)
      .then(_ => putSentencePairScore(sentencePairScoreBG2, mockDynamoClient))
      .then(_ => putSentencePairScore(sentencePairScoreGU1, mockDynamoClient))
      .then(_ =>
        putSentencePairScore(sentencePairScoreTester, mockDynamoClient)
      );
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
              score.sentencePairType === 'A' &&
              score.scoreId === '10'
          ).length
        ).toEqual(1);
      }
    );
  });

  test('should not retrieve scores where the evaluatorId is tester', () => {
    return getSentencePairScores(Language.GUJARATI, mockDynamoClient).then(
      scores => {
        expect(
          scores.filter(score => score.evaluatorId === 'tester').length
        ).toEqual(0);
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
              score.original === 'undefined' &&
              score.sentencePairType === 'A'
          ).length
        ).toEqual(1);
      }
    );
  });
});
