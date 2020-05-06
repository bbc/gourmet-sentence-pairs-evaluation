# Sentence Pairs Evaluation Tool - Direct Assessment

This project has received funding from the European Union’s Horizon 2020 research and innovation
programme under grant agreement No 825299. <img src="./docs/images/EU_flag.jpg" width="25px">

This tool was build as part of the [GoURMET Project](https://gourmet-project.eu/) to complete Direct Assessment evaluation on machine translation models.

## What is Direct Assessment

Direct Assessment is a standard evaluation approach used in academic research to assess the quality of translation. This approach differs from automatic evaluation such as [BLEU](https://en.wikipedia.org/wiki/BLEU) as the evaluation is carried out by a human rather than an algorithm. The goal of Direct Assessment is to evaluate a translation model by asking a human to compare the quality of a machine translated sentence to a human translated sentence where the human translation is assumed to be the gold standard. For each case there must be a set of three sentences.

1. A sentence in the source language
2. The same sentence translated into the target language by a human
3. The same sentence translated into the target language by a machine

The evaluator will be shown the human translated sentence and the machine translated sentence and asked to rate on a scale from 0 to 100

1. If the machine translated sentence adequately expresses the meaning of the human translated sentence.
2. The machine translated sentence is a well-written phrase or sentence that is grammatically and idiomatically correct

A more in-depth explanation of Direct Assessment can be found in the papers [Continuous Measurement Scales in Human Evaluation of Machine Translation](https://www.aclweb.org/anthology/W13-2305/) and [Is all that Glitters in Machine Translation Quality Estimation really Gold?](https://www.aclweb.org/anthology/C16-1294/).

## Running and using the Direct Assessment Sentence Pair Tool

This tool is open sourced under GPL v3. Please view the [usage docs](./docs/usage.md) for how to set up and run this software. Issues should be raised via the GitHub issues. Code changes can be proposed by opening a pull request.

## Creating Data Sets for the App

The script [`randomiseAndFormatData.py`](./scripts/randomiseAndFormatData.py) can be used to turn text files into a JSON file to submit to the `/dataset` endpoint. It also randomises the order of the sentences. The script needs to be amended to specify the files that should be read in.

## Developing the Direct Assessment Sentence Pair Tool

Details on maintaining and developing the tool are in the [development docs](./docs/development.md)
