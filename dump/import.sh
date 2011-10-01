#! /bin/bash

# import json dumps to collections
# will drop existing collection before writing!

mongoimport -d flashcards -c words --file ./flashcards-words.json --stopOnError --drop
