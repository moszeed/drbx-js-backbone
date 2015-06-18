(function() {

    "use strict";

    var debounce = require("es6-promise-debounce");
    var DrbxJs   = require("drbx-js");
    var Backbone = require("backbone");

        Backbone.oldSync = Backbone.sync;
        Backbone.DrbxJs = DrbxJs;

        Backbone.DrbxJs.writeFileDebounced = debounce(Backbone.DrbxJs.writeFile, 200);

        //forwarding login functions
        Backbone.init   = DrbxJs.init;
        Backbone.login  = DrbxJs.login;


        //generate 4 HEX Digits
        function generate4HexDigits() {
           return (((1 + Math.random()) * 0x10000) | 0)
            .toString(16)
            .substring(1);
        }

        //combine random HEX Digits for pseudo guid
        //thx to https://github.com/jeromegn/Backbone.localStorage/blob/master/backbone.localStorage.js
        function guid() {
            return (
                generate4HexDigits() +
                generate4HexDigits() + "-" +
                generate4HexDigits() + "-" +
                generate4HexDigits() + "-" +
                generate4HexDigits() + "-" +
                generate4HexDigits() +
                generate4HexDigits() +
                generate4HexDigits()
            );
        }

        var debounceCache = {};

        /**
         * write data to in url given file
         */
        function writeData(model, opts) {

            //set id if not set
            if (!model.id && model.id !== 0) {
                model.id = guid();
                model.set(model.idAttribute, model.id);
            }

            var modelData  = model.toJSON();
            var targetPath = model.url;

            if (model.collection) {
                targetPath = model.collection.url;
                modelData  = model.collection.toJSON();
            }

            // create debounce per targetPath
            if (!debounceCache[targetPath]) {
                debounceCache[targetPath] = debounce(Backbone.DrbxJs.writeFile, 200);
            }

            return debounceCache[targetPath](targetPath, JSON.stringify(modelData), opts)
                .then(function() {
                    delete debounceCache[targetPath];
                    return model.toJSON();
                })
                .catch(function(err) {
                    delete debounceCache[targetPath];
                    console.log(err);
                });
        }

        /**
         * read data from in url given file
         */
        function readData(model) {

            return Backbone.DrbxJs.readFile(model.url)
                .then(function(fileData) {
                    return JSON.parse(fileData);
                });
        }

        /**
         * delete a given model
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        function deleteData(model) {
            return Backbone.DrbxJs.remove(model.url);
        }


        /**
         * [_destroy description]
         * @type {[type]}
         */
        Backbone.Model.prototype.__destroy = Backbone.Model.prototype.destroy;
        Backbone.Model.prototype.destroy = function(opts) {
            var destroyResult = this.__destroy(opts);
            if (this.isNew()) {
                return Promise.resolve(destroyResult);
            }

            return destroyResult;
        };

        /**
         * [_remove description]
         * @type {[type]}
         */
        Backbone.Collection.prototype.__remove = Backbone.Collection.prototype.remove;
        Backbone.Collection.prototype.remove = function(models, opts) {

            var removeResult = this.__remove(models, opts);
            if (!removeResult) {
                return Promise.reject();
            }

            return Backbone.DrbxJs.writeFileDebounced(this.url, JSON.stringify(this.models), opts)
                .then(function() {
                    return removeResult;
                });
        };

        /**
         * [__reset description]
         * @type {[type]}
         */
        Backbone.Collection.prototype.__reset = Backbone.Collection.prototype.reset;
        Backbone.Collection.prototype.reset = function(models, opts) {

            var resetResult = this.__reset(models, opts);
            if (!resetResult) {
                return deleteData(this)
                    .then(function() {
                        return resetResult;
                    });
            }

            return Backbone.DrbxJs.writeFileDebounced(this.url, JSON.stringify(this.models), opts)
                .then(function() {
                    return resetResult;
                });
        };

        /**
         * replace sync function
         */
        Backbone.sync = function(method, model, opts) {

            opts = opts || {};
            if (opts.noDropbox && opts.noDropbox === true) {
                return Backbone.oldSync(method, model, opts);
            }

            var promise = null;
            switch(method) {

                case 'read': promise = readData(model); break;
                case 'create': promise = writeData(model); break;
                case 'update': promise = writeData(model); break;
                case 'delete': promise = deleteData(model); break;
            }

            return promise.then(function(drbxResponse) {
                if (opts && opts.success) opts.success(drbxResponse);
                model.trigger('request', model, promise, opts);
            });
        };

        module.exports = Backbone;

})();
