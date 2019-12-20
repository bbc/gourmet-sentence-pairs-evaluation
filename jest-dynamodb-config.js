module.exports = {
  tables: [
    {
      TableName: 'SentenceScoreDynamoDBTable-dev',
      KeySchema: [{ AttributeName: 'scoreId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'scoreId', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
  ],
  port: 8000,
};
