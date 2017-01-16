
var amqp = require('amqp')
, util = require('util');

var mysql = require('./services/mysql');

var truckstatus = require('./services/truckstatus');
var billsearch = require('./services/billsearch');
var allstats=require('./services/allstats');
var login=require('./services/login');
var farmerProductModule = require('./services/farmerProductModule');
var customerProductModule = require('./services/customerProductModule');
var adminModule = require('./services/adminModule');
var customerProfileModule = require('./services/customerProfileModule');
var product = require('./services/product');
var admin=require('./services/admin');
var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
	mysql.createConnectionPool();

	
	cnn.queue('login_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			
			login.handle_request(message, function(err,res){
				console.log("inside  login_queue queue"+res.code);
				
				console.log("reqplying here"+m.replyTo);
			
				cnn.publish(m.replyTo, res, {
				
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});//closing of function login handle_req
			
		});//closing of subscribe
	});//closing f login queue
	
		
	cnn.queue('admin_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			
			admin.handle_request(message, function(err,res){
				console.log("inside  admin_queue queue"+res.code);
				
				console.log("reqplying here"+m.replyTo);
			
				cnn.publish(m.replyTo, res, {
				
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});//closing of function admin handle_req
			
		});//closing of subscribe
	});//closing of admin queue
	

	
	cnn.queue('allstats_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			
			allstats.handle_request(message, function(err,res){
				console.log("inside  allstats_queue queue"+res.code);
				
				console.log("reqplying here"+m.replyTo);
			
				cnn.publish(m.replyTo, res, {
				
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});//closing of function login handle_req
			
		});//closing of subscribe
	});//closing f login queue
	

	
	cnn.queue('billing_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			
			billsearch.handle_request(message, function(err,res){
				console.log("inside  cmodifytruckstatus queue"+res.code);
				
				console.log("reqplying here"+m.replyTo);
			
				cnn.publish(m.replyTo, res, {
				
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});//closing of function login handle_req
			
		});//closing of subscribe
	});//closing f login queue
	


	
	cnn.queue('truckstatus_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			
			truckstatus.handle_request(message, function(err,res){
				console.log("inside  truckstatus queue"+res.code);
				
				console.log("reqplying here"+m.replyTo);
			
				cnn.publish(m.replyTo, res, {
				
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});//closing of function login handle_req
			
		});//closing of subscribe
	});//closing f login queue
	
//tushara rabbitmq
	cnn.queue('farmer_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			switch(message.msgstatus) {
			
			case 'farmerAddProduct' : 
					farmerProductModule.addProduct(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;
			
			case 'farmerDeleteProduct' : 
					farmerProductModule.deleteProduct(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;	
					
			case 'farmerUpdateProduct' : 
					farmerProductModule.updateProduct(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
				});
				break;
				
		case 'farmerSearch' : 
					farmerProductModule.searchFarmer(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
			});
			break;
			
		case 'farmerProfile' : 
			farmerProductModule.viewFarmerProfile(message, function(err,res){
			//return index sent
			cnn.publish(m.replyTo, res, {
			contentType:'application/json',
			contentEncoding:'utf-8',
			correlationId:m.correlationId});
			});
			break;
		case "editFarmerInfo":
			farmerProductModule.editFarmerInfo(message, function(err,res){
				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
			});
			break;
		case "deleteFarmer":
			farmerProductModule.deleteFarmer(message, function(err,res){
				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
			});
			break;
			
		}			
		});
	});
	
	cnn.queue('customer_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			switch(message.msgstatus) {
			
			case 'customerSearchProduct' : 
					customerProductModule.searchProduct(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;
			
			case 'customerAddToCart' : 
					customerProductModule.updateProductQty(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;	
					
			case 'customerViewBill' : 
					customerProductModule.viewBill(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
				});
				break;
				
			case 'customerProfile' : 
				customerProfileModule.viewCustomerProfile(message, function(err,res){
				//return index sent
				cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId});
				});
				break;	
				
			case 'deleteCustomer':
				customerProductModule.deleteCustomer(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;	
			
		}			
		});
	});
	
	cnn.queue('admin_queue1', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			switch(message.msgstatus) {
			
			case 'adminReviewProduct' : 
					adminModule.reviewProduct(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;
			
			case 'adminReviewCustomer' : 
					adminModule.reviewCustomer(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId});
					});
					break;				
		}			
		});
	});
	
	

	cnn.queue('product_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			

			switch(message.operation) {
			case "viewIndividualProducts" : 
				product.viewIndividualProducts(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId});
				});
				break;
				
			case "addProductReview":
				product.addProductReview(message, function(err,res){
					//return index sent
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId});
				});
				break;
			}	
		});//closing of subscribe
	});//closing f login queue
});

