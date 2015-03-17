require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var Raspistill = Class({},'Raspistill')({
  prototype : {


    filePath : null,
    captureCommand : null,
    // captureCommand : "killall mjpg_streamer && raspistill -o {{filePath}} && ~/scripts/webcamDaemon &",

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      return true;
    },

    capture : function capture(cb){
      this.captureCommand = this.config.captureCommand.replace('{{filePath}}', this.filePath);
      console.log('>captureCommand: ', this.captureCommand);
      exec(this.captureCommand, function handleMaskCreation(error, stdout, stderr) {
        if(error){
          console.log(error.toString());
        }
        if(stderr){
          console.log(stderr);
        }

        cb(); //exec callback
      });
    }
  }
});

module.exports = Raspistill;