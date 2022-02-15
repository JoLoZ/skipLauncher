@echo off
title skipLauncher
cd ..
echo Compiling skipLauncher for production. This may take a while
call npm run dist --silent
pause