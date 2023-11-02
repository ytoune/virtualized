set -Ceu

yarn test
yarn build
npm publish --dry-run
