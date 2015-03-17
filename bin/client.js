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
    server  = http.createServer(app),
    argv = require('yargs').argv,
    Firebase = require('firebase');

Class('Client')({
  prototype : {

    config: null,
    firebaseRef : null,
    currentPrint : null,
    currentPrintStorage : null,

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

      //Firebase
      this.firebaseRef = new Firebase(this.config.firebasePrintsEndpoint);
      this.firebaseRef.authWithCustomToken(this.config.firebaseToken, function(error, authData){
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
        }
      });

      return this;
    },

    _setRoutes : function _setRoutes(){

      //simple router
      app.get('/:method', function(req, res){
        res.end();
        console.log('method: ', req.params.method);

        var controllers = {
          'print_started'   : this.print_started.bind(this),
          'z_change'        : this.z_change.bind(this),
          'print_done'      : this.print_done.bind(this),
          'print_cancelled' : this.print_cancelled.bind(this),
          'print_failed'    : this.print_failed.bind(this)
        };

        if(controllers[req.params.method]){
          controllers[req.params.method](req.params);
        }

      }.bind(this));

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
      console.log('>print_started');

      var timestamp = new Date().getTime();

      this.currentPrint = {
        id : timestamp,
        storage : {},
        name : 'my-print-'+timestamp
      };

      this.firebaseRef.child(this.currentPrint.id).set(this.currentPrint);
      this.currentPrintStorage = new Firebase(this.config.firebasePrintsEndpoint+'/'+this.currentPrint.id+'/storage/');
    },

    z_change : function z_change(params){
      console.log('>z_change');

      var raspistill,
          filePath = appRoot+this.config.storage+this.config.captureName;

      raspistill = new Raspistill({
        filePath : filePath,
        config : this.config
      });

      raspistill.capture(function(){

        console.log('>captured');

        var capture = {
          data : fs.readFileSync(filePath).toString('base64')
        };

        this.currentPrintStorage.push(capture);

        console.log('>saved');
      }.bind(this));
    },

    print_done : function print_done(){
      console.log('> meprint_done');
    },

    print_cancelled : function print_cancelled(){
      console.log('> meprint_cancelled');
    },

    print_failed : function print_failed(){
      console.log('> meprint_failed');
    }

  }
});

var client = new Client({
  configFile : argv.c
});