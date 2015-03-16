require('neon');

var appRoot = process.cwd(),
    io = require ('socket.io-client'),
    fs = require('fs'),
    exec = require('child_process').exec,
    FileUploader = require(appRoot+'/lib/FileUploader.js'),
    Raspistill = require(appRoot+'/lib/Raspistill.js'),
    argv = require('yargs').argv,
    express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app),
    argv = require('yargs').argv;

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
      app.get('/print_start', function(req, res){
        res.end();
        console.log('>>>', this._connected);
        if(this._connected){
          // this._handle
          console.log('print start');
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

      app.get('/print_end', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_end');
        }else{
          console.log('viner unavailable');
        }
      }.bind(this));

      app.get('/print_cancel', function(req, res){
        res.end();
        if(this._connected){
          // this._handle
          console.log('print_cancel');
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
        filePath : filePath
      });

      raspistill.capture(function(){
        console.log('>>> created');
      });
    }
  }
});

var client = new Client({
  configFile : argv.c
});