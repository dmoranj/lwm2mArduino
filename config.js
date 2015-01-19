var config = {};

config.server = {
    host: 'localhost',
    port: 60001,
    path: '/arduino'
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
    frequency: 3000
};

module.exports = config;