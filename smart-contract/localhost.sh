#!/bin/sh
npm run hardhat:fork & 
sleep 5
npm run deploy:localhost & 
sleep 20
npm run addtoken
wait
exit 0