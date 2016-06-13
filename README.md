# OMA Lightweight M2M Arduino Client
## Overview
This application aims to provide a quick way to expose the inputs and outputs of an [Arduino](http://www.arduino.cc/) board connected
to an external PC (a raspberry PI or a laptop) through the [OMA Lightweight M2M](http://technical.openmobilealliance.org/Technical/technical-information/release-program/current-releases/oma-lightweightm2m-v1-0)
protocol with as little configuration as possible. The application is based in the [Lightweight M2M Node.js library](https://github.com/telefonicaid/iotagent-lwm2m-lib)
designed for [FIWARE's](http://www.fiware.org/) IoT Agents.

Whoever wants to use the library has to take some considerations into account:
* The library makes use of a LWM2M in its early stage that does not provide security (DTLS).
* This LWM2M client does not implement some of the standard OMA Objects yet.
* The objects are exposed with Object URI's selected by the user, making no check against the OMA Registry for their existence and
semantic validity.

This client has only been tested against the LWM2M server provided by the [Lightweight M2M Node.js library](https://github.com/telefonicaid/iotagent-lwm2m-lib)
for the moment, but we expect to be able to test it with real devices in the near future. The client has been tested with an
Arduino ONE, and has been executed in Raspbian and MacosX.

This application makes use of the excellent [Johnny five](https://github.com/rwaldron/johnny-five) library for the communication
with the Arduino boards.

## I/O Mapping
NOTE: The following mapping was selected without taking into account any existing efforts on standardized Arduino mappings for 
the OMA Registry.

The inputs and outputs for the Arduino Library are mapped into two instances a single Object: one instance for the analog I/O
and another one for the digital one. The Object ID of the object, as well as the Instance IDs for both instances can be configured
in the config file. For each instance, an attribute is created for each pin, assigning consecutive integer numbers as Resource IDs
(A0 to A5 mapping to the interval [0..5] andD0 to D15 mapping to the interval[0..15]).

## Installation
In order to use the application, you need to clone this Github repository:
```
git clone https://github.com/dmoranj/lwm2mArduino.git
```
and, from the root of the project, download its dependencies:
```
npm install
```
## Configuration
All the configuration information can be found in the `config.js` file in the project root.

### Server configuration
Connection data to the Lightweight M2M Server:
* `config.server.host`: hostname of the server.
* `config.server.port`: UDP port where the server is listening for new registrations.
* `config.server.path`: registration path ('/' for the standard path).

### Client configuration
Client configuration values:
* `config.client.endpoint`: endpoint name for the client.
* `config.client.port`: UDP port where the client will be listening for connections initiated by the server.
* `config.client.lifetime`: expected lifetime for the registration.
* `config.client.version`: Lightweight M2M Version to declare to the server.
* `config.client.observe.period`: frequency of updates sent to the server for every observed value.

### Mapping configuration
Configures how the Arduino PINs are mapped to Lightweight M2M Object URIs:
* `config.mapping.objectType`: Object ID for the Arduino Board.
* `config.mapping.analogInstance`: Instance ID for Arduino analog Inputs.
* `config.mapping.digitalInstance`: Instance ID for Arduino digital Inputs.

### Data Configuration
The following data-related values can be configured:
* `config.data.frequency`: polling frequency for the Arduino data. 
* `config.data.mapping`: list of pins used along with its type and possible transformation:
  * `id`: integer ID of the configured pin (mandatory).
  * `type`: type of pin; currently supported values are `analogSensor`, `digitalInput` and `motion` (mandatory).
  * `transform`: JavaScript expression that will be applied to the raw value of the pin before sending it (optional).

## Usage
In order to use the the LWM2 Arduino Client, from the project root, execute:
```
node lwm2m-arduino.js
```
The application will start in the foreground. To execute in the background (in Unix-based systems):
```
nohup node lwm2m-arduino.js &> arduino.log&
```

