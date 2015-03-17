require('neon');

var appRoot = process.cwd(),
    io = require ('socket.io'),
    fs = require('fs'),
    exec = require('child_process').exec,
    VinerHandler = require('../lib/VinerHandler.js'),
    argv = require('yargs').argv,
    Firebase = require('firebase');

Class('MonitorServer')({
  prototype : {

    config : null,
    currentPrint : null,
    currentPrintRef : null,
    currentPrintStorage : null,

    init : function init(config){

      Object.keys(config || {}).forEach(function (property) {
        this[property] = config[property];
      }, this);

      this.config = JSON.parse(fs.readFileSync(this.configFile), 'utf-8');

      return true;
    },

    start : function start(){

      this.firebaseRef = new Firebase(this.config.firebasePrintsEndpoint);
      this.firebaseRef.authWithCustomToken(this.config.firebaseToken, function(error, authData){
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log('>firebase available!');
          this._firebaseAvailable = true;
        }
      }.bind(this));

      this._bindEvents();
    },

    _bindEvents : function _bindEvents(){
      this.firebaseRef.on('child_added', this._handleNewPrint.bind(this));
    },

    _handleNewPrint : function _handleNewPrint(snap){

      if(snap.val().status !== 'print_started'){
        return;
      }
      this.currentPrintRef = new Firebase(this.config.firebasePrintsEndpoint+'/'+snap.key());
      this.currentPrintRef.on('value', this._handleValueChange.bind(this));

      this.currentPrintStorage = new Firebase(this.config.firebasePrintsEndpoint+'/'+snap.key()+'/storage');
      this.currentPrintStorage.on('child_added', this._handleNewImage.bind(this));
    },

    _handleValueChange : function _handleValueChange(snap){
      this.currentPrint = snap.val();

      switch (this.currentPrint.status) {
        case 'print_started' :
          this.print_started(this.currentPrint);
          console.log('status: >print_started');
        break;

        // case 'z_change' :
        //   console.log('status: >z_change');
        // break;

        // case 'print_done' :
        //   console.log('status: >print_done');
        // break;

        // case 'print_cancelled' :
        //   console.log('status: >print_cancelled');
        // break;

        // case 'print_failed' :
        //   console.log('status: >print_failed');
        // break;
      }

    },

    //Handlers
    print_started : function print_started(print){
      fs.mkdirSync(appRoot+this.config.storage+print.id);
      this.currentPrintRef.update({status : 'server_handled'});
    },

    _handleNewImage : function _handleNewImage(snap){

      if(!snap.val()){
        return;
      }

      var image = snap.val();
      fs.writeFileSync(appRoot+this.config.storage+this.currentPrint.id+'/'+image.timestamp+'.jpg', image.data, 'base64');
      this.currentPrintStorage.set(null);
    }
  }
});

var server = new MonitorServer({
    configFile : argv.c
});
server.start();