#! /bin/bash

# export flashcards collections to json dumps
mongoexport -d flashcards -c words -o ./flashcards-words.json
