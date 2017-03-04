set -eo pipefail

echo 'Building...'

rm -rf api core packager page-server runtime util *.js *.d.ts
tsc --outDir . --rootDir src

echo 'OK!'
