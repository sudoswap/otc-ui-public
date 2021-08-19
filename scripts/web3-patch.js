// This fix was taken from https://stackoverflow.com/a/66870049/4207548
// and amended to include other patches

const fs = require('fs');

// Replaces occurrences of *regex* with *replacement* in the file found at *path*
const patch = (path, regex, replacement) => {
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(regex, replacement);

    fs.writeFile(path, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}

// path can differ depend on Angular CLI version
const browserConfigPath = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';
patch(browserConfigPath, /node: false/g, 'node: {crypto: true, stream: true}');

const ganacheSubproviderPath = 'node_modules/@0x/subproviders/lib/src/subproviders/ganache.d.ts';
patch(ganacheSubproviderPath, /opts: Ganache\.GanacheOpts/g, 'opts: any');
