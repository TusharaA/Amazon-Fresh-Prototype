/**
 * New node file
 */
var request = require('request')
, express = require('express')
,assert = require("assert")
,http = require("http");

describe('http tests', function(){
	
	it('Farmer should be able to login and see his/her profile page', function(done){
		request.post('http://localhost:3000/farmerLogin',
				{ form: { farmerId: '123-45-6789',password:'1234' } },
				function(error,response,body) {
					assert.equal(200, response.statusCode);
					done();
				})
			});
	
	it('Farmer should be able to see his/her profile page', function(done) {
		request.get('http://localhost:3000/farmerProfile',
				function (error, response, body) {
			//	console.log(JSON.stringify(response));
				assert.equal(200, response.statusCode);
				done();
			})
		});

	it('Customer should be able to login if the url is correct', function(done){
		request.post('http://localhost:3000/customerLogin',
				{ form: { customerId: 'siddharth6258@gmail.com',password:'1234' } },
				function(error,response,body) {
				//	console.log(JSON.stringify(response));
			assert.equal(200, response.statusCode);
			done();
		})
	});
	it('Customer should be able to see his/her profile page', function(done) {
		request.get('http://localhost:3000/customerProfile',
				function (error, response, body) {
				//console.log(JSON.stringify(response));
				assert.equal(200, response.statusCode);
				done();
			})
		});
	it('Admin should be able to login if the url is correct', function(done){
		request.post('http://localhost:3000/adminLogin',
				{ form: { adminId: 'admin@sjsu.com',password:'admin' } },
				function(error,response,body) {
				//	console.log(JSON.stringify(response));
			assert.equal(200, response.statusCode);
			done();
		})
	});
	it('Admin should be able to see pending Farmer requests for approval', function(done) {
		request.get('http://localhost:3000/farmerRequestList',
				function (error, response, body) {
				//console.log(JSON.stringify(response));
				assert.equal(200, response.statusCode);
				done();
			})
		});
	it('Admin should be able to see pending Customer requests for approval', function(done) {
		request.get('http://localhost:3000/customerRequestList',
				function (error, response, body) {
				//console.log(JSON.stringify(response));
				assert.equal(200, response.statusCode);
				done();
			})
		});
});