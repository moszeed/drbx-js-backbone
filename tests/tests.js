(function() {

    "use strict";


    require('phantomjs-polyfill');
    require('es6-promise').polyfill();

    var test = require('tape');
    var Backbone = null;

    //set a generated dropbox token, from the developer console, here !
    var token = null;

    test('token check', function(t) {
        t.ok(token !== null, 'token is set');
        t.end();
    });

    //check if require works
    test('require', function(t) {

        try {
            Backbone = require('../src/drbx-js-backbone.js');
            t.ok(true, 'require finished');
            t.end();
        }
        catch(err) {
            t.end(err);
        }
    });


    test('initialize connection', function(t) {

        Backbone.init({ client: { token: token }})
            .then(function() {
                t.end();
            })
            .catch(t.end);
    });

    test('get login data', function(t) {

        Backbone.DrbxJs.accountInfo()
            .then(function(data) {
                t.ok(Object.keys(data).length !== 0, 'accountInfo response');
                t.end();
            })
            .catch(t.end);
    });


    /**
     *  Libary Tests
     */

    test('model.fetch ("not available")', function(t) {

        var Model = Backbone.Model.extend({
            url: '/test/model'
        });

        var newModelInstance = new Model();
            newModelInstance.fetch()
                .then(function() {
                    t.fail('there should be a 404');
                    t.end();
                })
                .catch(function() {
                    t.end();
                });
    });

    test('collection.fetch ("not available")', function(t) {

        var Collection = Backbone.Collection.extend({
            url: '/test/collection'
        });

        var newCollectionInstance = new Collection();
            newCollectionInstance.fetch()
                .then(function() {
                    t.fail('there should be a 404');
                    t.end();
                })
                .catch(function() {
                    t.end();
                });
    });



    test('model.save', function(t) {

        var Model = Backbone.Model.extend({
            url     : '/test/model',
            defaults: {}
        });

        var newModelInstance = new Model();
            newModelInstance.save({ test: 2 })
                .then(function() {
                    t.end();
                });
    });

    test('collection.create', function(t) {

        t.plan(11);

        var Model = Backbone.Model.extend({
            defaults: {
                test: 0
            }
        });

        var Collection = Backbone.Collection.extend({
            url  : '/test/collection',
            model: Model
        });

        var collectionInstance = new Collection();

            collectionInstance.on('update', function() {
                t.ok(true, 'update called');
            });

            collectionInstance.on('sync', function() {
                t.ok(true, 'sync called');
            });

            collectionInstance.create({ test: 1 });
            collectionInstance.create({ test: 2 });
            collectionInstance.create({ test: 3 });
            collectionInstance.create({ test: 4 });
            collectionInstance.create({ test: 5 });
            collectionInstance.create({ test: 6 });
            collectionInstance.create({ test: 7 });
            collectionInstance.create({ test: 8 });
            collectionInstance.create({ test: 9 });
            collectionInstance.create({ test: 10 });
    });

    test('model.fetch', function(t) {

        var Model = Backbone.Model.extend({
            url: '/test/model'
        });

        var newModelInstance = new Model();
            newModelInstance.on('sync', function() {
                t.notEqual(newModelInstance.defaults, newModelInstance.attributes, 'model data loaded');
                t.end();
            });

            newModelInstance.fetch()
                .catch(t.end);
    });

    test('collection.fetch', function(t) {

        var Collection = Backbone.Collection.extend({
            url: '/test/collection'
        });

        var newCollectionInstance = new Collection();
            newCollectionInstance.on('sync', function() {
                t.isEqual(newCollectionInstance.length, 10, 'all items saved in collection');
                t.end();
            });

            newCollectionInstance.fetch()
                .catch(t.end);
    });

    test('collection.create.change', function(t) {

        t.plan(2);

        var Collection = Backbone.Collection.extend({
            url: '/test/collection'
        });

        var collectionInstance = new Collection();
            collectionInstance.fetch()
                .then(function() {

                    var model = collectionInstance.create({ test: 11 });

                        model.listenTo(model, 'change', function() {
                            t.ok(true, 'change called');
                        });

                        model.listenTo(model, 'sync', function() {
                            t.ok(true, 'sync called');
                        });

                        model.save('test', '11_1');
                });
    });

    test('model.destroy', function(t) {

        t.plan(4);

        var Model = Backbone.Model.extend({
            url: '/test/model'
        });

        //destroy without id
        var newModelInstance = new Model();
            newModelInstance.destroy({
                success: function() {
                    t.ok(true, 'instant destroy (success param)');
                }
            })
            .then(function() {
                t.ok(true, 'instant destroy');
            });

        //destroy with id
        var fetchModelInstance = new Model();
            fetchModelInstance.fetch({
                success: function() {
                    t.ok(true, 'fetched destroy (success param)');
                }
            })
            .then(function() {

                fetchModelInstance.destroy()
                    .then(function() {
                        t.ok(true, 'fetched destroy');
                    });

            });
    });

    test('collection.remove', function(t) {

        t.plan(1);

        var Collection = Backbone.Collection.extend({
            url: '/test/collection'
        });

        var newCollectionInstance = new Collection();
            newCollectionInstance.fetch()
                .then(function() {

                    var model = newCollectionInstance.at(1);
                    newCollectionInstance.remove(model)
                        .then(function() {
                            t.ok(true, 'removed model from collection');
                        });
                });
    });

    test('collection.reset', function(t) {

        t.plan(2);

        var Collection = Backbone.Collection.extend({
            url: '/test/collection'
        });

        var newCollectionInstance = new Collection();
            newCollectionInstance.fetch()
                .then(function() {

                    newCollectionInstance.reset([
                        { "test": 11 },
                        { "test": 12 }
                    ])
                    .then(function() {
                        t.isEqual(newCollectionInstance.length, 2, 'reset happend');
                    })
                    .then(function() {

                        newCollectionInstance.reset()
                            .then(function() {
                                t.ok(true, 'reset (null)');
                            });
                    });

                });
    });

})();
