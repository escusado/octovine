//printercommand: node /home/pi/apps/octovine/bin/saveMeta.js --data "command|%(data)s|%(filename)s|%(progress)s|%(currentZ)s|%(now)s"

var filename,
    exec = require('child_process').exec,
    path = require('path'),
    hound = require('hound'),
    storage = path.resolve('./storage'),
    Finder = require('fs-finder'),
    removeCommand = 'rm '+storage+'/*',
    server = 'http://192.168.100.4:3000/',

    files = Finder.in(storage).findFiles(),
    watcher = hound.watch(storage);

watcher.on('create', function (f, curr, prev) {
  if (files[0]) {
    filename = path.basename(files[0]);
    exec('curl '+server+filename, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
         exec(removeCommand, function (error, stdout, stderr) {});
    });
  }
});
