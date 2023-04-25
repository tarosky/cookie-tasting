#!/usr/bin/env bash

set -e

# Build files
composer install --no-dev --prefer-dist
npm install
npm run build

# Make Readme
echo 'Generate readme.'
curl -L https://raw.githubusercontent.com/fumikito/wp-readme/master/wp-readme.php | php

# Change version string.
sed -i.bak "s/^Version: .*/Version: ${VERSION}/g" ./cookie-tasting.php
sed -i.bak "s/^Stable tag: .*/Stable tag: ${VERSION}/g" ./readme.txt
