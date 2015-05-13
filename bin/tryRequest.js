// var
//     path = require('path'),
//     storage = path.resolve('./storage'),
//     touchCommand = 'touch '+storage+'/'+encodeURIComponent(argv.data);

// sh.run(touchCommand);



var exec = require('child_process').exec,
  path = require('path'),
  sh = require('execSync'),
  storage = path.resolve('./storage'),
  Finder = require('fs-finder'),
  removeCommand = 'rm '+storage+'/*',
  server = 'http://192.168.100.7:3000/';

  files = Finder.in(storage).findFiles();
  filename = path.basename(files[0])

exec('curl '+server+filename, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    sh.run(removeCommand);
});