var ejs= require("ejs");
var mysql=require('./mysql');
var encryption= require('./encryption');
var mq_client = require('../rpc/client');
var addToCartList = [];
var addToCartDisplay = [];
var fs = require('fs');
var displayProductInfo = '';
var redis = require('redis');
var client = redis.createClient(6379,'127.0.0.1');
client.on('connect', function() {
	console.log('Connected to Redis server');
});
var mongo= require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";
var stateArray=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","AK","AL","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
var p;
var loadCount=1;
var loadCountSearch = 1;
var loadCountFarmer = 1;

function validateSSNFormat(ssn){
	var checkValid = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
	if(checkValid.test(ssn)){
		return true;
	}
	else{
		return false;
	}

}
function dynamicPrice(req,res){
	var constant=1;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	today = mm+'-'+dd;
	var xmas='05-02';
	var new_year='01-01';
	var independence_day='07-04';

	if(today==xmas||today==new_year||today==independence_day){
		constant=constant*0.6;
		console.log("dates matched changing constant"+constant);
	}
	return constant;
};
Array.prototype.contains = function ( x ) {
	for (var i in this) {
		if (this[i] === x){ return true;}
	}
	return false;
};

function validateState(state){

	if(stateArray.contains(state)){

		return true;
	}else{

		return false;
	}
}

exports.doFarmerSignUp = function(req, res){
	var firstName=req.body.firstName;
	var lastName=req.body.lastName;
	var address=req.body.address;
	var city=req.body.city;
	var state=req.body.state;
	var zipCode=req.body.zipCode;
	var phoneNumber=req.body.phoneNumber;
	var emailId=req.body.emailId;
	var password= req.body.password;
	var farmerId=req.body.farmerId;
	var json_response;
	var msg_payload = {operation:"doFarmerSignUp",message:{"firstName":firstName,"lastName":lastName,"address":address,"city":city,"state":state,"zipCode":zipCode,"phoneNumber":phoneNumber,"emailId":emailId,"password":password,"farmerId":farmerId}};
	mq_client.make_request('login_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else{
			req.session.emailId=emailId;
			req.session.farmerId=farmerId;
			var json_response={"farmerSignupStatus":results.value};
			res.send(json_response);
		}
	});
};


exports.doCustomerSignUp = function(req, res){
	var firstName=req.body.firstName;
	var lastName=req.body.lastName;
	var address=req.body.address;
	var city=req.body.city;
	var state=req.body.state;
	var zipCode=req.body.zipCode;
	var phoneNumber=req.body.phoneNumber;
	var emailId=req.body.emailId;
	var password= req.body.password;
	var ccNo=req.body.ccNo;
	var ccv=req.body.ccv;
	var ExpiryMonth=req.body.ExpiryMonth;
	var ExpiryYear=req.body.ExpiryYear;
	var customerId= req.body.customerId;
	var json_response;
	var msg_payload = {operation:"doCustomerSignUp",message:{"firstName":firstName,"lastName":lastName,"address":address,"city":city,"state":state,"zipCode":zipCode,"phoneNumber":phoneNumber,"emailId":emailId,"password":password,"ccNo":ccNo,"ccv":ccv,"ExpiryMonth":ExpiryMonth,"ExpiryYear":ExpiryYear,"customerId":customerId}};
	mq_client.make_request('login_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else{
			req.session.emailId=emailId;
			req.session.customerId=customerId;
			var json_response={"customerSignupStatus":results.value};
			res.send(json_response);
		}
	});	
};

exports.doCustomerLogin = function(req, res){
	var customerId=req.body.customerId;
	var password=encryption.encrypt(req.body.password);
	var json_response;

	//var getAccountDetails= "SELECT APPROVED_CUST,EMAIL_ID,CUST_ID FROM CUSTOMER WHERE PASSWORD='"+password+"' AND CUST_ID='"+customerId+"' OR EMAIL_ID='"+customerId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, getAccountDetailsResult){
		if (err) {
			throw err;
		} else{
			if (getAccountDetailsResult.length > 0) {
				req.session.emailId=getAccountDetailsResult[0].EMAIL_ID;
				req.session.customerId=getAccountDetailsResult[0].CUST_ID;
				if(getAccountDetailsResult[0].APPROVED_CUST){
					json_response={"customerLoginStatus":"SuccesfulLogin"};
					res.send(json_response);
				}
				else{
					json_response={"customerLoginStatus":"pending"};
					res.send(json_response);
				}
			} else{
				json_response={"customerLoginStatus":"AccountDoesNtExist"};
				res.send(json_response);
			}
		}
	}, getAccountDetails);
};

