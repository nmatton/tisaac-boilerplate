#!/bin/bash
SRC=~/bga/bga-foogame/ # with trailing slash
NAME=foogame

# Sass
sass "$NAME.scss" "$NAME.css"

# Copy
rsync $SRC/$NAME.css ~/bga/studio/$NAME/
rsync $SRC/$NAME.css.map ~/bga/studio/$NAME/
