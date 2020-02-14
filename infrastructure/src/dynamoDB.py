from troposphere import Output, Parameter, Ref, Template, Tags, Join
from troposphere.dynamodb import (KeySchema, AttributeDefinition,
                                  ProvisionedThroughput, PointInTimeRecoverySpecification, Table, GlobalSecondaryIndex, Projection)
from troposphere.iam import PolicyType

t = Template()

t.set_description(
    "DynamoDB tables for storing data for analysing sentence data")

stage = t.add_parameter(Parameter(
    "Stage",
    Description="Development stage",
    Type="String",
    Default="test",
))

sentenceTableHashkeyName = t.add_parameter(Parameter(
    "SentenceTableHashKeyElementName",
    Description="Sentence Table HashType PrimaryKey Name",
    Type="String",
    Default="sentenceId",
    AllowedPattern="[a-zA-Z0-9]*",
    MinLength="1",
    MaxLength="2048",
    ConstraintDescription="must contain only alphanumberic characters"
))

sentenceTableHashkeyType = t.add_parameter(Parameter(
    "SentenceTableHashKeyElementType",
    Description="Sentence HashType PrimaryKey Type",
    Type="String",
    Default="S",
    AllowedPattern="[S|N]",
    MinLength="1",
    MaxLength="1",
    ConstraintDescription="must be either S or N"
))

sentenceSetTableHashkeyName = t.add_parameter(Parameter(
    "SentenceSetTableHashKeyElementName",
    Description="Sentence Set Table HashType PrimaryKey Name",
    Type="String",
    Default="setId",
    AllowedPattern="[a-zA-Z0-9]*",
    MinLength="1",
    MaxLength="2048",
    ConstraintDescription="must contain only alphanumberic characters"
))

sentenceSetTableHashkeyType = t.add_parameter(Parameter(
    "SentenceSetTableHashKeyElementType",
    Description="Sentence Set HashType PrimaryKey Type",
    Type="String",
    Default="S",
    AllowedPattern="[S|N]",
    MinLength="1",
    MaxLength="1",
    ConstraintDescription="must be either S or N"
))

sentenceScoreTableHashkeyName = t.add_parameter(Parameter(
    "SentenceScoreTableHashKeyElementName",
    Description="Sentence Score Table HashType PrimaryKey Name",
    Type="String",
    Default="scoreId",
    AllowedPattern="[a-zA-Z0-9]*",
    MinLength="1",
    MaxLength="2048",
    ConstraintDescription="must contain only alphanumberic characters"
))

sentenceScoreTableHashkeyType = t.add_parameter(Parameter(
    "SentenceScoreTableHashKeyElementType",
    Description="Sentence Score HashType PrimaryKey Type",
    Type="String",
    Default="S",
    AllowedPattern="[S|N]",
    MinLength="1",
    MaxLength="1",
    ConstraintDescription="must be either S or N"
))

sentenceSetFeedbackTableHashkeyName = t.add_parameter(Parameter(
    "SentenceSetFeedbackTableHashKeyElementName",
    Description="Sentence Set Feedback Table HashType PrimaryKey Name",
    Type="String",
    Default="feedbackId",
    AllowedPattern="[a-zA-Z0-9]*",
    MinLength="1",
    MaxLength="2048",
    ConstraintDescription="must contain only alphanumberic characters"
))

sentenceSetFeedbackTableHashkeyType = t.add_parameter(Parameter(
    "SentenceSetFeedbackTableHashKeyElementType",
    Description="Sentence Set Feedback HashType PrimaryKey Type",
    Type="String",
    Default="S",
    AllowedPattern="[S|N]",
    MinLength="1",
    MaxLength="1",
    ConstraintDescription="must be either S or N"
))

readunits = t.add_parameter(Parameter(
    "ReadCapacityUnits",
    Description="Provisioned read throughput",
    Type="Number",
    Default="5",
    MinValue="5",
    MaxValue="10000",
    ConstraintDescription="should be between 5 and 10000"
))

writeunits = t.add_parameter(Parameter(
    "WriteCapacityUnits",
    Description="Provisioned write throughput",
    Type="Number",
    Default="5",
    MinValue="5",
    MaxValue="10000",
    ConstraintDescription="should be between 5 and 10000"
))

sentenceDynamoDBTable = t.add_resource(Table(
    "sentencePairsDynamoDBTable",
    AttributeDefinitions=[
        AttributeDefinition(
            AttributeName=Ref(sentenceTableHashkeyName),
            AttributeType=Ref(sentenceTableHashkeyType)
        ),
    ],
    KeySchema=[
        KeySchema(
            AttributeName=Ref(sentenceTableHashkeyName),
            KeyType="HASH"
        )
    ],
    ProvisionedThroughput=ProvisionedThroughput(
        ReadCapacityUnits=Ref(readunits),
        WriteCapacityUnits=Ref(writeunits)
    ),
    PointInTimeRecoverySpecification=PointInTimeRecoverySpecification(PointInTimeRecoveryEnabled=True),
    Tags=Tags(app="sentence-pairs-evaluation", stage=Ref(stage)),
    TableName=Join("-", ["SentencesDynamoDBTable", Ref(stage)])
))

