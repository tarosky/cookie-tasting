#!/usr/bin/env bash

set -e

# Build files
composer install --no-dev --prefer-dist
npm install
npm run build
# Make Readme
echo 'Generate readme.'
curl -L https://raw.githubusercontent.com/fumikito/wp-readme/master/wp-readme.php | php
# Remove files
rm -rf node_modules
rm -rf package-lock.json
rm -fr .gitignore
rm -rf .git
rm -rf .wp-env.json
#rm -rf tests
rm -rf .travis.yml
rm -rf bin
rm -rf README.md
#rm -rf phpcs.xml.dist
#rm -rf phpunit.xml.dist
#rm -rf phpdoc.xml
