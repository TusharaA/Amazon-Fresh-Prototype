var mysql = require("./mysql");

function farmerRequestList(msg, callback){
	var res = {};
	console.log("In farmerRequestList handle request:"+ msg);
	var query="SELECT FARMER_ID,FIRST_NAME,LAST_NAME,EMAIL_ID FROM FARMER WHERE APPROVED_FARMER=false AND STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}
function aprroveFarmer(msg, callback){
	var res = {};
	var farmerEmailId = msg.farmerEmailId;
	var farmerId =msg.farmerId;
	console.log("In aprroveFarmer handle request:"+ msg);
	mysql.updateData("FARMER", {APPROVED_FARMER : true}, 
			{FARMER_ID : farmerId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"farmerApprovalStatus":"Approved"};
					res.code=200;
					res.result=json_response;
					callback(null,res);
				}
			});
}
function customerRequestList(msg, callback){
	var res = {};
	console.log("In customerRequestList handle request:"+ msg);
	var query="SELECT CUST_ID,FIRST_NAME,LAST_NAME,EMAIL_ID FROM CUSTOMER WHERE APPROVED_CUST=false and STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}
function approveCustomer(msg, callback){
	var res = {};
	var customerId =msg.customerId;
	console.log("In aprroveCustomer handle request:"+ msg);
	mysql.updateData("CUSTOMER", {APPROVED_CUST : true}, 
			{CUST_ID : customerId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"customerApprovalStatus":"Approved"};
					res.code=200;
					res.result=json_response;
					callback(null,res);
				}
			});
}
function productRequestList(msg, callback){
	var res = {};
	console.log("In productRequestList handle request:"+ msg);
	var query="SELECT PRODUCT_ID,FARMER_ID,PRODUCT_NAME FROM PRODUCT WHERE APPROVED_PRODUCT=false AND STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}
function approveProduct(msg, callback){
	var res = {};
	var productId =msg.productId;
	console.log("In approveProduct handle request:"+ msg);
	mysql.updateData("PRODUCT", {APPROVED_PRODUCT : true}, 
			{PRODUCT_ID : productId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"productApprovalStatus":"Approved"};
					res.code=200;
					res.result=json_response;
					callback(null,res);
				}
			});
}
function displayFarmerList(msg, callback){
	var res = {};
	console.log("In displayFarmerList handle request:"+ msg);
	var query = "SELECT FARMER_ID,FIRST_NAME,LAST_NAME,APPROVED_FARMER FROM FARMER WHERE STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}
function displayCustomerList(msg, callback){
	var res = {};
	console.log("In displayCustomerList handle request:"+ msg);
	var query = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,APPROVED_CUST FROM CUSTOMER WHERE STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}
function displayProductList(msg, callback){
	var res = {};
	console.log("In displayProductList handle request:"+ msg);
	var query = "SELECT PRODUCT_ID,PRODUCT_NAME,APPROVED_PRODUCT FROM PRODUCT WHERE STATUS='1';";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if(results && results.length>0)
			{
			     res.code=200;
			     console.log(results); 
				res.result=results;
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					res.result=results;
					callback(null,res);
					
				}
		}
	},query);
}


function handle_request(req, callback){
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);
	
	switch(req.operation){
	
	case "displayFarmerList" : 
		console.log("Inside switch:"+ req.operation);
		displayFarmerList(message,callback);
			break;
			
	case "displayCustomerList" : 
		console.log("Inside switch:"+ req.operation);
		displayCustomerList(message,callback);
			break;

	case "displayProductList" : 
		console.log("Inside switch:"+ req.operation);
		displayProductList(message,callback);
			break;
			
	case "farmerRequestList" : 
		console.log("Inside switch:"+ req.operation);
		farmerRequestList(message,callback);
			break;
			
	case "aprroveFarmer" : 	
		console.log("Inside switch:"+ req.operation);
		aprroveFarmer(message,callback);
		break;
		
	case "customerRequestList" : 
		console.log("Inside switch:"+ req.operation);
		customerRequestList(message,callback);
			break;	
			
	case "approveCustomer" : 	
		console.log("Inside switch:"+ req.operation);
		approveCustomer(message,callback);
		break;
		
	case "productRequestList" : 
		console.log("Inside switch:"+ req.operation);
		productRequestList(message,callback);
			break;
			
	case "approveProduct" : 
		approveProduct(message,callback);
		break;
	default : 
		callback({status : 400,message : "Bad Request"});
}
	
}

exports.handle_request = handle_request;