exports.doFarmerLogin= function(req, res){
	var farmerId=req.body.farmerId;
	var password=encryption.encrypt(req.body.password);
	var json_response;


	var getAccountDetails= "SELECT FARMER_ID,EMAIL_ID,APPROVED_FARMER FROM FARMER WHERE PASSWORD ='"+password+"' AND FARMER_ID='"+farmerId+"' OR EMAIL_ID='"+farmerId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, getAccountDetailsResult){
		if (err) {
			throw err;
		} else{
			if (getAccountDetailsResult.length > 0) {
				req.session.emailId=getAccountDetailsResult[0].EMAIL_ID;
				req.session.farmerId=getAccountDetailsResult[0].FARMER_ID;
				if(getAccountDetailsResult[0].APPROVED_FARMER){
					json_response={"farmerLoginStatus":"SuccesfulLogin"};
					res.send(json_response);
				}
				else{
					json_response={"farmerLoginStatus":"pending"};
					res.send(json_response);
				}
			} else{
				json_response={"farmerLoginStatus":"AccountDoesNtExist"};
				res.send(json_response);
			}
		}
	}, getAccountDetails);
};

exports.editFarmerInfo=function(req,res){
	var firstName=req.body.firstName;
	var lastName=req.body.lastName;
	var address=req.body.address;
	var city=req.body.city;
	var state=req.body.state;
	var zipCode=req.body.zipCode;
	var phoneNumber=req.body.phoneNumber;
	var emailId=req.session.emailId;
	var farmerId=req.session.farmerId;
	if(req.session.emailId && req.session.farmerId){
		var msg_payload = {"msgstatus":"editFarmerInfo" ,"firstName":firstName,"lastName":lastName,"address":address,"city":city,"state":state,"zipCode":zipCode,"phoneNumber":phoneNumber,"emailId":emailId,"farmerId":farmerId};
		mq_client.make_request('farmer_queue',msg_payload, function(err,results){

			if(err){
				throw err;
			}
			else{
				var json_responses = {"editFarmerInfoStatus" : results.value};
				res.send(json_responses);
			}
		});
	}else{
		var json_responses = {"editFarmerInfoStatus" : "EditFarmerInfoFailed"};
		res.send(json_responses);
	}
};

exports.viewIndividualProducts = function(req,res) {
	var customerReviews="";
	var json_response;
	var productId = req.param("productId");
	var productName = req.param("productName");
	var productPrice = req.param("productPrice");
	var productQuantity = req.param("productQuantity");
	var productDescription = req.param("productDescription");
	var productCategory = req.param("productCategory");
	var productAvgRatings = req.param("productAvgRatings");
	var farmerId = req.param("farmerId");
	var imgpath=req.param("imgpath");
	displayProductInfo = {productId:productId,productName:productName,productPrice:productPrice,
			productQuantity:productQuantity,productDescription:productDescription,productCategory:productCategory,
			productAvgRatings:productAvgRatings,farmerId:farmerId,imgpath:imgpath};

	var msg_payload = {"operation":"viewIndividualProducts","productId":productId,"productName":productName,"productPrice":productPrice,"productQuantity":productQuantity,"productDescription":productDescription,"productCategory":productCategory,"productAvgRatings":productAvgRatings,"farmerId":farmerId,"imgpath":imgpath,"customerId":req.session.customerId};
	mq_client.make_request('product_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}else{
			displayProductInfo.AllowComment=results.AllowComment;
			displayProductInfo.customerReviews=results.customerReviews;
			json_response={"viewIndividualProductsStatus":results.viewIndividualProductsStatus};
			res.send(json_response);
		}
	});	
};

exports.displayProductInfo = function(req,res) {
	ejs.renderFile('./views/productInfo.ejs',{displayProductInfo:displayProductInfo},function(err, result) {
		if (!err) {
			res.end(result);
		}
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.doAdminLogin = function(req, res){
	var adminId=req.body.adminId;
	var password=encryption.encrypt(req.body.password);
	var json_response;

	var getAccountDetails= "SELECT * FROM ADMIN WHERE PASSWORD='"+password+"' AND ADMIN_ID='"+adminId+"' OR EMAIL_ID='"+adminId+"';";
	// checking for any existing admin account
	mysql.fetchData(function(err, getAccountDetailsResult){
		if (err) {
			throw err;
		} else{
			if (getAccountDetailsResult.length > 0) {
				req.session.emailId=getAccountDetailsResult[0].EMAIL_ID;
				req.session.adminId=getAccountDetailsResult[0].ADMIN_ID;
				json_response={"adminLoginStatus":"SuccesfulLogin"};
				res.send(json_response);
			} else{
				json_response={"adminLoginStatus":"AccountDoesNtExist"};
				res.send(json_response);
			}
		}
	}, getAccountDetails);
};

exports.displayAdminProfile=function(req,res){
	res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render("adminProfile");
};

exports.displayFarmerRequestsList=function(req,res){
	var msg_payload = { operation:"farmerRequestList",message:{"adminId": "123-45-6789"}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				var getPendingFarmerRequestResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("farmerApproval", {farmerRequestList:getPendingFarmerRequestResult});
			}

			else{
				var getPendingFarmerRequestResult=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("farmerApproval", {farmerRequestList:getPendingFarmerRequestResult});
			}
		}
	});
};

