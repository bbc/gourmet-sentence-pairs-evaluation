import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { SentencePair, SentenceSet } from '../models/models';
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
        const sentenceSet: SentenceSet = (output
          .Items[0] as unknown) as SentenceSet;
        return sentenceSet;
      }
    });
};

const putSentenceSet = (
  sentencePairs: SentencePair[],
  setName: string,
  setId?: string
): Promise<string> => {
  return Promise.all(
    sentencePairs.map(pair => {
      return putSentencePair(pair.sentenceId, pair);
    })
  ).then(sentencePairsIds => {
    const sentenceSet: SentenceSet = new SentenceSet(
      setName,
      sentencePairsIds,
      setId
    );
    return _putSentenceSet(sentenceSet.setId, sentenceSet);
  });
};

// tslint:disable-next-line:variable-name
const _putSentenceSet = (
  setId: string,
  setData: SentenceSet
): Promise<string> => {
  const item =
    setData.sentenceIds === undefined
      ? { setId }
      : { setId, sentenceIds: client.createSet(setData.sentenceIds) };
  const input = {
    Item: item,
    TableName: getSentenceSetsTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return setId;
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

const putSentencePairScore = (sentencePairId: string, score: number) => {
  const scoreId = uuidv1();
  const input = {
    Item: {
      scoreId,
      sentencePairId,
      score,
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

export {
  getSentenceSet,
  putSentenceSet,
  getSentencePair,
  putSentencePair,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSets,
};
