require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var FileUploader = Class({},'FileUploader')({
  prototype : {

    filePath : null,
    socket : null,

    file : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      this.file = {},

      this._start();

      return true;
    },

    _start : function _start(){

      console.log('>>>', this.filePath, socket);

      this._bindEvents();
      this._readFile();
      this._sendMeta();

      // socket connected
    },

    _readFile : function _readFile(){
      //readFile
      this.file = {
        name : this.config.fileName
      }
    },

    _sendMeta : function _sendMeta(){
      var fileMeta = new Class().includes(this.file);
      delete fileMeta.contents;

      this.socket.emit('file_meta', {data : {
        file : fileMeta
      }});
    },

    _bindEvents : function _bindEvents(){
      this.socket.on('can_upload', this._sendNextChunk.bind(this));
      this.socket.on('chunk_sucess', this._sendNextChunk.bind(this));
    }

  }
});

module.exports = FileUploader;