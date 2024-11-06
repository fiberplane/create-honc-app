#!/bin/bash

# Define variables
REPO_URL="https://github.com/cloudflare/cloudflare-docs"
BRANCH="production"
TARGET_DIR="$(pwd)/cloudflare-docs"

# Create a temporary directory
TEMP_DIR=$(mktemp -d)

# Ensure the target directory exists
mkdir -p "$TARGET_DIR"

# Navigate to the temporary directory
cd "$TEMP_DIR" || exit

# Download the repository as a ZIP file
curl -L "$REPO_URL/archive/refs/heads/$BRANCH.zip" -o repo.zip

# Extract the ZIP file
unzip repo.zip

# Determine the extracted folder name
EXTRACTED_DIR=$(unzip -Z -1 repo.zip | head -n 1 | cut -d/ -f1)

# Copy the contents to the target directory
cp -r "$EXTRACTED_DIR"/* "$TARGET_DIR"

# Clean up
rm -rf "$TEMP_DIR"

echo "Files have been successfully copied to $TARGET_DIR"
