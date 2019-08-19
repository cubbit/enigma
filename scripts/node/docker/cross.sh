set -e

mkdir -p /src

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 10

cd /module
rsync -av . /src --exclude node_modules --exclude dependencies --exclude build --exclude dist --exclude coverage --exclude .git

cd /src
export CROSS_COMPILE=""
npm_config_arch=$TARGET_ARCH npm i
npm_config_arch=$TARGET_ARCH npm run build
npm_config_arch=$TARGET_ARCH npm run binary:pack

mkdir -p /module/build/stage
rsync -av /src/build/stage/* /module/build/stage
