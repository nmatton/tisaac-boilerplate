#!/bin/bash
SRC=~/bga/bga-foogame/ # with trailing slash
OLD=foogame
#NEW=foogamesuffix
NEW=foogame
TMP=/tmp/bgarewrite-$OLD
TMPNEW=/tmp/bgarewrite-$NEW/

# Sass
sass $OLD.scss $OLD.css

# Copy
rsync -r --delete --exclude=.git --exclude=misc --exclude=.sass-cache --exclude=node_modules/ --exclude=.vscode $SRC $TMP

# Rewrite contents
find $TMP -type f -not -name '*.png' -not -name '*.jpg' \
  -exec sed -i "" -e "s/$OLD/$NEW/g" {} \; 2> /dev/null

# Preserve modification time
TMPP="${TMP//\//\\/}"
find $TMP -type f \
  -exec bash -c "touch -r \${0/#$TMPP/$SRC} \$0" {} \;

# Rename
find $TMP -name "$OLD*" \
  -exec bash -c "mv \$0 \${0//$OLD/$NEW}" {} \;

mkdir -p $TMPNEW
cp -rp $TMP/* $TMPNEW

# Sync
rsync -vtr $TMPNEW ~/bga/studio/$NEW/
