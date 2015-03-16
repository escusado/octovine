require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var Raspistill = Class({},'Raspistill')({
  prototype : {

    captureCommand : 'killall mjpg_streamer && raspistill -o {{filePath}} && mjpg_streamer -b -i "/usr/local/lib/input_uvc.so -n" -o "/usr/local/lib/output_http.so -w /usr/local/www"',

    filePath : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      return true;
    },

    capture : function capture(cb){
      this.captureCommand = captureCommand.replace('{{filePath}}', this.filePath);
      console.log('> command: ', this.captureCommand);
      exec(this.captureCommand, function handleMaskCreation(error, stdout, stderr) {
        if(error || stderr){
          throw error || stderr;
        }
        cb(); //exec callback
      });
    }
  }
});

module.exports = Raspistill;