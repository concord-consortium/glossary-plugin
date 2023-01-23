#!/bin/bash
PROJECT_ID=297867
OUTPUT_DIR=src/lang
LANGUAGES=("es" "pt" "ar" "zh-CN" "ru" "gv" "mi" "mr" "haw" "an")

# argument processing from https://stackoverflow.com/a/14203146
while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -a|--api_token)
    API_TOKEN="$2"
    shift # past argument
    ;;
    -o|--output_dir)
    OUTPUT_DIR="$2"
    shift # past argument
    ;;
esac
shift # past argument or value
done

for LANGUAGE in "${LANGUAGES[@]}"
do
    echo "Requesting strings for '$LANGUAGE'..."
    PULLARGS="-p $PROJECT_ID -l $LANGUAGE -o $OUTPUT_DIR -a $API_TOKEN"
    # echo "PULLARGS=$PULLARGS"
    ./poeditor-scripts/strings-pull.sh $PULLARGS
    echo ""
done
