var should = require('should'); 
var assert = require('assert');
var request = require('supertest');


global.should = should;
global.assert = assert;
global.request = request;
//global.app = app;
process.env.NODE_ENV = 'test';