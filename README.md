# Sentence Pairs Evaluation Tool - Direct Assessment

This project has received funding from the European Union’s Horizon 2020 research and innovation
programme under grant agreement No 825299. <img src="./docs/images/EU_flag.jpg" width="25px">

This tool was build as part of the [GoURMET Project](https://gourmet-project.eu/) to complete Direct Assessment evaluation on machine translation models and is open sourced under GPL v3. Issues should be raised via the GitHub issues. Code changes can be proposed by opening a pull request.

## Contents

1. [What is Direct Assessment?](#what-is-direct-assessment)
2. [Admin Guide](./docs/admin.md)
3. [Developer Guide](./docs/development.md)
4. [User Guide](./docs/users.md)

## What is Direct Assessment

Direct Assessment is a standard evaluation approach used in academic research to assess the quality of translation. This approach differs from automatic evaluation such as [BLEU](https://en.wikipedia.org/wiki/BLEU) as the evaluation is carried out by a human rather than an algorithm. The goal of Direct Assessment is to evaluate a translation model by asking a human to compare the quality of a machine translated sentence to a human translated sentence where the human translation is assumed to be the gold standard. For each case there must be a set of three sentences.

1. A sentence in the source language
2. The same sentence translated into the target language by a human
3. The same sentence translated into the target language by a machine

The evaluator will be shown the human translated sentence and the machine translated sentence and asked to rate on a scale from 0 to 100

1. If the machine translated sentence adequately expresses the meaning of the human translated sentence.
2. The machine translated sentence is a well-written phrase or sentence that is grammatically and idiomatically correct

A more in-depth explanation of Direct Assessment can be found in the papers [Continuous Measurement Scales in Human Evaluation of Machine Translation](https://www.aclweb.org/anthology/W13-2305/) and [Is all that Glitters in Machine Translation Quality Estimation really Gold?](https://www.aclweb.org/anthology/C16-1294/).
