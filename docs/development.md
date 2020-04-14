# Developing the Sentence Pair Direct Assessment Tool

Documentation for working on the tool as a developer

# Set up
1. Install [node v10](https://nodejs.org/en/)
2. Run `yarn install`
3. Set up pre-commit hook `./githooks/setupHooks.sh`

## Pre-commit Hook

[What are git hooks](https://githooks.com/)

This project has a pre commit hook which if set up (run the setup hooks script `./githooks/setupHooks.sh`) will run the linter, TypeScript compiler and tests that will be effected by the changes made. If you need to ignore the hook at any point use the `--no-verify` flag e.g. `git commit --no-verify`

# Running the App

The app requires local aws credentials for the GoURMET AWS account.

Run `yarn dev`

The App talks directly to DynamoDB tables in AWS

# Developing the App.

## Infrastructure

The cloudformation templates are generated using [cosmos-troposphere](https://github.com/bbc/cosmos-troposphere). This will need to be installed locally in order to update the cloudformation template. How to install this is covered in the [cosmos-troposphere README](https://github.com/bbc/cosmos-troposphere/blob/master/README.rst). Alternatively run `make venv` from within the `infrastructure` directory to set up an virtual environment and install cosmos-troposphere.

To make changes to the stack. Update the [./infrastructure/src/main.py](../infrastructure/src/main.py) and run `make templates/main.json` from inside the `infrastructure` directory.

### Database

The app uses DynamoDB to store data. This is cloudformed. To make changes to the database update the [../infrastructure/src/dynamoDB.py](../infrastructure/src/dynamoDB.py) and run `make templates/dynamoDB.json` from inside the `infrastructure` directory.

#### Database Tables

The names of the database tables are in the [`.env`](../.env) file. There are 4 tables

1. SENTENCE_SETS_TABLE_NAME - Contains the sets of sentences to be evaluated

| setId  | name   | sentenceIds | sourceLanguage | targetLanguage | evaluatorIds |possibleEvaluatorIds|
|--------|--------|-------------|----------------|----------------|--------------|--------------------|
| string | string | string set  | string         | string         | string set   |string set          |

2. SENTENCES_TABLE_NAME - Contains the sentences. Each sentence has an original sentence in the source language as well as a translation into the target language done by a human and another done by a machine.

| sentenceId | original | humanTranslation | machineTranslation | sourceLanguage | targetLanguage | sentencePairType |
|------------|----------|------------------|--------------------|----------------|----------------|------------------|
| string     | string   | string           | string             | string         | string         |string            |

3. SENTENCE_SCORES_TABLE_NAME - Contains scores given, which sentence pair the score was for and who gave it.

| scoreId | evaluatorId | humanTranslation | machineTranslation | original | q1Score | q2Score | sentencePairId | sentencePairType | targetLanguage | timestamp |
|---------|-------------|------------------|--------------------|----------|---------|---------|----------------|------------------|----------------|-----------|
| string  | string      | string           | string             | string   | string  | string  | string         | string           | string         | number    |

4. SENTENCE_SET_FEEDBACK_TABLE_NAME - Contains free text feedback given at the end of evaluating a set of sentences

| feedbackId | feedback | evaluatorId | setId  |
|------------|----------|-------------|--------|
| string     | string   | string      | string |

### DNS

To make changes to the DNS template. Update the [./infrastructure/src/dns.py](../infrastructure/src/dns.py) and run `make templates/dns.json` from inside the `infrastructure` directory.

# Testing the App

## DynamoDB Tests

The DynamoDB API is tested using [jest-dynamodb](https://github.com/shelfio/jest-dynamodb). This is specified as a preset in [`package.json`](../package.json). This allows an instance of DynamoDB to be run locally. The schema for this database is defined in [`jest-dynamodb-config.js`](../jest-dynamodb-config.js) 

# Creating a Docker image

The [Dockerfile](../Dockerfile) provides the template for creating a Docker image for the app. From the root directory of the project run

```
docker build -t newslabsgourmet/direct-assessment-sentence-pair-tool:CURRENT_VERSION_NUMBER .
```

to create a Docker image. The Docker image is hosted on [Dockerhub](https://hub.docker.com/r/newslabsgourmet/direct-assessment-sentence-pair-tool)
