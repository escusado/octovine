require('neon');

var io = require ('socket.io'),
    fs = require('fs'),
    exec = require('child_process').exec,
    VinerHandler = require('../lib/VinerHandler.js'),
    argv = require('yargs').argv;

Class('Viner')({
  prototype : {

    config : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      this.config = this._loadConfig() || {};

      return true;
    },

    _loadConfig : function _loadConfig(){
      return this.config = JSON.parse(fs.readFileSync(this.configFile), 'utf-8');
    },

    start : function start(){

      this.socket = io.listen(this.config.port);
      console.log('port: ', this.config.port);
      this.socket.on('connection', function (socket){

        this.vinerHandler = new VinerHandler({
          socket : socket,
          config : this.config
        });

        this._bindEvents();

      }.bind(this));
    },

    _bindEvents : function _bindEvents(){
      this.socket.on('file_transfer_success', this._handleFileTransferSuccess.bind(this));
    },

    _handleFileTransferSuccess : function _handleFileTransferSuccess(ev){
      console.log('>>> incoming capture: ', ev.data);
    }
  }
});

var server = new Viner({
    configFile : argv.c
});
server.start();