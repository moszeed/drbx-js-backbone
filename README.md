#drbx-js-backbone

[![Join the chat at https://gitter.im/moszeed/drbx-js-backbone](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/moszeed/drbx-js-backbone?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)  
a promise wrapper for backbone, to sync to a dropbox account

#how to use
install from npm

	npm i drbx-js-backbone

and require like this

    var Backbone = require('drbx-js-backbone);


##usage examples
####init, with popup driver and login
	
	var Backbone = require('drbx-js-backbone);
        Backbone.init({
            client  : { key : [Dropbox API Key] },
            auth    : new Dropbox._Dropbox.AuthDriver.Popup({
                receiverUrl     : [receiverUrl],
                rememberUser    : true
            })
        });

        Backbone.login()
            .then(function isLoggedIn() {
                console.log('user is logged in');
            })
            .catch(function(err) {
                console.log(err);
            });


####get accountInfo

    Backbone.DrbxJs.accountInfo()
        .then(function getUserData(userData) {
            console.log(userData);
        })
        .catch(function(err) {
            console.log(err);
        });

####create a model

	var Model = new Backbone.Model.extend({
    	url: '/path/to/file'
    });

####create a collection

	var Collection = new Backbone.Collection.extend({
    	url: '/path/to/file'
   		model: Model
    });
