import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
  SentencePair,
  SentenceSet,
  SentencePairScore,
  Language,
} from '../models/models';
import * as uuidv1 from 'uuid/v1';

const dynamoClient = new DocumentClient({ region: 'eu-west-1' });

const getSentenceSetsTableName = (): string => {
  return process.env.SENTENCE_SETS_TABLE_NAME || 'none';
};

const getSentencesTableName = (): string => {
  return process.env.SENTENCES_TABLE_NAME || 'none';
};

const getSentencePairScoresTableName = (): string => {
  return process.env.SENTENCE_SCORES_TABLE_NAME || 'none';
};

const getSentenceSetFeedbackTableName = (): string => {
  return process.env.SENTENCE_SET_FEEDBACK_TABLE_NAME || 'none';
};

const getSentenceSets = (): Promise<SentenceSet[]> => {
  const query = {
    TableName: getSentenceSetsTableName(),
  };

  return dynamoClient
    .scan(query)
    .promise()
    .then(output => {
      const items = output.Items || [];
      return items.map(sentenceSet => {
        return convertAttributeMapToSentenceSet(sentenceSet);
      });
    });
};

const getSentenceSet = (setId: string): Promise<SentenceSet> => {
  const query = {
    TableName: getSentenceSetsTableName(),
    KeyConditionExpression: `setId = :id`,
    ExpressionAttributeValues: {
      ':id': setId,
    },
  };

  return dynamoClient
    .query(query)
    .promise()
    .then(output => {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        throw new Error(`Item with id: ${setId} does not exist.`);
      } else {
        const item = output.Items[0];
        return convertAttributeMapToSentenceSet(item);
      }
    });
};

/**
 * Puts all the sentence pairs into DynamoDB and also creates a sentence set in dynamoDB that contains the sentence pairs Ids
 */
const putSentenceSetAndPairs = (
  sentencePairs: SentencePair[],
  setName: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  setId?: string
): Promise<string> => {
  return Promise.all(
    sentencePairs.map(pair => {
      return putSentencePair(pair.sentenceId, pair);
    })
  ).then(sentencePairsIds => {
    const sentenceSet: SentenceSet = new SentenceSet(
      setName,
      sourceLanguage,
      targetLanguage,
      new Set(sentencePairsIds),
      setId
    );
    return putSentenceSet(sentenceSet);
  });
};

// tslint:disable-next-line:variable-name
const putSentenceSet = (sentenceSet: SentenceSet): Promise<string> => {
  const item = constructSentenceSetItem(sentenceSet);
  const query = {
    Item: item,
    TableName: getSentenceSetsTableName(),
  };

  return dynamoClient
    .put(query)
    .promise()
    .then(() => {
      return sentenceSet.setId;
    });
};

const getSentencePair = (id: string): Promise<SentencePair> => {
  const query = {
    TableName: getSentencesTableName(),
    KeyConditionExpression: `sentenceId = :id`,
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  return dynamoClient
    .query(query)
    .promise()
    .then(output => {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        throw new Error(`Item with id: ${id} does not exist.`);
      } else {
        const sentencePair: SentencePair = (output
          .Items[0] as unknown) as SentencePair;
        return sentencePair;
      }
    });
};

/**
 * Returns the Id of the sentence pair
 */
const putSentencePair = (
  id: string,
  sentenceData: SentencePair
): Promise<string> => {
  const query = {
    Item: {
      sentenceId: id,
      original: sentenceData.original,
      humanTranslation: sentenceData.humanTranslation,
      machineTranslation: sentenceData.machineTranslation,
      sourceLanguage: sentenceData.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceData.targetLanguage.toUpperCase(),
    },
    TableName: getSentencesTableName(),
  };

  return dynamoClient
    .put(query)
    .promise()
    .then(() => {
      return id;
    });
};

const getSentencePairScores = (
  targetLanguage: Language,
  client: DocumentClient = dynamoClient
): Promise<SentencePairScore[]> => {
  return client
    .scan({
      FilterExpression: `targetLanguage = :a`,
      ExpressionAttributeValues: {
        ':a': targetLanguage.toUpperCase(),
      },
      TableName: getSentencePairScoresTableName(),
    })
    .promise()
    .then(output => {
      const items = output.Items || [];
      return items.map(item => convertAttributeMapToSentencePairScore(item));
    });
};

