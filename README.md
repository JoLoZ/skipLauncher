# skipLauncher

The skipable launcher!

## Important information

This launcher is far from finished and I'll be continuing to update it. Consider checking this repo every now and then for updates. Your data will be kept across updates and reinstalls.

## Installation

Simply download the repo and run `npm i`, that'll take care of everything. The actual Minecraft installation will happen on first launch.

## Compiling

If you want to compile a version for yourself, use `npm run pack` and check the result in the `dist` folder. To also generate a redistributeable installer, run `npm run dist`.

## Launching Minecraft

Currently the launcher can launch any released version through the GUI. However, the launcher supports all snapshots through the config file.

You can also create a shortcut to launch Minecraft directly. Simply create a shortcut to the url `skipLauncher://launch/<your-version>` and it'll open up the launcher, download and launch the specified version. **This requires the launcher to be compiled.**

## License

The launcher is available under the Apache 2.0 license. See the `LICENSE` file for more.