exports.customerRequestList=function(req,res){
	var msg_payload = { operation:"customerRequestList",message:{"adminId": "123-45-6789"}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				var getPendingCustomerRequestResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("customerApproval", {customerRequestList:getPendingCustomerRequestResult});
			}

			else{
				var getPendingCustomerRequestResult=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("customerApproval", {customerRequestList:getPendingCustomerRequestResult});
			}
		}
	});

};

exports.productRequestList=function(req,res){
	var msg_payload = { operation:"productRequestList",message:{"adminId": "123-45-6789"}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				var getPendingProductRequestResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("productApproval", {productRequestList:getPendingProductRequestResult});
			}

			else{
				var getPendingProductRequestResult=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("productApproval", {productRequestList:getPendingProductRequestResult});
			}
		}
	});
};

exports.approveFarmer=function(req,res){
	console.log("entering approve farmer");
	var farmerEmailId = req.body.farmerEmailId;
	var farmerId =req.body.farmerId;
	var msg_payload = { operation:"aprroveFarmer",message:{farmerEmailId: farmerEmailId,farmerId:farmerId}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else {
			if(results.code==200){
				var json_response = {"farmerApprovalStatus":"Approved","results":results}
				res.send(json_response);
			}
		}
	});

};
exports.approveProduct=function(req,res){
	var productId =req.body.productId;
	var msg_payload = { operation:"approveProduct",message:{productId: productId}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code===200){

				res.send(results.result);
			}
		}
	});
};
exports.approveCustomer=function(req,res){
	var customerId =req.body.customerId;
	var msg_payload = { operation:"approveCustomer",message:{customerId: customerId}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			console.log("approvecustomer::main.js::"+JSON.stringify(results));
			if(results.code===200){

				res.send(results.result);
			}
		}
	});
};




exports.deleteFarmer=function(req,res){
	var farmerId=req.session.farmerId;
	var json_response;
	var msg_payload = {msgstatus:"deleteFarmer","farmerId":farmerId};
	mq_client.make_request('farmer_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else{
			console.log("deleteFarmer::main.js:"+results.value);
			json_response={"deleteFarmerStatus":results.value};
			res.send(json_response);
		}
	});	
};

exports.deleteCustomer=function(req,res){
	var customerId=req.session.customerId;
	var json_response;
	var msg_payload = {msgstatus:"deleteCustomer",message:{"customerId":customerId}};
	mq_client.make_request('customer_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else{
			json_response={"deleteCustomerStatus":results.value};
			res.render("amazonLanding");
		}
	});	
};

exports.displayFarmerList=function(req,res){
	var msg_payload = { operation:"displayFarmerList",message:{"adminId": "123-45-6789"}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				var farmerListResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayFarmerList", {farmerList:farmerListResult});
			}

			else{
				var farmerListResult=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayFarmerList", {farmerList:farmerListResult});
			}
		}
	});
};

exports.displayCustomerList=function(req,res){
	var msg_payload = { operation:"displayCustomerList",message:{"adminId": "123-45-6789"}};
	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code===200){
				var getCustomerListResult=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayCustomerList", {customerList:getCustomerListResult});		
			}

			else{
				var getCustomerListResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayCustomerList", {customerList:getCustomerListResult});		
			}
		}
	});
};

exports.displayProductList=function(req,res){
	var msg_payload = { operation:"displayProductList",message:{"adminId": "123-45-6789"}};

	mq_client.make_request('admin_queue',msg_payload, function(err,results){

		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				var getProductListResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayProductList", {productList:getProductListResult});		
			}

			else{
				var getProductListResult=results.result;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayProductList", {productList:getProductListResult});		
			}
		}
	});
};


exports.addProductReview=function(req,res){
	var reviewComments =req.body.reviewComments;
	var productId=req.body.productId;
	var farmerId=req.body.farmerId;
	var rating =req.body.rating;
	var msg_payload = { operation:"addProductReview","reviewComments": reviewComments,"productId":productId,"farmerId":farmerId,"rating":rating,"firstName":req.session.firstName,"lastName":req.session.lastName};
	mq_client.make_request('product_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}else{
			res.send({"reviewPostStatus":results.value});

		}
	});	
};


