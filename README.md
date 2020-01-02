# Sentence Pairs Evaluation Tool

GoURMET project evaluation tool. The purpose is to evaluate a set of sentences comparing the quality of a machine translated sentence to a human translated sentence where the human translation is assumed to be the gold standard. For each case there must be a set of three sentences.
1. A sentence in the source language
2. The same sentence translated into the target language by a human
3. The same sentence translated into the target language by a machine

# Set up
1. Install [node v10](https://nodejs.org/en/)
2. Run `yarn install`

# Running the App

The app requires local aws credentials for the GoURMET AWS account.

Run `yarn dev`

The App talks directly to DynamoDB tables in AWS

# Developing the App.

## A note on PRs

Currently this is a single dev project so changes are being made and features are added without going through the standard PR review process. PRs are still being opened as they offer a form of documentation but are being merged without review.

## Infrastructure

The cloudformation templates are generated using [cosmos-troposphere](https://github.com/bbc/cosmos-troposphere). This will need to be installed locally in order to update the cloudformation template. How to install this is covered in the [cosmos-troposphere README](https://github.com/bbc/cosmos-troposphere/blob/master/README.rst). Alternatively run `make venv` from within the `infrastructure` directory to set up an virtual environment and install cosmos-troposphere.

To make changes to the stack. Update the [./infrastructure/src/main.py](./infrastructure/src/main.py) and run `make templates/main.json` from inside the `infrastructure` directory.

### Database

The app uses DynamoDB to store data. This is cloudformed. To make changes to the database update the [./infrastructure/src/dynamoDB.py](./infrastructure/src/dynamoDB.py) and run `make templates/dynamoDB.json` from inside the `infrastructure` directory.

#### Database Tables

The names of the database tables are in the [`.env`](./.env) file. There are 4 tables

1. SENTENCE_SETS_TABLE_NAME - Contains the sets of sentences to be evaluated

| setId  | name   | sentenceIds | sourceLanguage | targetLanguage | evaluatorIds |
|--------|--------|-------------|----------------|----------------|--------------|
| string | string | string set  | string         | string         | string set   |

2. SENTENCES_TABLE_NAME - Contains the sentences. Each sentence has an original sentence in the source language as well as a translation into the target language done by a human and another done by a machine.

| sentenceId | original | humanTranslation | machineTranslation | sourceLanguage | targetLanguage |
|------------|----------|------------------|--------------------|----------------|----------------|
| string     | string   | string           | string             | string         | string         |

3. SENTENCE_SCORES_TABLE_NAME - Contains scores given, which sentence pair the score was for and who gave it.

| scoreId | evaluatorId | q1Score  | sentencePairId |
|---------|-------------|----------|----------------|
| string  | string      | string   | string         |

4. SENTENCE_SET_FEEDBACK_TABLE_NAME - Contains free text feedback given at the end of evaluating a set of sentences

| feedbackId | feedback | evaluatorId | setId  |
|------------|----------|-------------|--------|
| string     | string   | string      | string |

### DNS

To make changes to the DNS template. Update the [./infrastructure/src/dns.py](./infrastructure/src/dns.py) and run `make templates/dns.json` from inside the `infrastructure` directory.

# Using the App

The script [`randomiseAndFormatData.py`](./scripts/randomiseAndFormatData.py) can be used to turn text files into a JSON file to submit to the `/dataset` endpoint. It also randomises the order of the sentences. The script needs to be amended to specify the files that should be read in.