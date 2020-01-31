#!/bin/sh

yarn lint

if [[ "$?" == 0 ]]; then
    echo "\t\033[32mLinting Passed\033[0m"
else
    echo "\t\033[41mLinting Failed\033[0m"
	exit 1
fi

yarn build

if [[ "$?" == 0 ]]; then
    echo "\t\033[32mBuild Passed\033[0m"
else
    echo "\t\033[41mBuild Failed\033[0m"
	exit 1
fi

yarn pre-commit-tests

if [[ "$?" == 0 ]]; then
    echo "\t\033[32mJest Tests Passed\033[0m"
else
    echo "\t\033[41mJest Tests Failed\033[0m"
	exit 1
fi

echo "\t\033[32mAll pre commit checks passed\033[0m"

exit 0
