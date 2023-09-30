#!/bin/bash
echo "Updating NPM packages"
npm install

echo "Adding DOMPurify to the extension"
cp node_modules/dompurify/dist/purify.min.js src/libs/purify.min.js

echo "Cleaning DS_Store"
find . -path "*DS_Store" -delete

cd src
xattr -cr .

echo "Getting the version"
firefox_ver=$(grep '"version"' manifest_firefox.json | sed -E 's/^.*version[^0-9]*([0-9\.]+)",$/\1/')
chrome_ver=$(grep '"version"' manifest_chrome.json | sed -E 's/^.*version[^0-9]*([0-9\.]+)",$/\1/')

if [ ! -d "../dist" ]; then
    mkdir "../dist"
fi

echo "Zipping the Firefox version"
mv manifest_firefox.json manifest.json
zip -rq ../dist/mb_firefox_${firefox_ver}.zip * -x manifest_chrome.json -x '*.DS_Store' -X

if [[ $1 == 'deploy' ]]; then
    echo "Deploying to the Firefox store"
    npx web-ext sign --api-key=$MOZILLA_KEY --api-secret=$MOZILLA_SECRET --channel=listed -i "manifest_chrome.json" "*.DS_Store"
    rm -r ./web-ext-artifacts
fi

echo "Zipping the Chrome version"
mv manifest.json manifest_firefox.json
mv manifest_chrome.json manifest.json
zip -rq ../dist/mb_chrome_${chrome_ver}.zip * -x manifest_firefox.json -x '*.DS_Store' -X

mv manifest.json manifest_chrome.json
