#!/bin/bash
PROJECT_ID=287725
INPUT_FILE="src/lang/en.json"

# argument processing from https://stackoverflow.com/a/14203146
while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -a|--api_token)
    API_TOKEN="$2"
    shift # past argument
    ;;
esac
shift # past argument or value
done

PUSHARGS="-p $PROJECT_ID -i $INPUT_FILE -a $API_TOKEN"
# echo "PUSHARGS=$PUSHARGS"
./poeditor-scripts/strings-push.sh $PUSHARGS
