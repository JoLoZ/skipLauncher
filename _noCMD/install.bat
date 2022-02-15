@echo off
title skipLauncher
cd ..
echo Installing libraries. This may take a while
call npm i --silent
pause
npm start