sentenceSetDynamoDBTable = t.add_resource(Table(
    "sentenceSetsDynamoDBTable",
    AttributeDefinitions=[
        AttributeDefinition(
            AttributeName=Ref(sentenceSetTableHashkeyName),
            AttributeType=Ref(sentenceSetTableHashkeyType)
        ),
    ],
    KeySchema=[
        KeySchema(
            AttributeName=Ref(sentenceSetTableHashkeyName),
            KeyType="HASH"
        )
    ],
    ProvisionedThroughput=ProvisionedThroughput(
        ReadCapacityUnits=Ref(readunits),
        WriteCapacityUnits=Ref(writeunits)
    ),
    PointInTimeRecoverySpecification=PointInTimeRecoverySpecification(PointInTimeRecoveryEnabled=True),
    Tags=Tags(app="sentence-pairs-evaluation", stage=Ref(stage)),
    TableName=Join("-", ["SentenceSetsDynamoDBTable", Ref(stage)])
))

sentenceScoreDynamoDBTable = t.add_resource(Table(
    "sentenceScoreDynamoDBTable",
    AttributeDefinitions=[
        AttributeDefinition(
            AttributeName=Ref(sentenceScoreTableHashkeyName),
            AttributeType=Ref(sentenceScoreTableHashkeyType)
        ),
        AttributeDefinition(
            AttributeName="targetLanguage",
            AttributeType="S"
        )
    ],
    KeySchema=[
        KeySchema(
            AttributeName=Ref(sentenceScoreTableHashkeyName),
            KeyType="HASH"
        )
    ],
    ProvisionedThroughput=ProvisionedThroughput(
        ReadCapacityUnits=Ref(readunits),
        WriteCapacityUnits=Ref(writeunits)
    ),
    PointInTimeRecoverySpecification=PointInTimeRecoverySpecification(PointInTimeRecoveryEnabled=True),
    GlobalSecondaryIndexes=[
        GlobalSecondaryIndex(
            IndexName="targetLanguage",
            KeySchema=[
                KeySchema(
                    AttributeName="targetLanguage",
                    KeyType="HASH"
                )
            ],
            ProvisionedThroughput=ProvisionedThroughput(
                ReadCapacityUnits=Ref(readunits),
                WriteCapacityUnits=Ref(writeunits)
            ),
            Projection=Projection(ProjectionType="ALL")
        )
    ],
    Tags=Tags(app="sentence-pairs-evaluation", stage=Ref(stage)),
    TableName=Join("-", ["SentenceScoreDynamoDBTable", Ref(stage)])
))

sentenceSetFeedbackDynamoDBTable = t.add_resource(Table(
    "sentenceSetFeedbackDynamoDBTable",
    AttributeDefinitions=[
        AttributeDefinition(
            AttributeName=Ref(sentenceSetFeedbackTableHashkeyName),
            AttributeType=Ref(sentenceSetFeedbackTableHashkeyType)
        ),
    ],
    KeySchema=[
        KeySchema(
            AttributeName=Ref(sentenceSetFeedbackTableHashkeyName),
            KeyType="HASH"
        )
    ],
    ProvisionedThroughput=ProvisionedThroughput(
        ReadCapacityUnits=Ref(readunits),
        WriteCapacityUnits=Ref(writeunits)
    ),
    PointInTimeRecoverySpecification=PointInTimeRecoverySpecification(PointInTimeRecoveryEnabled=True),
    Tags=Tags(app="sentence-pairs-evaluation", stage=Ref(stage)),
    TableName=Join("-", ["SentenceSetFeedbackDynamoDBTable", Ref(stage)])
))

t.add_output(Output(
    "SentenceTableName",
    Value=Ref(sentenceDynamoDBTable),
    Description="Table name of the newly create DynamoDB table",
))

t.add_output(Output(
    "SentenceSetTableName",
    Value=Ref(sentenceSetDynamoDBTable),
    Description="Table name of the newly create DynamoDB table",
))

t.add_output(Output(
    "SentenceScoreTableName",
    Value=Ref(sentenceScoreDynamoDBTable),
    Description="Table name of the newly create DynamoDB table",
))

t.add_output(Output(
    "SentenceSetFeedbackTableName",
    Value=Ref(sentenceSetFeedbackDynamoDBTable),
    Description="Table name of the newly create DynamoDB table",
))

print(t.to_json())
