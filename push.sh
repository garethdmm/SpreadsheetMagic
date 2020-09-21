#!/bin/sh
placeholder="\[API_KEY_GOES_HERE\]"
value=`cat .apikey.env`
sed -i '' -e "s/$placeholder/$value/" Code.js
clasp push
sed -i '' -e "s/$value/$placeholder/" Code.js
