var five = require("johnny-five"),
    lwm2mClient = require('iotagent-lwm2m-lib').client,
    async = require('async'),
    apply = async.apply,
    config = require('./config'),
    globalDeviceInfo,
    board = new five.Board(),
    analogSensors = [];


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
    lwm2mClient.register(config.server.host, config.server.port, config.server.path, config.client.endpoint, function (error, deviceInfo) {
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

function createDataHandler(analogUri, i) {
    console.log('Creating handler for analog sensor on Object [%s] resource[%d]', analogUri, i);

    return function() {
        lwm2mClient.registry.setResource(analogUri, i, this.value, function (error) {
            if (error) {
                console.log('Error writting resource %s/%s: ', analogUri, i, error);
            }
        });
    };
}

board.on('ready', function() {
    var analogUri = '/' + config.mapping.objectType + '/' + config.mapping.analogInstance,
        digitalUri = '/' + config.mapping.objectType + '/' + config.mapping.digitalInstance,
        connectionFlow = [
            apply(lwm2mClient.registry.create, digitalUri),
            apply(lwm2mClient.registry.create, analogUri),
        ];

    for (var i = 0; i < 13; i++) {
        console.log('Creating handler for digital entries on Object [%s] resource[%d]', analogUri, i);

        connectionFlow.push(apply(lwm2mClient.registry.setResource, digitalUri, i, 9));
    }

    for (var i = 0; i < 6; i++) {
        var sensor = new five.Sensor({
            pin: "A" + i,
            freq: config.data.frequency
        });

        connectionFlow.push(apply(lwm2mClient.registry.setResource, analogUri, i, 9));

        analogSensors.push(sensor);
        sensor.on('data', createDataHandler(analogUri, i));
    }

    connectionFlow.push(apply(connect, config));

    async.series(connectionFlow, function (error) {
        if (error) {
            console.log('There was an error starting the server');
        } else {
            console.log('Server started succesfully');
        }
    });
});
