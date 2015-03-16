require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var Raspistill = Class({},'Raspistill')({
  prototype : {

    captureCommand : null,

    filePath : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      return true;
    },

    capture : function capture(cb){
      this.captureCommand = this.config.captureCommand.replace('{{filePath}}', this.filePath);
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