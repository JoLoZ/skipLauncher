# skipLauncher

The skipable Minecraft launcher!

[![CircleCI](https://img.shields.io/circleci/build/gh/JoLoZ/skipLauncher?logo=circleci&style=for-the-badge)](https://app.circleci.com/pipelines/github/JoLoZ)

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

## Platform & OS support
[![Windows - supported](https://img.shields.io/static/v1?label=Windows&message=Supported&color=success&logo=windows&style=for-the-badge)](https://gitlab.com/joloz/skip-launcher/-/wikis/platform/Windows)
[![Linux - planned support](https://img.shields.io/static/v1?label=Linux&message=Soon&color=important&logo=linux&logoColor=white&style=for-the-badge)](https://gitlab.com/joloz/skip-launcher/-/wikis/platform/Linux)
[![Mac - no support](https://img.shields.io/static/v1?label=Mac&message=No+support&color=critical&logo=apple&style=for-the-badge)](https://gitlab.com/joloz/skip-launcher/-/wikis/platform/Mac)

Is your platform not supported? **It might still work.** Click on it to learn why, if support for it in the future is planned and maybe how to make it run despite not offically being supported.

## License

The launcher is available under the Apache 2.0 license. See the `LICENSE` file for more.
