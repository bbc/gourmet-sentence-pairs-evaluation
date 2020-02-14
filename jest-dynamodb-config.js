module.exports = {
  tables: [
    {
      TableName: 'SentenceScoreDynamoDBTable-dev',
      KeySchema: [{ AttributeName: 'scoreId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'scoreId', AttributeType: 'S' },
        { AttributeName: 'targetLanguage', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'targetLanguage',
          KeySchema: [
            {
              AttributeName: 'targetLanguage',
              KeyType: 'HASH',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
    {
      TableName: 'SentenceSetFeedbackDynamoDBTable-dev',
      KeySchema: [{ AttributeName: 'feedbackId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'feedbackId', AttributeType: 'S' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
  ],
  port: 8000,
};