exports.truckstatus=function(req,res){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	today = yyyy+'-'+mm+'-'+dd;
	console.log("todays date is"+today);
	//	var msg_payload = {operation : "signin",message : {username : username,password : password}};


	var msg_payload = { operation:"truckstatus",message:{today: today} };

	mq_client.make_request('truckstatus_queue',msg_payload, function(err,results){


		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200)
			{
				result=results.result;
				res.send(result);
			}
			else{

				res.send({code:400});
			}
		}
	});	


};
exports.modifytruckstatus=function(req,res){
	//
	var truck_id=req.param("TRUCK_ID");
	var driver_id=req.param("DRIVER_ID");

	var msg_payload = {operation:"modifytruckstatus",message:{"truck_id": truck_id,"driver_id":driver_id} };

	mq_client.make_request('truckstatus_queue',msg_payload, function(err,results){


		if(err){
			throw err;
			res.send({code:400});
		}
		else 
		{
			if(results.code==200)
			{

				res.send({code:200});
			}
			else
			{res.send({code:400});
			}
		}
	});	

};
exports.billsearch=function(req,res){

	var column=req.body.column;
	var value=req.body.value;

	var msg_payload = {operation:"billsearch", message:{"column": column,"value":value}};

	mq_client.make_request('billing_queue',msg_payload, function(err,results){


		if(err){
			throw err;
			res.send({code:400});
		}
		else 
		{
			if(results.code==200){
				result=results.result;
				res.send(result);
			}
			else{
				res.send({code:400});}
		}
	});	

}
exports.cancelorder=function(req,res)
{
	var billid=req.param("billid");

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	today = yyyy+'-'+mm+'-'+dd;

	var msg_payload = { operation:"cancelorder",message:{"billid": billid,"today":today}};

	mq_client.make_request('billing_queue',msg_payload, function(err,results){


		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				res.send({"code":200});
			}
			else{
				res.send({"code":400});
			}
		}
	});


};

exports.orderhistroy=function(req,res){
	var cust_id=req.session.customerId;

	var msg_payload = { operation:"orderhistroy",message:{"cust_id": cust_id} };

	mq_client.make_request('billing_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				result=results.result;
				res.send(result);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

};
function array_unique(arr) {
	var result = [];
	for (var i = 0; i < arr.length; i++) {
		if (result.indexOf(arr[i]) == -1) {
			result.push(arr[i]);
		}
	}
	return result;
}



exports.confirmcheckout= function(req,res){

	var cart=req.param("cart");
	var productid = [];
	var qty = [];
	var price = [];
	var amount= [];
	var constant=dynamicPrice();
	console.log("cart from main is"+cart);


	for(i=0;i<cart.length;i++){
		for(j=0;j<cart[i].productList.length;j++){
			productid.push(cart[i].productList[j].productId);
			qty.push(cart[i].productList[j].productQuantity);
			price.push(cart[i].productList[j].productPrice); 
		}
	};

	for(i=0;i<qty.length;i++){
		amount.push(qty[i]*price[i]*constant);
	}

	var custid=req.session.customerId;

	var deliverydate=req.param("date").substring(0,10);



	var msg_payload = {operation:"checkout", message:{"productid": productid ,"custid":custid,"deliverydate":deliverydate,"amount":amount,"qty":qty}};

	mq_client.make_request('billing_queue',msg_payload, function(err,results){


		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				res.send({code:200});
			}
			else{
				res.send({code:400});}
		}
	});	

};


