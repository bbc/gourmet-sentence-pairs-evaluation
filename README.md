# Sentence Pairs Evaluation Tool - Direct Assessment

This tool was build as part of the [GoURMET Project](https://gourmet-project.eu/) to complete Direct Assessment evaluation on machine translation models. The goal is to evaluate the models by comparing the quality of a machine translated sentences to a human translated sentences where the human translation is assumed to be the gold standard. For each case there must be a set of three sentences.

1. A sentence in the source language
2. The same sentence translated into the target language by a human
3. The same sentence translated into the target language by a machine

## Running and using the Direct Assessment Sentence Pair Tool

This tool is open sourced under GPL v3. Please view the [usage docs](./docs/usage.md) for how to set up and run this software. Issues should be raised via the GitHub issues. Code changes can be proposed by opening a pull request.

## Creating Data Sets for the App

The script [`randomiseAndFormatData.py`](./scripts/randomiseAndFormatData.py) can be used to turn text files into a JSON file to submit to the `/dataset` endpoint. It also randomises the order of the sentences. The script needs to be amended to specify the files that should be read in.

## Developing the Direct Assessment Sentence Pair Tool

Details on maintaining and developing the tool are in the [development docs](./docs/development.md)
