var argv = require('minimist')(process.argv.slice(2)),
    exec = require('child_process').exec,
    path = require('path'),
    storage = path.resolve('./storage'),
    removeCommand = 'rm '+storage+'/*',
    touchCommand = 'touch '+storage+'/'+encodeURIComponent(argv.data);

exec(removeCommand, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }

  exec(touchCommand, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }

  });

});