# skipLauncher

The skipable Minecraft launcher!

Build status: [![CircleCI](https://circleci.com/gh/JoLoZ/skipLauncher/tree/main.svg?style=svg)](https://circleci.com/gh/JoLoZ/skipLauncher)

## Note for people viewing this on GitHub

GitHub is used as a mirror in order to make Circle CI work. If you want to contribute, fork, etc this project, please do so on GitLab.

[![GitLab](https://img.shields.io/static/v1?label=View+on&message=GitLab&color=FCA121&logo=gitlab&style=for-the-badge)](https://gitlab.com/joloz/skip-launcher)





## Installation

### Precompiled

To download premade binaries, scroll up and download the stable build.

### Do it yourself build

In order to build skipLauncher yourself, you need to first clone this repo and then install the dependencies by running `npm i`. Now compile the code using `npm run pack` and you're done!

## Launching Minecraft

Currently there are two ways available to launch Minecraft

### Interface

You can launch Minecraft by opening up the launcher, selecting a version and booting it up.

### Protocol

An easier way to launch the game is by creating a new shortcut and pointing it to `skipLauncher://launch/0.0.0` (replace `0.0.0` with the version). It'll boot you right through into the game.

## License

The launcher is available under the Apache 2.0 license. See the `LICENSE` file for more.
