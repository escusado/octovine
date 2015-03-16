require('neon');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    FileTransferHandler = require('./FileTransferHandler.js');

var VinerHandler = Class({},'VinerHandler')({
  prototype : {

    // filePath : null,
    // socket : null,

    // file : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      // this.file = {},

      this._start();

      return true;
    },

    _start : function _start(){
      console.log('new connection!');
      this._bindEvents();
    //   this._readFile();
    //   this._sendMeta();

    //   // socket connected
    },

    // _readFile : function _readFile(){
    //   //readFile
    //   this.file = {
    //     name : this.config.fileName
    //   }
    // },

    // _sendMeta : function _sendMeta(){
    //   var fileMeta = new Class().includes(this.file);
    //   delete fileMeta.contents;

    //   this.socket.emit('file_meta', {data : {
    //     file : fileMeta
    //   }});
    // },

    _bindEvents : function _bindEvents(){
      this.socket.on('print_start', this._handlePrintStart.bind(this));
    //   this.socket.on('chunk_sucess', this._sendNextChunk.bind(this));
    },

    _handlePrintStart : function _handlePrintStart(){
      console.log('> print_started!');
      this.fileTransferHandler = new FileTransferHandler({
        socket : this.socket,
        path : this.config.storage
      });
    }

  }
});

module.exports = VinerHandler;