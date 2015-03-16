require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var Raspistill = Class({},'Raspistill')({
  prototype : {

    _captureCommand : 'touch ',

    filePath : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      this._start();

      return true;
    },

    capture : function capture(cb){
      console.log('> command: ', this._captureCommand + this.filePath);
      exec(this._captureCommand + this.filePath, function handleMaskCreation(error, stdout, stderr) {
        if(error || stderr){
          throw error || stderr;
        }
        cb(); //exec callback
      });
    }



  }
});

module.exports = Raspistill;