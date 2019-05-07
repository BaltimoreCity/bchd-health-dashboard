#!/bin/bash

set -e -x

pushd bchd-health-dashboard
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  nvm install 8
  nvm use 8
  npm install --silent
  npm install -g gulp --silent
  gulp test
popd
