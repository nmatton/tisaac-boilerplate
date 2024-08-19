#!/bin/bash

# Run this script tp 

# Set TMP folder and Backup folder paths
TMP=~/TMP_BGA_Boilerplate/
BACKUP="./backup"
$GIT_REPO="https://github.com/nmatton/tisaac-boilerplate" #TODO: Update this with the correct repository URL
$GIT_BRANCH="update_before_documenting" #TODO: Update this with the correct branch name (or remove the --branch flag to clone the default branch)

# Ensure TMP and Backup directories exist and are clean
rm -rf "$TMP"
mkdir -p "$TMP"
mkdir -p "$BACKUP"

# Clone the repository and specify the branch
# If the repository URL or branch is incorrect, handle the error
if ! git clone --branch $GIT_BRANCH $GIT_REPO "$TMP" --config core.filemode=false; then
    echo "Error: Failed to clone the repository. Please check your URL and branch name."
    exit 1
fi

echo "Files retrieved from the repository."

# Get the project name from the .css file in the current directory
# Check if any .css files exist
if ! PROJECT_NAME=$(basename *.css .css); then
    echo "Error: No .css file found in the current directory."
    exit 1
fi

echo "Project name: $PROJECT_NAME"

# Move files with the project name, dbmodel.sql, and modules folder to backup
for file in *"$PROJECT_NAME"* dbmodel.sql; do
  if [ -e "$file" ]; then
    mv "$file" "$BACKUP/"
  fi
done

echo "Files with the project name and dbmodel.sql moved to backup."

if [ -d "./modules" ]; then
  mv ./modules "$BACKUP/"
fi

echo "Modules folder moved to backup."

# Replace "foogame" with the project name in the TMP folder (excluding .png and .jpg files)
OLD="foogame"
NEW="$PROJECT_NAME"

find "$TMP" -type f -not -name '*.png' -not -name '*.jpg' -exec sed -i "" -e "s/$OLD/$NEW/g" {} \; 2> /dev/null


echo "Replaced 'foogame' with the project name in the TMP folder."

# Rename files in TMP folder to replace all occurrences of "foogame" with the project name
find "$TMP" -depth | while read -r file; do
  if [[ -e "$file" && "$file" == *"$OLD"* ]]; then
    new_name=$(echo "$file" | sed "s/$OLD/$NEW/g")
    if [ "$file" != "$new_name" ]; then
      mv "$file" "$new_name" 2>/dev/null
    fi
  fi
done

echo "Renamed files in TMP folder to replace 'foogame' with the project name."

# Move all content from TMP to the root directory, skipping existing files
if [ "$(ls -A $TMP)" ]; then
    shopt -s dotglob
    for file in "$TMP"/*; do
      if [ ! -e "./$(basename "$file")" ]; then
        mv "$file" ./ 2>/dev/null # Suppress false positive error messages
      fi
    done
else
    echo "No files found in $TMP to move."
fi

echo "Files moved from TMP to the root directory."

# Cleanup TMP folder
rm -rf "$TMP"

echo "TMP folder cleaned up."

echo "Script completed successfully."