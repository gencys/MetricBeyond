#!/bin/bash
cd src
xattr -cr .

firefox_ver=$(grep '"version"' manifest_firefox.json | sed -E 's/^.*version[^0-9]*([0-9\.]+)",$/\1/')
chrome_ver=$(grep '"version"' manifest_chrome.json | sed -E 's/^.*version[^0-9]*([0-9\.]+)",$/\1/')

mv manifest_firefox.json manifest.json
zip -rq ../mb_firefox_${firefox_ver}.zip * -x manifest_chrome.json -x '*.DS_Store' -X

if [ $1 = 'deploy' ]; then
    web-ext sign --api-key=$MOZILLA_KEY --api-secret=$MOZILLA_SECRET --channel=listed -i "manifest_chrome.json" "*.DS_Store"
    rm -r ./web-ext-artifacts
fi

mv manifest.json manifest_firefox.json
mv manifest_chrome.json manifest.json
zip -rq ../mb_chrome_${chrome_ver}.zip * -x manifest_firefox.json -x '*.DS_Store' -X

mv manifest.json manifest_chrome.json
