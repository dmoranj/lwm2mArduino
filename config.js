var config = {};

config.server = {
    host: 'leshan.eclipse.org',
    port: 5683,
    path: '/'
};

config.client = {
    endpoint: 'lwm2m-arduino',
    port: 5683,
    lifetime: '85671',
    version: '1.0',
    observe: {
        period: 3000
    }
};

config.mapping = {
    objectType: 5001,
    analogInstance: 1,
    digitalInstance: 2
};

config.data = {
    frequency: 1000,
    pinMap: [
        {
            id: 0,
            type: 'analogSensor'
        },
        {
            id: 1,
            type: 'analogSensor',
            transform: '(VALUE * 0.004882814 - 0.5) * 100'
        },
        {
            id: 4,
            type: 'motion'
        }
    ]
};

module.exports = config;
