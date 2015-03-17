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

      //Firebase
      this.firebaseRef = new Firebase(this.config.firebasePrintsEndpoint);
      this.firebaseRef.authWithCustomToken(this.config.firebaseToken, function(error, authData){
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log('>firebase available!');
          this._firebaseAvailable = true;
        }
      }.bind(this));

      return this;
    },

    _setRoutes : function _setRoutes(){

      //simple router
      app.get('/:method', function(req, res){
        res.end();
        console.log('method: ', req.params.method);

        var controllers = {
          'print_started'   : this.print_started,
          'z_change'        : this.z_change,
          'print_done'      : this.print_done,
          'print_cancelled' : this.print_cancelled,
          'print_failed'    : this.print_failed
        };

        if(controllers[req.params.method] && this._firebaseAvailable){
          controllers[req.params.method](req.params);
        }else{
          console.log('>error: ', req.params.method, this._firebaseAvailable);
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

      var timestamp = new Date().getTime();

      this.currentPrint = {
        id : timestamp,
        storage : {},
        name : 'my-print-'+timestamp,
        status : 'print_started'
      };

      this.firebaseRef.child(this.currentPrint.id).set(this.currentPrint);
      this.currentPrintStorage = new Firebase(this.config.firebasePrintsEndpoint+'/'+this.currentPrint.id+'/storage/');
      console.log('>print_started', timestamp);
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
          timestamp : new Date().getTime(),
          data : fs.readFileSync(filePath).toString('base64')
        };

        this.currentPrintStorage.push(capture, function(){
          console.log('>saved');
          this.firebaseRef.child(this.currentPrint.id).update({
            status : 'z_change'
          });
        }.bind(this));

      }.bind(this));
    },

    print_done : function print_done(){
      console.log('> print_done');
      this.firebaseRef.child(this.currentPrint.id).update({
        status : 'print_done'
      });
    },

    print_cancelled : function print_cancelled(){
      console.log('> print_cancelled');
      this.firebaseRef.child(this.currentPrint.id).update({
        status : 'print_cancelled'
      });
    },

    print_failed : function print_failed(){
      console.log('> print_failed');
      this.firebaseRef.child(this.currentPrint.id).update({
        status : 'print_failed'
      });
    }

  }
});

var client = new Client({
  configFile : argv.c
});