#!/bin/sh

# The ../../ is because the symlink will be evaluated from the 
# .git/hooks directory. So to find the script you must first
# go up 2 directories 

ln -s ../../githooks/pre-commit.sh .git/hooks/pre-commit