const putSentencePairScore = (
  sentencePairScore: SentencePairScore,
  client: DocumentClient = dynamoClient
): Promise<string> => {
  const scoreId: string = sentencePairScore.scoreId || uuidv1();
  const query = {
    Item: {
      scoreId,
      sentencePairId: sentencePairScore.sentencePairId,
      q1Score: sentencePairScore.q1Score,
      evaluatorId: sentencePairScore.evaluatorId,
      humanTranslation: sentencePairScore.humanTranslation,
      machineTranslation: sentencePairScore.machineTranslation,
      original: sentencePairScore.original,
      targetLanguage: sentencePairScore.targetLanguage,
    },
    TableName: getSentencePairScoresTableName(),
  };

  return client
    .put(query)
    .promise()
    .then(() => {
      return scoreId;
    });
};

const putSentenceSetFeedback = (
  setId: string,
  feedback: string,
  evaluatorId: string
) => {
  const feedbackId = uuidv1();
  const query = {
    Item: {
      feedbackId,
      setId,
      feedback,
      evaluatorId,
    },
    TableName: getSentenceSetFeedbackTableName(),
  };

  return dynamoClient
    .put(query)
    .promise()
    .then(() => {
      return feedbackId;
    });
};

// Helper Functions

/**
 * DynamoDB returns an attribute map when queried. This converts a generic attribute map to a SentenceSet object
 */
const convertAttributeMapToSentencePairScore = (
  item: DocumentClient.AttributeMap
): SentencePairScore => {
  return new SentencePairScore(
    item['sentencePairId'] || 'undefined',
    item['evaluatorId'] || 'undefined',
    Number(item['q1Score'] || 0),
    item['targetLanguage'] || 'undefined',
    item['humanTranslation'] || 'undefined',
    item['machineTranslation'] || 'undefined',
    item['original'] || 'undefined',
    item['scoreId'] || 'undefined'
  );
};

/**
 * DynamoDB returns an attribute map when queried. This converts a generic attribute map to a SentenceSet object
 */
const convertAttributeMapToSentenceSet = (
  item: DocumentClient.AttributeMap
): SentenceSet => {
  const sentenceIdsSet: DocumentClient.StringSet = item['sentenceIds'];
  const sentenceIds = sentenceIdsSet === undefined ? [] : sentenceIdsSet.values;
  const evaluatorIdsSet: DocumentClient.StringSet = item['evaluatorIds'];
  const evaluatorIds =
    evaluatorIdsSet === undefined ? [] : evaluatorIdsSet.values;

  return new SentenceSet(
    item['name'],
    item['sourceLanguage'],
    item['targetLanguage'],
    new Set(sentenceIds),
    item['setId'],
    new Set(evaluatorIds)
  );
};

/** A set of sentenceIds and a set of evaluatorIds can be undefined or empty.
 * Some fairly horrible logic to ensure that an empty or undefined set is not put into dynamo
 */
const constructSentenceSetItem = (sentenceSet: SentenceSet) => {
  const sentenceIds: Set<string> = sentenceSet.sentenceIds || new Set();
  const evaluatorIds: Set<string> = sentenceSet.evaluatorIds || new Set();
  if (sentenceIds.size < 1 && evaluatorIds.size < 1) {
    return {
      setId: sentenceSet.setId,
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
    };
  }
  if (sentenceIds.size < 1) {
    return {
      setId: sentenceSet.setId,
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
      evaluatorIds: dynamoClient.createSet(Array.from(evaluatorIds)),
    };
  }
  if (evaluatorIds.size < 1) {
    return {
      setId: sentenceSet.setId,
      sentenceIds: dynamoClient.createSet(Array.from(sentenceIds)),
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
    };
  } else {
    return {
      setId: sentenceSet.setId,
      sentenceIds: dynamoClient.createSet(Array.from(sentenceIds)),
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
      evaluatorIds: dynamoClient.createSet(Array.from(evaluatorIds)),
    };
  }
};

export {
  getSentenceSet,
  putSentenceSetAndPairs,
  getSentencePair,
  putSentencePair,
  getSentencePairScores,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSets,
  putSentenceSet,
};