exports.listtrips=function(req,res){
	/*var gettrips="SELECT * FROM TRIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("listtrips",{triplist:Result});
		}
	},gettrips);*/
	var msg_payload = { operation:"listtrips" };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{

			if(results.value=="200"){
				console.log(results.result);
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("listtrips",{triplist:results.result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
};

exports.tripmap=function(req,res)
{
	var tripid=req.param("tripId");
	var msg_payload = { operation:"tripmap",message:{"tripId":tripid} };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results);
				req.session.tripid=tripid;
				var json_response = {"Status":"Approved"};
				res.send(json_response);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
	/*var gettrip="SELECT * FROM TRIP WHERE TRIP_ID="+tripid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.tripid=tripid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);*/
};

exports.tripmaps=function(req,res){
	var tripid=req.session.tripid;
	var msg_payload = { operation:"tripmaps",message:{"tripId":tripid} };
	/*mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("tripmap",{trip:Result});
		}
	},gettrip);*/
	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss1"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results);
				res.render("tripmap",{trip:results.result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

}

exports.listalltrips=function(req,res){
	//var gettrips="SELECT * FROM TRIP";
	/*mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("listalltrips",{trip:Result});
		}
	},gettrips);*/
	var msg_payload = { operation:"listalltrips" };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("listalltrips",{trip:results.result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
};

exports.statspercustomer=function(req,res)
{
	/*var getcustomers="SELECT * FROM customer";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("statspercustomer",{cust:Result});
		}
	},getcustomers);*/
	var msg_payload = { operation:"statspercustomer" };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("statspercustomer",{cust:results.result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

};

exports.stattripcust=function(req,res)
{
	var custid=req.param("custid");
	var msg_payload = { operation:"stattripcust",message:{"custid":custid} };
	/*var gettrip="SELECT * FROM TRIP WHERE CUSTOMER_ID='"+custid+"';";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.scid=custid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);*/
	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				req.session.scid=custid;
				var json_response = {"Status":"Approved"};
				res.send(json_response);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

};

exports.cutstats=function(req,res)
{
	var custid=req.session.scid;
	/*var gettrip="SELECT count(*) as count,CUSTOMER_ID FROM TRIP WHERE CUSTOMER_ID='"+custid+"';";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("chartcustomer",{stat:Result});
		}
	},gettrip);
	 */

	var msg_payload = { operation:"cutstats",message:{"custid":custid} };
	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				res.render("chartcustomer",{stat:results.result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
}

exports.statsperdriver=function(req,res)
{
	var msg_payload = { operation:"statsperdriver" };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				Result=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("statsperdriver",{driver:Result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

}

exports.stattripdri=function (req,res)
{
	var driid=req.param("driid");
	/*var gettrip="SELECT * FROM TRIP WHERE DRIVER_ID="+driid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.drid=driid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);*/
	var msg_payload = { operation:"stattripdri",message:{"driid":driid} };
	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				req.session.driid=driid;
				var json_response = {"Status":"Approved"};
				res.send(json_response);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

}

exports.dristats=function(req,res){
	var drid=req.session.driid;
	var msg_payload = { operation:"dristats",message:{"drid": drid} };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				Result=results.result;
				res.render("chartdriver",{stat:Result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});



}

exports.statsperarea=function(req,res){

	var msg_payload = { operation:"statsperarea" };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				Result=results.result;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("statsperarea",{area:Result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
};

exports.stattriparea=function(req,res){
	var zip=req.param("zip");
	/*var gettrip="SELECT * FROM TRIP WHERE DROPOFF_ZIP="+zip+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.zip=zip;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);*/
	var msg_payload = { operation:"stattriparea",message:{"zip": zip} };
	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server iss"+results.value);
		if(err){
			throw err;
		}
		else 
		{
			console.log("in"+results.value);
			if(results.value=="200"){
				console.log(results.result);
				req.session.zip=zip;
				var json_response = {"Status":"Approved"};
				res.send(json_response);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});
};

exports.areastat=function(req,res){
	var zip=req.session.zip;
	var msg_payload = { operation:"areastat",message:{"zip": zip} };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				Result=results.result;
				res.render("chartarea",{stat:Result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});


};

exports.allareastat=function(req,res)
{var msg_payload = { operation:"allareastat" };

mq_client.make_request('allstats_queue',msg_payload, function(err,results){

	console.log("response from server is"+results.code);
	if(err){
		throw err;
	}
	else 
	{
		if(results.code==200){
			Result=results.result;
			res.render("chartallarea",{stat:Result});
		}

		else{
			console.log("No data found");
			res.send({code:400});
		}
	}
});

};
exports.logout = function(req,res) {
	req.session.destroy();
	res.redirect('/');
};

exports.revenuestat=function(req,res){
	var edate=req.param("edate");
	var sdate=req.param("sdate");;
	var msg_payload = { operation:"revenuestat",message:{"edate": edate,"sdate":sdate} };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				req.session.edate=edate;
				req.session.sdate=sdate;
				var json_response = {"Status":"Approved"};
				res.send(json_response);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

}

exports.revenuestats=function(req,res)
{
	var edate=req.session.edate;
	var sdate=req.session.sdate;
	var msg_payload = { operation:"revenuestats",message:{"edate": edate,"sdate":sdate} };

	mq_client.make_request('allstats_queue',msg_payload, function(err,results){

		console.log("response from server is"+results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code==200){
				Result=results.result;
				res.render("chartrevenue",{stat:Result});
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	});

};


//tushara rabbitmq
exports.addProduct = function(req,res) {
	var productName=req.param("productName");
	var productPrice=req.param("productPrice");
	var productDescription=req.param("productDescription");
	var productQuantity=req.param("productQuantity");
	var productCategory=req.param("productCategory");
	var msgstatus = "farmerAddProduct";
	var json_response;
	if(productQuantity % 1 == 0 && productQuantity > 0)  {
		var msg_payload = {"productName" : productName , "productPrice" : productPrice , "productDescription" : productDescription ,"productQuantity" : productQuantity , "productCategory" : productCategory , "farmerId" : req.session.farmerId , "p" : p , "msgstatus" : msgstatus };
		mq_client.make_request('farmer_queue',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					json_response = {"addProductStatus":200};
					res.send(json_response);
				}
			}
		});
	} else {
		json_response = {"addProductStatus":404};
		res.send(json_response);
	}
};

exports.upload=function(req,res){
	var tmp_path = req.files.upl.path;
	// set where the file should actually exists - in this case it is in the "images" directory
	var target_path = "./public/uploads/" + req.files.upl.name;	
	// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
		fs.unlink(tmp_path, function() {
			if (err) throw err;
			req.session.path=target_path;
			p='./uploads/' + req.files.upl.name;
			res.end('File uploaded to: ' + target_path + ' - ' + req.files.upl.size + ' bytes');
		});
		res.status(204).end();   
	});
};

exports.deleteProduct = function(req,res) {
	console.log("entering deleteProduct::main.js");
	var productId=req.param("productId");
	var msgstatus = "farmerDeleteProduct";
	var json_response;
	var msg_payload = {"productId" : productId , "msgstatus" : msgstatus };
	mq_client.make_request('farmer_queue',msg_payload, function(err,results){	
		if (err) {
			throw err;
		}
		else {
			console.log("entering deleteProduct::main.js response:"+results.value);
			if(results.value == "200") {
				
				json_response = {"deleteProductStatus":200};
				res.send(json_response);
			}
		}
	});
};

exports.updateProduct = function(req,res) {
	var productId=req.param("productId");
	var productName=req.param("productName");
	var productPrice=req.param("productPrice");
	var productDescription=req.param("productDescription");
	var productQuantity=req.param("productQuantity");
	var productCategory=req.param("productCategory");
	var msgstatus = "farmerUpdateProduct";
	var json_response;
	if(productQuantity % 1 === 0 && productQuantity > 0)  {
		var msg_payload = {"productId" : productId , "productName" : productName , "productPrice" : productPrice ,"productDescription" : productDescription , "productQuantity" : productQuantity , "productCategory" : productCategory , "msgstatus" : msgstatus };
		mq_client.make_request('farmer_queue',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					json_response = {"updateProductStatus":200};
					res.send(json_response);
				}
			}
		});
	} else {
		json_response = {"updateProductStatus":404};
		res.send(json_response);
	}
};
var searchString;
exports.searchProduct1 = function(req,res) {
	//searchString = req.body.searchString;
	var toDisplayInSearchProfile = {};
	var searchProductResults = {};
	var constant=dynamicPrice();
	var addToCartDisplayP = {};

	var msgstatus = "customerSearchProduct";

	if(searchString != '') {
		var msg_payload = {"searchString" : searchString , "msgstatus" : msgstatus };
		mq_client.make_request('customer_queue',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					console.log("+++++" +  results.productImageResult[0].imgpath);
					console.log("productImageResult +++++" +  results.productImageResult.length);
					console.log("searchProductResults +++++" +  results.searchProductResults.length);
					toDisplayInSearchProfile.productImageResult = results.productImageResult;
					toDisplayInSearchProfile.searchProductResults = results.searchProductResults;
					toDisplayInSearchProfile.addToCartDisplayP = addToCartDisplay;
					toDisplayInSearchProfile.loadCountSearch = loadCountSearch;
					toDisplayInSearchProfile.constant=constant;

					res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					res.render("searchProductProfile", toDisplayInSearchProfile);
				}
			}
		});
	} else {
		res.redirect('/customerProfile');
	}
};
exports.searchProduct = function(req,res) {
	searchString = req.body.searchString;
	var toDisplayInSearchProfile = {};
	var searchProductResults = {};
	var constant=dynamicPrice();
	var addToCartDisplayP = {};

	var msgstatus = "customerSearchProduct";

	if(searchString != '') {
		var msg_payload = {"searchString" : searchString , "msgstatus" : msgstatus };
		mq_client.make_request('customer_queue',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					console.log("+++++" +  results.productImageResult[0].imgpath);
					console.log("productImageResult +++++" +  results.productImageResult.length);
					console.log("searchProductResults +++++" +  results.searchProductResults.length);
					toDisplayInSearchProfile.productImageResult = results.productImageResult;
					toDisplayInSearchProfile.searchProductResults = results.searchProductResults;
					toDisplayInSearchProfile.addToCartDisplayP = addToCartDisplay;
					toDisplayInSearchProfile.loadCountSearch = loadCountSearch;
					toDisplayInSearchProfile.constant=constant;

					res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					res.render("searchProductProfile", toDisplayInSearchProfile);
				}
			}
		});
	} else {
		res.redirect('/customerProfile');
	}
};

function productList(farmerId) {	
	var returnProductList = null;
//	checking if farmerId already exists in addToCartList
	for(var i=0;i<addToCartList.length;i++) {
		var obj = addToCartList[i];
		if(farmerId === obj.farmerId) {
			returnProductList = obj.productList;
			break;
		}
	}	
	if (returnProductList === null) {
		returnProductList = [];
		var obj1 = {farmerId:farmerId, productList:returnProductList};
		addToCartList[addToCartList.length] = obj1;
	}	
	return returnProductList;
}

function addToProductList(farmerId, productId, productName, productPrice, productQuantity) {
	var prodList = productList(farmerId);
	var prodExisting = false;

	if (productQuantity > 0) {	
		for (var i=0;i<prodList.length;i++) {
			var obj = prodList[i];
			if(productId === obj.productId) {
				obj.productQuantity = obj.productQuantity + productQuantity;
				prodExisting = true;
				break;
			}
		}
		if (prodExisting === false) {
			prodList[prodList.length] = {productId:productId,productName:productName,productPrice:productPrice,productQuantity:productQuantity};	
		}
	}
}

exports.addCart = function(req,res) {
	var addProductBool = false;
	var productId = req.param("productId");
	var productName = req.param("productName");
	var productPrice = req.param("productPrice");
	var productQuantityProductId = req.param("productQuantity");
	var farmerId = req.param("farmerId");	
	var productQuantity = parseInt(productQuantityProductId.split(productId));
	var msgstatus = "customerAddToCart";
	var json_response;
	addToProductList(farmerId, productId, productName, productPrice, productQuantity);

	for(var i=0;i<addToCartDisplay.length;i++) {
		if(addToCartDisplay[i].productId === productId && addToCartDisplay[i].farmerId === farmerId){
			addToCartDisplay[i].productQuantity = productQuantity + addToCartDisplay[i].productQuantity;
			addProductBool = true;
			break;
		}
	}
	if(addProductBool === false) {
		addToCartDisplay[addToCartDisplay.length] = {productId:productId,productName:productName,productPrice:productPrice,productQuantity:productQuantity,farmerId:farmerId};
	}
	var msg_payload = {"productId" : productId , productQuantity : productQuantity , "msgstatus" : msgstatus };
	mq_client.make_request('customer_queue',msg_payload, function(err,results){	
		if (err) {
			throw err;
		}
		else {
			if(results.value == "200") {
				json_responses = {"addCartStatus" : 200,"addToCartDisplay":addToCartDisplay};
				res.send(json_responses);
			}
		}
	});


};

exports.viewBill = function(req,res) {	
	var constant=dynamicPrice();
	var cartProductIdList = [];
	var cartFarmerIdList = [];
	var totalBillAmt = [];
	var msgstatus = "customerViewBill";
	for(var i=0;i<addToCartList.length;i++) 
	{	cartFarmerIdList[cartFarmerIdList.length] = addToCartList[i].farmerId;
	totalBillAmt[i] = 0.0;
	for(var j=0;j<addToCartList[i].productList.length;j++) {
		cartProductIdList[cartProductIdList.length] = parseInt(addToCartList[i].productList[j].productId);
		totalBillAmt[i] = parseFloat(totalBillAmt[i]) + parseFloat(addToCartList[i].productList[j].productPrice)*parseFloat(addToCartList[i].productList[j].productQuantity);
	}}
	var msg_payload = {"cartProductIdList" : cartProductIdList , "cartFarmerIdList" : cartFarmerIdList , "customerId" : req.session.customerId , "msgstatus" : msgstatus };
	mq_client.make_request('customer_queue',msg_payload, function(err,results){	
		if (err) {
			throw err;
		}
		else {
			if(results.value == "200") {
				ejs.renderFile('./views/viewBill.ejs', {addToCart:addToCartList,totalBillAmt:totalBillAmt,constant:constant},function(err, result) {
					if (!err) {
						res.end(result);
					}
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
				//empty the cart
				addToCartList = [];
				addToCartDisplay = [];
			}
		}
	});
};

exports.getReviewProduct = function(req,res) {
	var productSearch = req.param("productSearch");
	var productSearchCriteria = req.param("productSearchCriteria");
	var json_response;
	var productResults = {};
	var msgstatus = "adminReviewProduct";
	if(productSearchCriteria != undefined) {
		var msg_payload = {"productSearch" : productSearch , "productSearchCriteria" : productSearchCriteria , "msgstatus" : msgstatus };
		mq_client.make_request('admin_queue1',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					console.log();
					json_response={"getReviewProductStatus":200,"productResults":results.productResults};
					res.send(json_response);
				} else if(results.value == '401') {
					json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
					res.send(json_response);
				}
			}
		});
	} else {
		json_response={"getReviewProductStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}	
};


exports.getReviewCustomer = function(req,res) {
	var customerSearch = req.param("customerSearch");
	var customerSearchCriteria = req.param("customerSearchCriteria");
	var json_response;
	var customerResults = {};
	var msgstatus = "adminReviewCustomer";
	if(customerSearchCriteria != undefined) {
		var msg_payload = {"customerSearch" : customerSearch , "customerSearchCriteria" : customerSearchCriteria , "msgstatus" : msgstatus };
		mq_client.make_request('admin_queue1',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					console.log();
					json_response={"getReviewCustomerStatus":200,"customerResults":results.customerResults};
					res.send(json_response);
				} else if(results.value == '401') {
					json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"0 Search Results"};
					res.send(json_response);
				}
			}
		});
	} else {
		var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}
};

