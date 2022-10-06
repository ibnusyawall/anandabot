echo "update package from source ..."
pkg update && pkg upgrade
echo "update success"
echo "try to install git and nodejs ..."
pkg install git
pkg install nodejs-lts
echo "success install git and nodejs"
echo "try to install typescript and yarn ..."
npm i -g npm@latest
npm i -g typescript
npm i -g yarn
echo "ts and yarn successfuly installed"
echo "try to install baileys module ..."
git clone https://github.com/adiwajshing/Baileys && cd Baileys && yarn install && cd ..
echo "try to installing modules ..."
yarn install
echo "setup done!"
echo "to run script type: npm start"
