# Sentence Pairs Evaluation Tool

GoURMET project tool. Allows users to evaluate the quality of a machine translated sentence in comparison to a human translated sentence.

# Set up
1. Install [node v10](https://nodejs.org/en/)
2. Run `yarn install`

# Running the App

The app requires local aws credentials for the GoURMET AWS account.

Run `yarn dev`

# Developing the App.

## Infrastructure

The cloudformation templates are generated using [cosmos-troposphere](https://github.com/bbc/cosmos-troposphere). This will need to be installed locally in order to update the cloudformation template. How to install this is covered in the [cosmos-troposphere README](https://github.com/bbc/cosmos-troposphere/blob/master/README.rst). Alternatively run `make venv` from within the `infrastructure` directory to set up an virtual environment and install cosmos-troposphere.

To make changes to the stack. Update the [./infrastructure/src/main.py](./infrastructure/src/main.py) and run `make templates/main.json` from inside the `infrastructure` directory.

### Database

The app uses DynamoDB to store data. This is cloudformed. To make changes to the database update the [./infrastructure/src/dynamoDB.py](./infrastructure/src/dynamoDB.py) and run `make templates/dynamoDB.json` from inside the `infrastructure` directory.
