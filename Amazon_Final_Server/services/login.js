var mysql = require("./mysql");
var stateArray=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","AK","AL","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
var p;
var encryption =require("./encryption");

function validateSSNFormat(ssn){
	console.log("ssn::"+ssn);
	var checkValid = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
	if(checkValid.test(ssn)){
		return true;
	}
	else{
		return false;
	}

}

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

function handle_request(req, callback){
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);

	switch(operation){

	case "customerlogin" :
		customerlogin(message,callback);
		break;

	case "adminlogin" : 

		adminlogin(message,callback);
		break;

	case "farmerlogin" : 
		farmerlogin(message,callback);
		break;
		
	case "doFarmerSignUp":
		doFarmerSignUp(message,callback);
		break;

	case "doCustomerSignUp":
		doCustomerSignUp(message,callback);
		break;


	default : 
		callback({status : 400,message : "Bad Request"});
	}

}
function farmerlogin(msg, callback){
	var res = {};
	var getQuery="SELECT FARMER_ID,EMAIL_ID,APPROVED_FARMER FROM FARMER WHERE PASSWORD ='"+msg.password1+"' AND (FARMER_ID='"+msg.username+"' OR EMAIL_ID='"+msg.username+"');";
	mysql.fetchData(function(err, user){
		if (err) {
			throw err;
			return done(err);
		} else
		{

			if(user && user.length>0)
			{
				console.log("farmer login successful"+user);
				res.code=200;
				res.user=user;
				callback(null,res);
			}
			else{
				res.code=400;

				callback(null,res);
			}
		}
	},getQuery);
}
function customerlogin(msg, callback){
	var res = {};
	var getQuery="SELECT * FROM CUSTOMER WHERE PASSWORD='"+msg.password1+"' AND (CUST_ID='"+msg.username+"' OR EMAIL_ID='"+msg.username+"') AND STATUS='1';";
	mysql.fetchData(function(err, user){
		if (err) {
			throw err;
			return done(err);
		} else
		{

			if(user && user.length>0)
			{
				console.log("customer login successful"+user);
				res.code=200;
				res.user=user;
				callback(null,res);
			}
			else{
				res.code=400;

				callback(null,res);
			}
		}
	},getQuery);
}
function adminlogin(msg, callback){
	var res = {};
	var getQuery="SELECT * FROM ADMIN WHERE PASSWORD='"+msg.password1+"' AND (ADMIN_ID='"+msg.username+"' OR EMAIL_ID='"+msg.username+"');";
	mysql.fetchData(function(err, user){
		if (err) {
			throw err;
			return done(err);
		} else
		{

			if(user && user.length>0)
			{
				console.log("admin login successful"+user);
				res.code=200;
				res.user=user;
				callback(null,res);
			}
			else{
				res.code=400;

				callback(null,res);
			}
		}
	},getQuery);
}
function doFarmerSignUp(msg,callback){
	var res={};
	var firstName=msg.firstName;
	var lastName=msg.lastName;
	var address=msg.address;
	var city=msg.city;
	var state=msg.state;
	var zipCode=msg.zipCode;
	var phoneNumber=msg.phoneNumber;
	var emailId=msg.emailId;
	var password= msg.password;
	var farmerId=msg.farmerId;
	var getAnyExistingAccount= "SELECT * FROM FARMER WHERE EMAIL_ID='"+emailId+"' OR FARMER_ID='"+farmerId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if (results.length > 0) {
				res.value="ExistingEmail";
				callback(null,res);
			} else if (results.length === 0) {
				var isValidSSN=validateSSNFormat(farmerId);
				if(!isValidSSN){
					res.value="invalid_farmer_id";
					callback(null,res);
				}
				var isValidateState=validateState(state);
				if(!isValidateState){
					res.value="malformed_state";
					callback(null,res);
				}
				if(isValidSSN && isValidateState){
					//inserting the user's entry in database
					var encryptedPassword = encryption.encrypt(password);
					var insertValues={
							"FARMER_ID":farmerId,
							"FIRST_NAME":firstName,
							"LAST_NAME":lastName,
							"ADDRESS":address,
							"CITY":city,
							"STATE":state,
							"ZIP_CODE":zipCode,
							"PHONE":phoneNumber,
							"EMAIL_ID":emailId,
							"PASSWORD": encryptedPassword 
					};
					mysql.insertData("FARMER", insertValues, function(err,farmerSignUpInsertResult) {
						if (err) {
							throw err;
						} else {
							res.value="SuccesfullSignUp";
							callback(null,res);	
						}
					});
				}
			}
		}
	}, getAnyExistingAccount);	
}

function doCustomerSignUp(msg,callback){
	var firstName=msg.firstName;
	var lastName=msg.lastName;
	var address=msg.address;
	var city=msg.city;
	var state=msg.state;
	var zipCode=msg.zipCode;
	var phoneNumber=msg.phoneNumber;
	var emailId=msg.emailId;
	var password= msg.password;
	var ccNo=msg.ccNo;
	var ccv=msg.ccv;
	var ExpiryMonth=msg.ExpiryMonth;
	var ExpiryYear=msg.ExpiryYear;
	var customerId= msg.customerId;
	var res={};
	var getAnyExistingAccount= "SELECT * FROM CUSTOMER WHERE EMAIL_ID='"+emailId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if (results.length > 0) {
				res.value="ExistingEmail";
				callback(null,res);	
			} else if (results.length === 0) {
				var isValidSSN=validateSSNFormat(customerId);
				if(!isValidSSN){
					res.value="invalid_customer_id";
					callback(null,res);		
				}
				var isValidateState=validateState(state);
				if(!isValidateState){

					res.value="malformed_state";
					callback(null,res);	
				}
				if(isValidSSN && isValidateState){
					var encryptedPassword = encryption.encrypt(password);
					var insertValues={
							"CUST_ID":customerId,
							"FIRST_NAME":firstName,
							"LAST_NAME":lastName,
							"ADDRESS":address,
							"CITY":city,
							"STATE":state,
							"ZIP_CODE":zipCode,
							"PHONE":phoneNumber,
							"EMAIL_ID":emailId,
							"PASSWORD": encryptedPassword,
							"CC_NO":ccNo,
							"CC_CVV":ccv,
							"CC_EXP_MON":ExpiryMonth,
							"CC_EXP_YEAR":ExpiryYear
					};
					mysql.insertData("CUSTOMER", insertValues, function(err,farmerSignUpInsertResult) {
						if (err) {
							throw err;
						} else {
							res.value="SuccesfullSignUp";
							callback(null,res);		
						}
					});
				}
			}
		}
	}, getAnyExistingAccount);

}
exports.handle_request = handle_request;