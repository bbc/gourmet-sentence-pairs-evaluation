import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { SentencePair, SentenceSet, Language } from '../models/models';
import * as uuidv1 from 'uuid/v1';

const client = new DocumentClient({ region: 'eu-west-1' });

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
  const input = {
    TableName: getSentenceSetsTableName(),
  };
  return client
    .scan(input)
    .promise()
    .then(output => {
      const items = output.Items || [];
      return items.map(sentenceSet => {
        return (sentenceSet as unknown) as SentenceSet;
      });
    });
};

const getSentenceSet = (setId: string): Promise<SentenceSet> => {
  const input = {
    TableName: getSentenceSetsTableName(),
    KeyConditionExpression: `setId = :id`,
    ExpressionAttributeValues: {
      ':id': setId,
    },
  };

  return client
    .query(input)
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
 * Puts all the sentence pairs into DynamoDB and also creates a sentence set in dynamoDB that contains the sentence pairs
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
      sentencePairsIds,
      setId
    );
    return putSentenceSet(sentenceSet);
  });
};

// tslint:disable-next-line:variable-name
const putSentenceSet = (sentenceSet: SentenceSet): Promise<string> => {
  const item = constructSentenceSetItem(sentenceSet);
  const input = {
    Item: item,
    TableName: getSentenceSetsTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return sentenceSet.setId;
    });
};

const getSentencePair = (id: string): Promise<SentencePair> => {
  const input = {
    TableName: getSentencesTableName(),
    KeyConditionExpression: `sentenceId = :id`,
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  return client
    .query(input)
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
  const input = {
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

  return client
    .put(input)
    .promise()
    .then(result => {
      return id;
    });
};

const putSentencePairScore = (
  sentencePairId: string,
  score: number,
  evaluatorId: string
): Promise<string> => {
  const scoreId = uuidv1();
  const input = {
    Item: {
      scoreId,
      sentencePairId,
      score,
      evaluatorId,
    },
    TableName: getSentencePairScoresTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return 'ok';
    });
};

const putSentenceSetFeedback = (setId: string, feedback: string) => {
  const feedbackId = uuidv1();
  const input = {
    Item: {
      feedbackId,
      setId,
      feedback,
    },
    TableName: getSentenceSetFeedbackTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return 'ok';
    });
};

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
    sentenceIds,
    item['setId'],
    evaluatorIds
  );
};

/** A set of sentenceIds and a set of evaluatorIds can be undefined or empty.
 * Some fairly horrible logic to ensure that an empty or undefined set is not put into dynamo
 */
const constructSentenceSetItem = (sentenceSet: SentenceSet) => {
  const sentenceIds: string[] = sentenceSet.sentenceIds || [];
  const evaluatorIds: string[] = sentenceSet.evaluatorIds || [];
  if (sentenceIds.length < 1 && evaluatorIds.length < 1) {
    return {
      setId: sentenceSet.setId,
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
    };
  }
  if (sentenceIds.length < 1) {
    return {
      setId: sentenceSet.setId,
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
      evaluatorIds: client.createSet(Array.from(evaluatorIds)),
    };
  }
  if (evaluatorIds.length < 1) {
    return {
      setId: sentenceSet.setId,
      sentenceIds: client.createSet(Array.from(sentenceIds)),
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
    };
  } else {
    return {
      setId: sentenceSet.setId,
      sentenceIds: client.createSet(Array.from(sentenceIds)),
      name: sentenceSet.name,
      sourceLanguage: sentenceSet.sourceLanguage.toUpperCase(),
      targetLanguage: sentenceSet.targetLanguage.toUpperCase(),
      evaluatorIds: client.createSet(Array.from(evaluatorIds)),
    };
  }
};

export {
  getSentenceSet,
  putSentenceSetAndPairs,
  getSentencePair,
  putSentencePair,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSets,
  putSentenceSet,
};