exports.getReviewFarmer = function(req,res) {
	var farmerSearch = req.param("farmerSearch");
	var farmerSearchCriteria = req.param("farmerSearchCriteria");
	var json_response;
	var farmerResults = {};
	var msgstatus = "farmerSearch";
	if(farmerSearchCriteria !== undefined) {
		var msg_payload = {"farmerSearch" : farmerSearch , "farmerSearchCriteria" : farmerSearchCriteria , "msgstatus" : msgstatus };
		mq_client.make_request('farmer_queue',msg_payload, function(err,results){	
			if (err) {
				throw err;
			}
			else {
				if(results.value == "200") {
					console.log();
					json_response={"getReviewFarmerStatus":200,"farmerResults":results.farmerResults};
					res.send(json_response);
				} else if(results.value == '401') {
					json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
					res.send(json_response);
				}
			}
		});
	} else {
		var json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}	
};



exports.displayCustomerProfile=function(req,res){
	displayProductInfo = '';
	var productList = {};
	var productImageResult = {};
	var msgstatus = "customerProfile";
	var msg_payload = {"customerId" : req.session.customerId , "emailId" : req.session.emailId , "msgstatus" : msgstatus };
	mq_client.make_request('customer_queue',msg_payload, function(err,results){	
		if (err) {
			throw err;
		}
		else {
			if(results.value == "200") {
				req.session.customerId=results.customerId;
				req.session.firstName=results.firstName;
				req.session.lastName=results.lastName;
				req.session.address=results.address;
				req.session.city=results.city;
				req.session.state=results.state;
				req.session.zipCode=results.zipCode;
				req.session.phoneNumber=results.phoneNumber;

				var toDisplayInCustomerProfile={
						firstName:results.firstName,
						lastName:results.lastName,
						address:results.address,
						city:results.city,
						state:results.state,
						zipCode:results.zipCode,
						phoneNumber:results.phoneNumber	
				};
				var addToCartDisplayP = {};
				toDisplayInCustomerProfile.addToCartDisplayP = addToCartDisplay;
				toDisplayInCustomerProfile.productList=results.productList;
				toDisplayInCustomerProfile.constant=dynamicPrice();
				console.log("Dynamic Price Calculated "+toDisplayInCustomerProfile.constant);
				console.log("----" + results.productImageResult);
				toDisplayInCustomerProfile.productImageResult = results.productImageResult; 
				toDisplayInCustomerProfile.loadCount = loadCount;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("customerProfile", toDisplayInCustomerProfile);
			} else {
				ejs.renderFile('./views/customerSignUp.ejs', function(err, result) {
					if (!err) {
						res.end(result);
					}
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			}

		}
	});
};

exports.displayFarmerProfile=function(req,res){
	var msgstatus = "farmerProfile";
	var productList = {};
	var productImageResult = {};
	var path = '';
	var toDisplayInFarmerProfile = {};
	var msg_payload = {"farmerId" : req.session.farmerId	 , "emailId" : req.session.emailId , "msgstatus" : msgstatus };
	mq_client.make_request('farmer_queue',msg_payload, function(err,results){	
		if (err) {
			throw err;
		}
		else { 
			if(results.value == "200") {
				
				req.session.farmerId=results.farmerId;
				req.session.firstName=results.firstName;
				req.session.lastName=results.lastName;
				req.session.address=results.address;
				req.session.city=results.city;
				req.session.state=results.state;
				req.session.zipCode=results.zipCode;
				req.session.phoneNumber=results.phoneNumber;
				toDisplayInFarmerProfile={
						firstName:results.firstName,
						lastName:results.lastName,
						address:results.address,
						city:results.city,
						state:results.state,
						zipCode:results.zipCode,
						phoneNumber:results.phoneNumber,
						farmervideoResult:results.farmervideoResult
				};
				toDisplayInFarmerProfile.loadCountFarmer = loadCountFarmer;
				console.log("---" + results.productList);
				toDisplayInFarmerProfile.productList=results.productList;
				toDisplayInFarmerProfile.productImageResult = results.productImageResult;

				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("farmerProfile", toDisplayInFarmerProfile);
			} else {
				ejs.renderFile('./views/farmerSignUp.ejs', function(err, result) {
					if (!err) {
						res.end(result);
					}
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			}

		}
	});
};

exports.uploadvideo=function(req,res){
	//console.log(req); //form fields
	/* example output:
		{ title: 'abc' }
	 */
	console.log(req.files); //form files
	/* example output:
	            { fieldname: 'upl',
	              oristginalname: 'grumpy.png',
	              encoding: '7bit',
	              mimetype: 'image/png',
	              destination: './uploads/',
	              filename: '436ec561793aa4dc475a88e84776b1b9',
	              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
	              size: 277056 }
	 */
	var tmp_path = req.files.upl.path;
	// set where the file should actually exists - in this case it is in the "images" directory
	var target_path = "./public/uploads/" + req.files.upl.name;

	// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		console.log("aj1")
		// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
		fs.unlink(tmp_path, function() {
			if (err) throw err;


			//res.send('File uploaded to: ' + target_path + ' - ' + req.files.upl.size + ' bytes');

			//res.status(204).end();
			req.session.path=target_path;
			//p=target_path;
			p='./uploads/' + req.files.upl.name;
			console.log("p"+req.session.farmerId);
			mongo.connect(mongoURL, function(){
				var coll = mongo.collection('farmer');
				coll.insert({"farmerId":req.session.farmerId,"imgpath":p});
			});
			res.end('File uploaded to: ' + target_path + ' - ' + req.files.upl.size + ' bytes');


		});
		res.status(204).end();   
		//res.render('farmerProfile');
	});
};

exports.loadNext = function(req,res) {
	loadCount = req.param("loadCount");
	console.log("loadCount"+loadCount);
	var json_response = {"loadNextStatus":200};
	res.send(json_response);
}

exports.loadNextSearch = function(req,res) {
	loadCountSearch = req.param("loadCountSearch");
	console.log("loadCount"+loadCount);
	var json_response = {"loadNextSearchStatus":200};
	res.send(json_response);
}


exports.loadNextFarmer = function(req,res) {
	loadCountFarmer = req.param("loadCountFarmer");
	console.log("loadCount"+loadCount);
	var json_response = {"loadNextFarmerStatus":200};
	res.send(json_response);
}