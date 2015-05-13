require('neon');

var appRoot = process.cwd(),
    io = require ('socket.io-client'),
    fs = require('fs'),
    exec = require('child_process').exec,
    Raspistill = require('../lib/Raspistill.js'),
    argv = require('yargs').argv,
    express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app);

Class('Client')({
  prototype : {

    config: null,
    firebaseRef : null,
    currentPrint : null,
    currentPrintStorage : null,
    _firebaseAvailable : null,

    init : function init (config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      //load config
      this.config = JSON.parse(fs.readFileSync(this.configFile), 'utf-8');

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

      //simple router
      app.get('/:method', function(req, res){
        this.digestCommand(req.params.method);
        res.end();
      }.bind(this));

    },

    digestCommand : function digestCommand(command){
      console.log('>>>>>', command);
    },

    //kickstart webserver
    _serverStart : function _serverStart(){
      console.log('Server ready');
      console.log('http://localhost:'+this.config.webPort.toString());

      server.listen(this.config.webPort);

      return this;
    },

    //Printer event handlers
    print_started : function print_started(params){
      console.log('>print_started', timestamp);
    },

    z_change : function z_change(params){
      console.log('>z_change');
    },

    print_done : function print_done(){
      console.log('> print_done');
    },

    print_cancelled : function print_cancelled(){
      console.log('> print_cancelled');
    },

    print_failed : function print_failed(){
      console.log('> print_failed');
    }

  }
});

var client = new Client({
  configFile : argv.c
});