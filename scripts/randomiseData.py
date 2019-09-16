import sys
import random

# Script for randomising evaluation data sentence order.

# This script takes a series of articles that have an original article
# a human translated version of the article and a machine translated article split
# across three text files. The script returns 3 files (original, human translation and
# machine translation) which contain all the sentences from the articles provided and
#  where the order of the sentences is consistent across the files i.e. sentence 1 in
# the human translation file will be a translation of sentence 1 in the original file.
# The sentences will have been shuffled so that they appear in a random order as opposed
# to the order in the original articles.

# Specify the files that are to be read in. The list must be in the same order for original, human translation and machine translation.
original_filenames = []
human_translation_filenames = []
machine_translation_filenames = []

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
        sys.exit(
            f'Files do not have the same number of lines in file set: {i}.')

    for i in range(len(original)):
        sentences.append({
            "original": original[i],
            "human_translation": human_translation[i],
            "machine_translation": machine_translation[i]
        })

# Randomise the order of the sentences
random.shuffle(sentences)

# Write the shuffled sentences back to files maintaining the order of the sentences across the files. i.e. sentence 1 in all files will have the same meaning.
original = open("original.txt", 'w')
human_translation = open("human_translation.txt", 'w')
machine_translation = open("machine_translation.txt", 'w')

for sentence in sentences:
    original.write(sentence['original'])
    human_translation.write(sentence['human_translation'])
    machine_translation.write(sentence['machine_translation'])

original.close()
human_translation.close()
machine_translation.close()
