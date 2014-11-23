var five = require("johnny-five"),
    lwm2mClient = require('iotagent-lwm2m-lib').client,
    async = require('async'),
    apply = async.apply,
    config = require('./config'),
    globalDeviceInfo,
    board = new five.Board(),
    mapping = {
        objectType: 5,
        objectInstance: 1
    };


function handleWrite(objectType, objectId, resourceId, value, callback) {
    console.log('Value written:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Written value: %s', value);

    if (value == 0) {
        (new five.Led(resourceId)).off();
    } else {
        (new five.Led(resourceId)).on();
    }
    callback(null);
}

function handleRead(objectType, objectId, resourceId, value, callback) {
    console.log('Value read:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Read Value: %s', value);

    callback(null, value);
}

function setHandlers(deviceInfo) {
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'write', handleWrite);
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'read', handleRead);
}

function connect(config, callback) {
    console.log('Trying to connect to Lightweight M2M Server');
    lwm2mClient.register(config.server.host, config.server.port, config.client.endpoint, function (error, deviceInfo) {
        if (error) {
            console.log('Failed to connect');
            callback(error);
        } else {
            setHandlers(deviceInfo);
            globalDeviceInfo = deviceInfo;
            callback(null, deviceInfo);
        }
    });
}

board.on('ready', function() {
    var objUri = '/' + mapping.objectType + '/' + mapping.objectInstance,
        connectionFlow = [
            apply(connect, config),
            apply(lwm2mClient.registry.create, objUri)
        ];

    for (var i = 0; i < 13; i++) {
        connectionFlow.push(apply(lwm2mClient.registry.setAttribute, objUri, i, 0));
    }

    async.series(connectionFlow, function (error) {
        if (error) {
            console.log('There was an error starting the server');
        } else {
            console.log('Server started succesfully');
        }
    });
});
