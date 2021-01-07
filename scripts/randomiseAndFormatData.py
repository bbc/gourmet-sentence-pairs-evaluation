import sys
import random
import json

"""
REQUIREMENTS:
The script must be run with python3.

SCRIPT PURPOSE:

Script for randomising evaluation data sentence order, formatting it as JSON and
tagging the sentences so the data can be imported into the Sentence Pairs Evaluation Tool.

This script assumes that there are at least 205 sentences available for evaluation. 5 will be
used as internal calibration and the others will be valid sentences (full explanation below)

INPUT:

- Source Language and Target Language. Set on line 69 and 70. Typically specified as ISO 
codes: https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes. E.G. en for English.
- Text files containing an original sentence, the human translation and a machine translation.
There can be multiple sentences per file. The names of the files must be specified on lines 73, 74
and 75.
- Text file containing the list of evaluator Ids for the data set. The name of this file must be specified on line 78
- A JSON file with the external collaboration sentences. The file name must be specified on
line 77 and the JSON is in the form:

{
    "sentences": list<Sentences>
}

Where Sentences is of type:

{
    "original": string,
    "humanTranslation": string,
    "machineTranslation": string,
}

OUTPUT:

- 2 JSON files. evaluationData1.json and evaluationData2.json, where JSON is in the form:

{
    "sentences": list<Sentences>
}

Where Sentences is of type:

{
    "original": string,
    "humanTranslation": string,
    "machineTranslation": string,
    "sentencePairType: string
}

The first 5 sentences will be marked as internal callibration ('C'). These are to get
evaluators familiar with the task. The remaining sentences will be a mix of valid sentences ('A')
i.e. sentences where the translation has been performed by a machine and external callibration
sentences ('B') i.e. contrived examples.

Each JSON output file contains 110 sentences for evaluation and is composed of:
- 5 internal callibration sentences. These will be the same 5 sentences in both files and will always be the first 5.
- 100 valid sentences and 5 external calibration sentences shuffled together and in a random order. 
The external calibration sentences will be the same in both files.

"""

source_language=
target_language=

# Specify the files that are to be read in. The list must be in the same order for original, human translation and machine translation.
original_filenames = ["bulgarian1EN.txt"]
human_translation_filenames = ["bulgarian1HT.txt"]
machine_translation_filenames = ["bulgarian1MT.txt"]

external_callibration_json_file = "perfect.json"
evaluator_ids_file = "possibleEvaluatorIds.txt"

if(len(original_filenames) != len(human_translation_filenames) or len(human_translation_filenames) != len(machine_translation_filenames)):
    sys.exit("Files do not exist for every variation of the articles.")

num_of_files = len(original_filenames)

file_sets = []

# Group the files together by article. This assumes that the files are provided in the lists in the same order
for i in range(num_of_files):
    file_sets.append({
        "original": original_filenames[i],
        "human_translation": human_translation_filenames[i],
        "machine_translation": machine_translation_filenames[i]
    })

sentences = []

# Read files in and group sentences
for file_set in file_sets:
    original = open(file_set['original'], "r").readlines()
    human_translation = open(file_set['human_translation'], "r").readlines()
    machine_translation = open(
        file_set['machine_translation'], "r").readlines()

    if(len(original) != len(human_translation) or len(human_translation) != len(machine_translation)):
        sys.exit(f'Files do not have the same number of lines in file set: {file_set}.')
    for i in range(len(original)):
        sentences.append({
            "original": original[i],
            "humanTranslation": human_translation[i],
            "machineTranslation": machine_translation[i]
        })

# Randomise the order of the sentences
random.shuffle(sentences)

# Split data into internal collaboration and valid sentences
internal_callibration_sentences = sentences[:5]
valid_sentences = sentences[5:]

# Tag sentences

for s in internal_callibration_sentences:
    s['sentencePairType'] = 'C'

for s in valid_sentences:
    s['sentencePairType'] = 'A'

# Import and tag external callibration sentences

with open(external_callibration_json_file) as f:
    external_callibration_sentences = json.load(f)['sentences']

for s in external_callibration_sentences:
    s['sentencePairType'] = 'B'

# Combine 100 valid sentences and external callibration sentences and shuffle
valid_and_external_callibration_sentences_set_1 = valid_sentences[:100] + external_callibration_sentences
random.shuffle(valid_and_external_callibration_sentences_set_1)

# Combine 100 valid sentences and external callibration sentences and shuffle
valid_and_external_callibration_sentences_set_2 = valid_sentences[100:200] + external_callibration_sentences
random.shuffle(valid_and_external_callibration_sentences_set_2)

# Read in evaluator Ids
with open(evaluator_ids_file) as f:
    evaluator_ids = f.read().splitlines()

# Create first data set
evaluationData1 = open('evaluationData1.json', 'w')
evaluationData1.write(json.dumps({"sourceLanguage": source_language, "targetLanguage": target_language, "possibleEvaluatorIds": evaluator_ids,
                                  "sentences": internal_callibration_sentences + valid_and_external_callibration_sentences_set_1}, ensure_ascii=False))
evaluationData1.close()

# Create second data set
evaluationData2 = open('evaluationData2.json', 'w')
evaluationData2.write(json.dumps({"sourceLanguage": source_language, "targetLanguage": target_language,  "possibleEvaluatorIds": evaluator_ids,
                                  "sentences": internal_callibration_sentences + valid_and_external_callibration_sentences_set_2}, ensure_ascii=False))
evaluationData2.close()
