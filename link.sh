#!/bin/bash

# Define the paths
PROJECT_DIR=$(pwd)
DIST_DIR="$PROJECT_DIR/dist/src"
BIN_DIR="$HOME/.nvm/versions/node/v18.18.2/bin"

# Ensure the TypeScript project is built
echo "Building the TypeScript project..."
npm run build

# Check if the compiled index.js exists
if [ ! -f "$DIST_DIR/index.js" ]; then
  echo "Error: Compiled index.js not found. Please ensure your TypeScript build is successful."
  exit 1
fi

# Add shebang to the index.js if it's not already there
if ! head -n 1 "$DIST_DIR/index.js" | grep -q '#!/usr/bin/env node'; then
  echo "Adding shebang to index.js..."
  sed -i '' '1s/^/#!\/usr\/bin\/env node\n/' "$DIST_DIR/index.js"
fi

# Make sure index.js is executable
chmod +x "$DIST_DIR/index.js"

# Create the symlink in the global bin directory
echo "Creating symlink in $BIN_DIR..."
ln -sf "$DIST_DIR/index.js" "$BIN_DIR/ezc-scaffold-cli"

# Verify the symlink was created
if [ -L "$BIN_DIR/ezc-scaffold-cli" ]; then
  echo "Symlink created successfully!"
else
  echo "Error: Failed to create symlink."
  exit 1
fi

# Ensure the global npm bin directory is in the PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo "Adding global npm bin directory to PATH..."
  echo "export PATH=\"\$PATH:$BIN_DIR\"" >> ~/.zshrc
  source ~/.zshrc
fi

# Test the CLI tool
#echo "Testing the CLI tool..."
#ezc-scaffold-cli create_project

echo "Linking process completed!"
