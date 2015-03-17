require('neon');

var appRoot = process.cwd(),
    io = require ('socket.io-client'),
    fs = require('fs'),
    exec = require('child_process').exec,
    FileUploader = require('../lib/FileUploader.js'),
    Raspistill = require('../lib/Raspistill.js'),
    argv = require('yargs').argv,
    express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app),
    argv = require('yargs').argv,
    Dropbox = require('dropbox'),
    dropboxClient = new Dropbox.Client({token : '-AujDJ1JiaIAAAAAAAAKDwFzLqNKtBTNtVbvXpYD6NRWRi6WavlYGv29lK0ZCy70'});

Class('Client')({
  prototype : {

    _connected : null,

    config: null,

    init : function init (config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      this._connected = false;

      this._loadConfig();
      this._configureApp();
      this._setRoutes();
      this._serverStart();
      return this;
    },

    _configureApp : function _configureApp(){

      //CORS
      app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
      });

      return this;
    },

    _setRoutes : function _setRoutes(){
      app.get('/print_started', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_started');
          this._printStart();
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      app.get('/z_change', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('z_change');
          this._captureAndSendImage();
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      app.get('/print_done', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_done');
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      app.get('/print_cancelled', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_cancelled');
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      app.get('/print_failed', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_failed');
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      return this;
    },

    _serverStart : function _serverStart(){
      console.log('Server ready');
      console.log('http://localhost:'+this.config.webPort.toString());

      this._connectToViner();

      server.listen(this.config.webPort);

      return this;
    },

    _connectToViner : function _connectToViner(){
      this.socket = io(this.config.vinerEndpoint);
      this.socket.on('connect', function (socket) {
        // this.socket = socket;
        this._connected = true;
        console.log('Connected to Viner at: ', this.config.vinerEndpoint);
      }.bind(this));

      this.socket.on('disconnect', function (socket) {
        // this.socket = socket;
        this._connected = false;
        console.log('Disconnection from Viner at: ', this.config.vinerEndpoint);
      }.bind(this));
    },

    _printStart : function _printStart(){
      this.socket.emit('print_start');
    },

    _loadConfig : function _loadConfig(){
      return this.config = JSON.parse(fs.readFileSync(this.configFile), 'utf-8');
    },

    _captureAndSendImage : function _captureAndSendImage(){
      var raspistill,
          filePath = appRoot+this.config.storage+this.config.captureName;

      raspistill = new Raspistill({
        filePath : filePath,
        config : this.config
      });

      raspistill.capture(function(){
        console.log('>>> created');
        dropboxClient.writeFile(this.config.captureName, fs.readFileSync(filePath), function(error, stat) {
          if (error) {
            return showError(error);  // Something went wrong.
          }

          console.log("File saved as revision " + stat.versionTag);
        }.bind(this));
      }.bind(this));
    }
  }
});

var client = new Client({
  configFile : argv.c
});