var ejs= require("ejs");
var mysql=require('./mysql');
var encryption= require('./encryption');
var addToCartList = [];
var addToCartDisplay = [];
var displayProductInfo = '';
var mongo= require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";
var stateArray=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","AK","AL","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
var p;
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

function getProductList(req,res,toDisplayInFarmerProfile) {
	var productList = '';
	var getProductList1 = "SELECT PRODUCT_ID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_QTY,PRODUCT_DESCRIPTION,PROD_CAT,PRODUCT_AVG_RATINGS FROM PRODUCT WHERE FARMER_ID='" + req.session.farmerId + "' and APPROVED_PRODUCT='1';";
	mysql.fetchData(function(err, getProductList){
		if (err) {
			throw err;
		} else{
			if (getProductList.length > 0) {
				console.log("approved products");
				toDisplayInFarmerProfile.productList=getProductList;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("farmerProfile", toDisplayInFarmerProfile);
			} 
			else
			{
				toDisplayInFarmerProfile.productList='';
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("farmerProfile", toDisplayInFarmerProfile);
			}
		}
	}, getProductList1);
}

function getProductListCustomer(req,res,toDisplayInCustomerProfile) {

	var productList = '';
	//var getProductList = "SELECT PRODUCT_ID,FARMER_ID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_QTY,PRODUCT_DESCRIPTION,PRODUCT_AVG_RATINGS,PROD_CAT FROM PRODUCT WHERE APPROVED_PRODUCT='1';";
	var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,F.LAST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.PROD_CAT FROM PRODUCT P,FARMER F WHERE P.APPROVED_PRODUCT='1' AND F.FARMER_ID = P.FARMER_ID;";
	mysql.fetchData(function(err, getProductList){
		if (err) {
			throw err;
		} else{
			if (getProductList.length > 0) {
				toDisplayInCustomerProfile.productList=getProductList;
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("customerProfile", toDisplayInCustomerProfile);
			} 
			else
			{
				toDisplayInCustomerProfile.productList='';
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("customerProfile", toDisplayInCustomerProfile);
			}
		}
	}, getProductList);
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

	var getAnyExistingAccount= "SELECT * FROM FARMER WHERE EMAIL_ID='"+emailId+"' OR FARMER_ID='"+farmerId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if (results.length > 0) {
				json_response={"farmerSignupStatus":"ExistingEmail"};
				res.send(json_response);
			} else if (results.length === 0) {
				var isValidSSN=validateSSNFormat(farmerId);
				if(!isValidSSN){
					json_response={"farmerSignupStatus":"invalid_farmer_id"};
					res.send(json_response);	
				}
				var isValidateState=validateState(state);
				if(!isValidateState){

					json_response={"farmerSignupStatus":"malformed_state"};
					res.send(json_response);
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
							req.session.emailId=emailId;
							req.session.farmerId=farmerId;
							json_response={"farmerSignupStatus":"SuccesfullSignUp"};
							res.send(json_response);	
						}
					});
				}
			}
		}
	}, getAnyExistingAccount);
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

	var getAnyExistingAccount= "SELECT * FROM CUSTOMER WHERE EMAIL_ID='"+emailId+"';";
	// checking for any existing farmer account
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{
			if (results.length > 0) {
				json_response={"customerSignupStatus":"ExistingEmail"};
				res.send(json_response);
			} else if (results.length === 0) {
				var isValidSSN=validateSSNFormat(customerId);
				if(!isValidSSN){
					json_response={"customerSignupStatus":"invalid_customer_id"};
					res.send(json_response);	
				}
				var isValidateState=validateState(state);
				if(!isValidateState){

					json_response={"customerSignupStatus":"malformed_state"};
					res.send(json_response);
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
							req.session.emailId=emailId;
							req.session.customerId=customerId;
							var json_response={"customerSignupStatus":"SuccesfullSignUp"};
							res.send(json_response);	
						}
					});
				}
			}
		}
	}, getAnyExistingAccount);
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

exports.displayFarmerProfile=function(req,res){
	var getFarmerInfo="select * from FARMER where FARMER_ID='"+req.session.farmerId+"'OR EMAIL_ID='"+req.session.emailId+"';";
	mysql.fetchData(function(err, getFarmerInfoResult){
		if (err) {
			throw err;
		} else{
			if (getFarmerInfoResult.length > 0) {
				req.session.farmerId=getFarmerInfoResult[0].FARMER_ID;
				req.session.firstName=getFarmerInfoResult[0].FIRST_NAME;
				req.session.lastName=getFarmerInfoResult[0].LAST_NAME;
				req.session.address=getFarmerInfoResult[0].ADDRESS;
				req.session.city=getFarmerInfoResult[0].CITY;
				req.session.state=getFarmerInfoResult[0].STATE;
				req.session.zipCode=getFarmerInfoResult[0].ZIP_CODE;
				req.session.phoneNumber=getFarmerInfoResult[0].PHONE;

				var toDisplayInFarmerProfile={
						firstName:getFarmerInfoResult[0].FIRST_NAME,
						lastName:getFarmerInfoResult[0].LAST_NAME,
						address:getFarmerInfoResult[0].ADDRESS,
						city:getFarmerInfoResult[0].CITY,
						state:getFarmerInfoResult[0].STATE,
						zipCode:getFarmerInfoResult[0].ZIP_CODE,
						phoneNumber:getFarmerInfoResult[0].PHONE	
				};
				getProductList(req,res,toDisplayInFarmerProfile);
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
	}, getFarmerInfo);
};

exports.editFarmerInfo=function(req,res){
	console.log("entered editFarmerInfo");
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
		var insertValues={
				"FIRST_NAME":firstName,
				"LAST_NAME":lastName,
				"ADDRESS":address,
				"CITY":city,
				"STATE":state,
				"ZIP_CODE":zipCode,
				"PHONE":phoneNumber,
		};
		var primaryKeys ={
				"FARMER_ID": req.session.farmerId
		};
		mysql.updateData("FARMER", insertValues, primaryKeys, function(err, result) {
			if (err){
				throw err;
			}else{
				var json_responses = {"editFarmerInfoStatus" : "EditFarmerInfoSuccesful"};
				res.send(json_responses);
			}
		});
	}else{
		var json_responses = {"editFarmerInfoStatus" : "EditFarmerInfoFailed"};
		res.send(json_responses);
	}
};


exports.addProduct = function(req,res) {
	var productName=req.param("productName");
	var productPrice=req.param("productPrice");
	var productDescription=req.param("productDescription");
	var productQuantity=req.param("productQuantity");
	var productCategory=req.param("productCategory");
	if(productQuantity % 1 == 0 && productQuantity > 0)  {
		var productInfo = {FARMER_ID : req.session.farmerId,
				PRODUCT_NAME:productName,
				PRODUCT_PRICE:productPrice,
				PRODUCT_QTY:productQuantity,
				PRODUCT_DESCRIPTION:productDescription,
				PROD_CAT:productCategory};

		mysql.insertData("PRODUCT", productInfo, function(err, result) {
			if (err) {
				throw err;
			} else {
				var getProductId="SELECT PRODUCT_ID from PRODUCT where FARMER_ID='"+req.session.farmerId+"'AND PRODUCT_NAME='"+productName+"' AND PRODUCT_DESCRIPTION = '"+productDescription+"';";
				mysql.fetchData(function(err, getProductIdResult){
					if (err) {
						throw err;
					} else{
						if (getProductIdResult.length > 0) {
							var productId = getProductIdResult[0].PRODUCT_ID;
							mongo.connect(mongoURL, function(){
								var coll = mongo.collection('ProductReview');
								coll.insert({"productId":parseInt(productId),"customerReviews":[],"imgpath":p});
							});
						} 
					}
				}, getProductId);
				var json_response = {"addProductStatus":200};
				res.send(json_response);
			}
		});
	}
	else {
		var json_response = {"addProductStatus":404};
		res.send(json_response);
	}
};

exports.deleteProduct = function(req,res) {
	var productId=req.param("productId");
	mysql.deleteData("PRODUCT", 
			{PRODUCT_ID:productId} , function(err, result) {
				if (err) {
					throw err;
				} else {
					var json_response = {"deleteProductStatus":200};
					res.send(json_response);
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
	if(productQuantity % 1 === 0 && productQuantity > 0)  {
		mysql.updateData("PRODUCT", {PRODUCT_NAME : productName,PRODUCT_PRICE : productPrice,PRODUCT_DESCRIPTION : productDescription,PRODUCT_QTY : productQuantity,PROD_CAT : productCategory}, 
				{PRODUCT_ID : productId}, function(err, result) {
					if (err) {
						throw err;
					} else {
						var json_response = {"updateProductStatus":200};
						res.send(json_response);
					}
				});
	} else {
		var json_response = {"updateProductStatus":404};
		res.send(json_response);
	}
};

exports.displayCustomerProfile=function(req,res){
	displayProductInfo = '';
	var getCustomerInfo="select * from CUSTOMER where CUST_ID='"+req.session.customerId+"'OR EMAIL_ID='"+req.session.emailId+"';";
	mysql.fetchData(function(err, getCustomerInfoResult){
		if (err) {
			throw err;
		} else{
			if (getCustomerInfoResult.length > 0) {
				req.session.customerId=getCustomerInfoResult[0].CUST_ID;
				req.session.firstName=getCustomerInfoResult[0].FIRST_NAME;
				req.session.lastName=getCustomerInfoResult[0].LAST_NAME;
				req.session.address=getCustomerInfoResult[0].ADDRESS;
				req.session.city=getCustomerInfoResult[0].CITY;
				req.session.state=getCustomerInfoResult[0].STATE;
				req.session.zipCode=getCustomerInfoResult[0].ZIP_CODE;
				req.session.phoneNumber=getCustomerInfoResult[0].PHONE;

				var toDisplayInCustomerProfile={
						firstName:getCustomerInfoResult[0].FIRST_NAME,
						lastName:getCustomerInfoResult[0].LAST_NAME,
						address:getCustomerInfoResult[0].ADDRESS,
						city:getCustomerInfoResult[0].CITY,
						state:getCustomerInfoResult[0].STATE,
						zipCode:getCustomerInfoResult[0].ZIP_CODE,
						phoneNumber:getCustomerInfoResult[0].PHONE	
				};
				var addToCartDisplayP = '';
				toDisplayInCustomerProfile.addToCartDisplayP = addToCartDisplay;

				//res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				//res.render("customerProfile", toDisplayInCustomerProfile);
				getProductListCustomer(req,res,toDisplayInCustomerProfile);
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
	}, getCustomerInfo);
};


exports.searchProduct = function(req,res) {
	var searchString = req.body.searchString;
	var toDisplayInSearchProfile = '';

	var searchQuery = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS FROM PRODUCT P,FARMER F WHERE P.APPROVED_PRODUCT='1' AND P.PRODUCT_NAME LIKE '%"+searchString+"%' OR P.PROD_CAT LIKE '%"+searchString+"%' AND P.FARMER_ID = F.FARMER_ID";
	mysql.fetchData(function(err, searchProductResult) {
		if (err) {
			throw err;
		} else{
			var searchProductResults = '';
			toDisplayInSearchProfile = {searchProductResults:searchProductResult};
			var addToCartDisplayP = '';
			toDisplayInSearchProfile.addToCartDisplayP = addToCartDisplay;
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("searchProductProfile",toDisplayInSearchProfile );
		}		
	}, searchQuery);
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
	var getProductQuantity = "SELECT PRODUCT_QTY FROM PRODUCT WHERE PRODUCT_ID=" + productId + ";";
	mysql.fetchData(function(err, getProductQuantityResults) {
		if (err) {
			throw err;
		} else{
			var newProductQuantity = Number(getProductQuantityResults[0].PRODUCT_QTY) - Number(productQuantity);
			var insertValues={
					"PRODUCT_QTY":Number(newProductQuantity)
			};
			var primaryKeys ={
					"PRODUCT_ID": productId
			};
			mysql.updateData("PRODUCT", insertValues, primaryKeys, function(err, result) {
				if (err){
					throw err;
				}else{
					var json_responses = {"addCartStatus" : 200,"addToCartDisplay":addToCartDisplay};
					res.send(json_responses);
				}
			});			
		}		
	}, getProductQuantity);	

};


exports.viewBill = function(req,res) {	

	var cartProductIdList = [];
	var cartFarmerIdList = [];
	for(var i=0;i<addToCartList.length;i++) 
	{	cartFarmerIdList[cartFarmerIdList.length] = parseInt(addToCartList[i].farmerId);
	for(var j=0;j<addToCartList[i].productList.length;j++) 
	{
		cartProductIdList[cartProductIdList.length] = parseInt(addToCartList[i].productList[j].productId);
	}
	}
	console.log(cartProductIdList.length + "--" + cartFarmerIdList.length);
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('PurchaseHistory');
		coll.findOne({"customerId":req.session.customerId},{"_id":0},function(err, result) {
			if (err) {
				throw err;
			} else{						
				if(result){
					for(var j=0;j<cartProductIdList.length;j++) 
					{
						coll.update({'customerId':parseInt(req.session.customerId)},{$push:{products:cartProductIdList[j]}},function(err,addPurchaseHistory){});
					}
					for(var j=0;j<cartFarmerIdList.length;j++) 
					{
						coll.update({'customerId':parseInt(req.session.customerId)},{$push:{farmers:cartFarmerIdList[j]}},function(err,addPurchaseHistory){});
					}
					//	coll.update({'customerId':parseInt(req.session.customerId)},{$push:{products:cartProductIdList}},function(err,addPurchaseHistory){});
					//	coll.update({'customerId':parseInt(req.session.customerId)},{$push:{farmers:cartFarmerIdList}},function(err,addPurchaseHistory){});
				}else{
					coll.insert({"customerId":parseInt(req.session.customerId),"products":cartProductIdList,"farmers":cartFarmerIdList});
				}
				ejs.renderFile('./views/viewBill.ejs', {addToCart:addToCartList},function(err, result) {
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
		});
	});

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
	displayProductInfo = {productId:productId,productName:productName,productPrice:productPrice,
			productQuantity:productQuantity,productDescription:productDescription,productCategory:productCategory,
			productAvgRatings:productAvgRatings,farmerId:farmerId};
	var customerId=req.session.customerId;

	mongo.connect(mongoURL, function(){
		var collProductReview = mongo.collection('PurchaseHistory');
		collProductReview.findOne({"customerId":parseInt(customerId)},{"products":1,"_id":0},function(err,result){
			if (err) {
				throw err;
			} else{

				if(result && result.hasOwnProperty("products")){
					for(var i=0;i< result.products.length;i++){
						if(result.products[i]==productId){
							displayProductInfo.AllowComment=true;
							mongo.connect(mongoURL, function(){
								var collProductReview = mongo.collection('ProductReview');
								collProductReview.findOne({"productId":parseInt(productId)},{"customerReviews":1,"_id":0},function(err,reviewResult){
									if (err) {
										throw err;
									} else{

										displayProductInfo.customerReviews=reviewResult.customerReviews;
										json_response={"viewIndividualProductsStatus":200};
										res.send(json_response);



									}
								});
							});


						}
						else{
							displayProductInfo.AllowComment=false;
							mongo.connect(mongoURL, function(){
								var collProductReview = mongo.collection('ProductReview');
								collProductReview.findOne({"productId":parseInt(productId)},{"customerReviews":1,"_id":0},function(err,reviewResult){
									if (err) {
										throw err;
									} else{

										displayProductInfo.customerReviews=reviewResult.customerReviews;

										json_response={"viewIndividualProductsStatus":200};
										res.send(json_response);
									}
								});
							});


						}
					}
				}
			}
		});
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
	var getPendingFarmerRequest="SELECT FARMER_ID,FIRST_NAME,LAST_NAME,EMAIL_ID FROM FARMER WHERE APPROVED_FARMER=false;";
	mysql.fetchData(function(err, getPendingFarmerRequestResult){
		if (err) {
			throw err;
		} else{
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("farmerApproval", {farmerRequestList:getPendingFarmerRequestResult});
		}
	},getPendingFarmerRequest);
};

exports.customerRequestList=function(req,res){
	var getPendingCustomerRequest="SELECT CUST_ID,FIRST_NAME,LAST_NAME,EMAIL_ID FROM CUSTOMER WHERE APPROVED_CUST=false;";
	mysql.fetchData(function(err, getPendingCustomerRequestResult){
		if (err) {
			throw err;
		} else{
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("customerApproval", {customerRequestList:getPendingCustomerRequestResult});
		}
	},getPendingCustomerRequest);
};

exports.productRequestList=function(req,res){
	var getPendingProductRequest="SELECT PRODUCT_ID,FARMER_ID,PRODUCT_NAME FROM PRODUCT WHERE APPROVED_PRODUCT=false;";
	mysql.fetchData(function(err, getPendingProductRequestResult){
		if (err) {
			throw err;
		} else{
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("productApproval", {productRequestList:getPendingProductRequestResult});
		}
	},getPendingProductRequest);
};

exports.approveFarmer=function(req,res){
	var farmerEmailId = req.body.farmerEmailId;
	var farmerId =req.body.farmerId;
	mysql.updateData("FARMER", {APPROVED_FARMER : true}, 
			{FARMER_ID : farmerId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"farmerApprovalStatus":"Approved"};
					res.send(json_response);
				}
			});
};

exports.approveProduct=function(req,res){
	var productId =req.body.productId;
	mysql.updateData("PRODUCT", {APPROVED_PRODUCT : true}, 
			{PRODUCT_ID : productId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"productApprovalStatus":"Approved"};
					res.send(json_response);
				}
			});
};

exports.approveCustomer=function(req,res){
	var customerId =req.body.customerId;
	mysql.updateData("CUSTOMER", {APPROVED_CUST : true}, 
			{CUST_ID : customerId}, function(err, result) {
				if(err){	
					throw err;
				} else {
					var json_response = {"customerApprovalStatus":"Approved"};
					res.send(json_response);
				}
			});
};


exports.deleteFarmer=function(req,res){
	var farmerId=req.session.farmerId;
	mysql.deleteData("FARMER",{FARMER_ID : farmerId},function(err, result) {
		if (err) {
			throw err;
		} else {
			var json_response = {"deleteFarmerStatus":"deletedFarmer"};
			res.send(json_response);
		}
	});
};

exports.deleteCustomer=function(req,res){
	var customerId=req.session.customerId;
	mysql.deleteData("CUSTOMER",{CUST_ID : customerId},function(err, result) {
		if (err) {
			throw err;
		} else {
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("amazonLanding");
		}
	});
};

exports.displayFarmerList=function(req,res){
	var getFarmerList = "SELECT FARMER_ID,FIRST_NAME,LAST_NAME,APPROVED_FARMER FROM FARMER;";
	mysql.fetchData(function(err, farmerListResult){
		if (err) {
			throw err;
		} else{
			if (farmerListResult.length > 0) {
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayFarmerList", {farmerList:farmerListResult});		
			} 
		}
	}, getFarmerList);
};

exports.displayCustomerList=function(req,res){
	var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,APPROVED_CUST FROM CUSTOMER;";
	mysql.fetchData(function(err, getCustomerListResult){
		if (err) {
			throw err;
		} else{
			if (getCustomerListResult.length > 0) {
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayCustomerList", {customerList:getCustomerListResult});		
			} 
		}
	}, getCustomerList);
};

exports.displayProductList=function(req,res){
	var getProductList = "SELECT PRODUCT_ID,PRODUCT_NAME,APPROVED_PRODUCT FROM PRODUCT;";
	mysql.fetchData(function(err, getProductListResult){
		if (err) {
			throw err;
		} else{
			if (getProductListResult.length > 0) {
				res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("displayProductList", {productList:getProductListResult});		
			} 
		}
	}, getProductList);
};

exports.addProductReview=function(req,res){
	console.log("Entered addProductReview");
	var json_response;
	var reviewComments =req.body.reviewComments;
	var productId=req.body.productId;
	var farmerId=req.body.farmerId;
	var rating =req.body.rating;
	var getRatings = "SELECT PRODUCT_ID,PRODUCT_AVG_RATINGS,PRODUCT_TOT_POINTS,NoOfCustomersRated FROM PRODUCT WHERE PRODUCT_ID='"+productId+"';";
	mysql.fetchData(function(err, getRatingsResult){
		if (err) {
			throw err;
		} else{
			if (getRatingsResult.length > 0) {
				var NoOfCustomersRated =getRatingsResult[0].NoOfCustomersRated+1;
				var PRODUCT_TOT_POINTS =getRatingsResult[0].PRODUCT_TOT_POINTS+parseInt(rating);
				var PRODUCT_AVG_RATINGS=(PRODUCT_TOT_POINTS/NoOfCustomersRated).toFixed(1);
				var insertValues={
						NoOfCustomersRated :NoOfCustomersRated,
						PRODUCT_TOT_POINTS :PRODUCT_TOT_POINTS,
						PRODUCT_AVG_RATINGS:PRODUCT_AVG_RATINGS
				};
				var primaryKeys ={
						"PRODUCT_ID": productId
				};
				mysql.updateData("PRODUCT", insertValues, primaryKeys, function(err, result) {
					if (err){
						throw err;
					}else{
						mongo.connect(mongoURL, function(){
							var collProductReview = mongo.collection('ProductReview');
							collProductReview.find({"productId":parseInt(productId)},function(err,result){
								if (err) {
									throw err;
								} else{
									if(result){
										collProductReview.update({'productId':parseInt(productId)},{$push:{customerReviews:{"firstName":req.session.firstName,"lastName":req.session.lastName,"Review":reviewComments,"Rating":rating}}},function(err,addPoductReview){});
										res.send({"reviewPostStatus":"PostedReview"});
									}
								}
							});
						});
					}
				});
			} 
		}
	}, getRatings);
};
exports.getReviewProduct = function(req,res) {
	var productSearch = req.param("productSearch");
	var productSearchCriteria = req.param("productSearchCriteria");
	if(productSearchCriteria != undefined) {
		if(productSearch == 'productName') {

			var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE P.PRODUCT_NAME LIKE '%"+productSearchCriteria+"%' AND P.FARMER_ID = F.FARMER_ID";
			mysql.fetchData(function(err, productResults){
				if (err) {
					throw err;
				} else{
					if (productResults.length > 0) {
						var json_response={"getReviewProductStatus":200,"productResults":productResults};
						res.send(json_response);
					} else if (productResults.length === 0) {
						var json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getProductList);			
		} else if(productSearch == 'productCategory') {

			var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE P.PROD_CAT LIKE '%"+productSearchCriteria+"%' AND P.FARMER_ID = F.FARMER_ID";
			mysql.fetchData(function(err, productResults){
				if (err) {
					throw err;
				} else{
					if (productResults.length > 0) {
						var json_response={"getReviewProductStatus":200,"productResults":productResults};
						res.send(json_response);
					} else if (productResults.length === 0) {
						var json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getProductList);			
		} else if(productSearch == 'farmerName') {

			var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE F.FIRST_NAME LIKE '%"+productSearchCriteria+"%' OR F.LAST_NAME LIKE '%"+productSearchCriteria+"%' AND P.FARMER_ID = F.FARMER_ID";
			mysql.fetchData(function(err, productResults){
				if (err) {
					throw err;
				} else{
					if (productResults.length > 0) {
						var json_response={"getReviewProductStatus":200,"productResults":productResults};
						res.send(json_response);
					} else if (productResults.length === 0) {
						var json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getProductList);			
		} else if(productSearch == 'farmerId') {

			var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE P.FARMER_ID = '"+productSearchCriteria+"' AND P.FARMER_ID = F.FARMER_ID";
			mysql.fetchData(function(err, productResults){
				if (err) {
					throw err;
				} else{
					if (productResults.length > 0) {
						var json_response={"getReviewProductStatus":200,"productResults":productResults};
						res.send(json_response);
					} else if (productResults.length === 0) {
						var json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getProductList);			
		} else if(productSearch == 'productAvgRatings') {

			var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE P.PRODUCT_AVG_RATINGS = "+productSearchCriteria+" AND P.FARMER_ID = F.FARMER_ID";
			mysql.fetchData(function(err, productResults){
				if (err) {
					throw err;
				} else{
					if (productResults.length > 0) {
						var json_response={"getReviewProductStatus":200,"productResults":productResults};
						res.send(json_response);
					} else if (productResults.length === 0) {
						var json_response={"getReviewProductStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getProductList);			
		}
	}
	else {
		console.log("Entered");
		var json_response={"getReviewProductStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}		
};


exports.getReviewCustomer = function(req,res) {
	var customerSearch = req.param("customerSearch");
	var customerSearchCriteria = req.param("customerSearchCriteria");
	if(customerSearchCriteria != undefined) {
		if(customerSearch == 'customerFirstName') {

			var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,ADDRESS,CITY,STATE,PHONE,EMAIL_ID,APPROVED_CUST FROM CUSTOMER WHERE FIRST_NAME LIKE '%"+customerSearchCriteria+"%'";
			mysql.fetchData(function(err, customerResults){
				if (err) {
					throw err;
				} else{
					if (customerResults.length > 0) {
						var json_response={"getReviewCustomerStatus":200,"customerResults":customerResults};
						res.send(json_response);
					} else if (customerResults.length === 0) {
						var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getCustomerList);			
		} else if(customerSearch == 'customerLastName') {

			var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,ADDRESS,CITY,STATE,PHONE,EMAIL_ID,APPROVED_CUST FROM CUSTOMER WHERE LAST_NAME LIKE '%"+customerSearchCriteria+"%'";
			mysql.fetchData(function(err, customerResults){
				if (err) {
					throw err;
				} else{
					if (customerResults.length > 0) {
						var json_response={"getReviewCustomerStatus":200,"customerResults":customerResults};
						res.send(json_response);
					} else if (customerResults.length === 0) {
						var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getCustomerList);				
		} else if(customerSearch == 'customerCity') {
			var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,ADDRESS,CITY,STATE,PHONE,EMAIL_ID,APPROVED_CUST FROM CUSTOMER WHERE CITY LIKE '%"+customerSearchCriteria+"%'";
			mysql.fetchData(function(err, customerResults){
				if (err) {
					throw err;
				} else{
					if (customerResults.length > 0) {
						var json_response={"getReviewCustomerStatus":200,"customerResults":customerResults};
						res.send(json_response);
					} else if (customerResults.length === 0) {
						var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getCustomerList);			
		} else if(customerSearch == 'customerState') {

			var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,ADDRESS,CITY,STATE,PHONE,EMAIL_ID,APPROVED_CUST FROM CUSTOMER WHERE STATE LIKE '%"+customerSearchCriteria+"%'";
			mysql.fetchData(function(err, customerResults){
				if (err) {
					throw err;
				} else{
					if (customerResults.length > 0) {
						var json_response={"getReviewCustomerStatus":200,"customerResults":customerResults};
						res.send(json_response);
					} else if (customerResults.length === 0) {
						var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getCustomerList);			
		} 
	}
	else {
		var json_response={"getReviewCustomerStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}		
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

	var getQuery="select tr.TRUCK_ID,tr.DRIVER_ID,t.DELIVERY_DATE,tr.STATUS FROM trucks tr, trip t where tr.TRUCK_ID=t.TRUCK_ID and tr.DRIVER_ID=t.DRIVER_ID and tr.status='Unavailable'  and t.DELIVERY_DATE > '"+today+"' GROUP BY tr.TRUCK_ID,tr.DRIVER_ID,t.DELIVERY_DATE,tr.STATUS";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else
		{


			if(results && results.length>0)
			{
				console.log("truck status data found"+results[0]);
				var result={server_result:results,code:200}
				res.send(result);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}

	},getQuery);

};
exports.modifytruckstatus=function(req,res){

	var truck_id=req.param("TRUCK_ID");
	var driver_id=req.param("DRIVER_ID");
	console.log(" truck status function called"+truck_id);
	console.log(" truck status function called"+driver_id);
	var query="UPDATE `amazon`.`trucks` SET `STATUS`='Available' WHERE `TRUCK_ID`='"+truck_id+"' and `DRIVER_ID`='"+driver_id+"'";
	mysql.fetchData(function(err, results){
		if(err)
		{throw err;
		res.send({code:400});
		}
		else{
			console.log("update successful");
			res.send({code:200});
		}
	},query);
};
exports.billsearch=function(req,res){

	var column=req.body.column;
	var value=req.body.value;
	console.log("Inside bill search"+column);
	console.log("Inside bill search"+value);
	var getQuery="select * from amazon.billing where "+column+"='"+value+"'";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
			res.send({code:400});
		} 
		else
		{
			if(results && results.length>0){

				var result={server_result:results,code:200}
				res.send(result);
			}
			else{
				res.send({code:400});
			}
		}

	},getQuery);
}
exports.cancelorder=function(req,res)
{
	var billid=req.param("billid");
	console.log("order is being cancelled"+billid);
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
	console.log("todays date is"+today);

	var query0="select * from `amazon`.`billing` WHERE `BILLING_ID`='"+billid+"' and EXPCTD_DELIVERY_DATE >'"+today+"' ";
	mysql.fetchData(function(err, results){
		if (err) 
		{
			throw err;
		} 
		else
		{
			if(results && results.length>0)
			{
				var product_id=results[0].PRODUCT_ID;
				console.log("product id is"+product_id);
				var qty=results[0].QUANTITY;
				console.log("QUANTITY OF PRODUCTS is"+qty);
				var query01="select DRIVER_ID,TRUCK_ID from trip where BILLING_ID='"+billid+"'";
				mysql.fetchData(function(err, result01){
					if (err) {
						throw err;
					} else
					{
						if(result01 && result01.length>0)
						{
							var truck_id=result01[0].TRUCK_ID;
							var driver_id=result01[0].DRIVER_ID;
							console.log("driver id has been found for that trip"+driver_id);
							console.log("truck id has been found for that trip"+truck_id);
							var query="DELETE FROM `amazon`.`billing` WHERE `BILLING_ID`='"+billid+"'";
							mysql.fetchData(function(err, result){
								if (err) {
									throw err;
								} else
								{
									console.log("result of delete query from bill is");

									var query1="UPDATE `amazon`.`trucks` SET `STATUS`='Available' WHERE `TRUCK_ID`='"+truck_id+"' and `DRIVER_ID`='"+driver_id+"'";
									mysql.fetchData(function(err, result02){
										if (err) {
											throw err;
										} else
										{
											console.log("truck status has been updated");
											// change the inventory now
											var query2="UPDATE `amazon`.`product` SET `PRODUCT_QTY`=`PRODUCT_QTY`+"+Number(qty)+" WHERE `PRODUCT_ID`='"+product_id+"'";
											mysql.fetchData(function(err, result02){
												if (err) {
													throw err;
												} else
												{
													res.send({"code":200});
												}
											},query2);

										}
									},query1);
								}
							},query);
						}
						else
						{
							console.log("no truck id or driver id found");
							res.send({"code":400});	
						}

					}
				},query01);
			}
			else
			{
				console.log("bill can not be deleted");
				res.send({"code":400});	
			}

		}

	},query0);
};
exports.orderhistroy=function(req,res){
	var cust_id=req.param("custid");
	console.log("Inside order histroy function"+cust_id);
	var query="select * from billing where CUSTOMER_ID='"+cust_id+"' order by EXPCTD_DELIVERY_DATE"; 
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		}
		else
		{
			if(results && results.length>0)
			{

				var result={server_result:results,code:200}
				res.send(result);
			}

			else{
				console.log("No data found");
				res.send({code:400});
			}
		}
	},query);
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
function fetchBillid(noOfFarmers,deliverydate,source_add,source_city,source_zip,productid,driver_id,truck_id,amount,source_add_prod,source_city_prod,source_zipcode_prod,dest_add,dest_city,dest_zip,custid,qty){
	var query6= "Select max(BILLING_ID) as BILLING_ID from BILLING";
	var billingID;
	mysql.fetchData(function(err, results){
		if (err) 
		{
			throw err;
		} 
		else{
			console.log("Max Bill ID from Billing table fetched successfully");
			var billingID=results[0].BILLING_ID +1;
			console.log("New generated billing id is:" +billingID);
			createBill(billingID,deliverydate,productid,amount,source_add_prod,source_city_prod,source_zipcode_prod,dest_add,dest_city,dest_zip,custid,qty);
			createTrip(noOfFarmers,deliverydate,source_add,source_city,source_zip,driver_id,truck_id,dest_add,dest_city,dest_zip,custid,billingID);
		}
	},query6);
}
function createTrip(noOfFarmers,deliverydate,source_add,source_city,source_zip,driver_id,truck_id,dest_add,dest_city,dest_zip,custid,billingID){
	for(i=0;i<noOfFarmers.length;i++){
		var query4= "insert into trip(PICKUP_ADDRESS,PICKUP_CITY,PICKUP_ZIP,DROPOFF_ADDRESS,DROPOFF_CITY,DROPOFF_ZIP,DELIVERY_DATE,CUSTOMER_ID,DRIVER_ID,TRUCK_ID,BILLING_ID) " +
		"values ('"+source_add[i]+"','"+source_city[i]+"','"+source_zip[i]+"','"+dest_add+"','"+dest_city+"','"+dest_zip+"','"+deliverydate+"','"+custid+"','"+driver_id[i]+"','"+truck_id[i]+"','"+billingID+"')";

		mysql.insertData1(function(err, results){
			if (err) 
			{
				throw err;
				res.send({code:400});
			} 
			else{
				console.log("value successfully inserted in trip table");}
		},query4);}
}
function createBill(billingid,deliverydate,productid,amount,source_add_prod,source_city_prod,source_zipcode_prod,dest_add,dest_city,dest_zip,custid,qty){
	for(i=0;i<productid.length;i++){

		console.log("Bill ID before inserting data in BILLING table" +billingid)
		var query3= "insert into billing(`BILLING_ID`,`EXPCTD_DELIVERY_DATE`,`PRODUCT_ID`,`TOTAL_AMOUNT`,`SOURCE_ADDRESS`,`SOURCE_CITY`,`SOURCE_ZIP`,`DESTINATION_ADDRESS`,`DESTINATION_CITY`,`DESTINATION_ZIP`,`DRIVER_ID`,`CUSTOMER_ID`,`QUANTITY`) " +
		"values ('"+billingid+"','"+deliverydate+"', '"+productid[i]+"','"+amount[i]+"','"+source_add_prod[i]+"','"+source_city_prod[i]+"','"+source_zipcode_prod[i]+"','"+dest_add+"','"+dest_city+"','"+dest_zip+"','300000000','"+custid+"','"+qty[i]+"')";
		mysql.insertData1(function(err, results){
			if (err) 
			{
				throw err;
			} 
			else{console.log("value successfully inserted");}
		},query3);}
}

exports.confirmcheckout= function(req,res){

	var cart=req.param("cart");
	var productid = [];
	var qty = [];
	var price = [];
	var amount= [];
	console.log("cart from main is"+cart);
	for(i=0;i<cart.length;i++){
		for(j=0;j<cart[i].productList.length;j++){
			productid.push(cart[i].productList[j].productId);
			qty.push(cart[i].productList[j].productQuantity);
			price.push(cart[i].productList[j].productPrice); 
		}
	};
	for(i=0;i<qty.length;i++){
		amount.push(qty[i]*price[i]);
	}
	console.log("productid array " + JSON.stringify(productid));
	console.log("product price " + JSON.stringify(price));
	console.log("product qty " + JSON.stringify(qty));
	console.log("product amount " + JSON.stringify(amount));
	var custid=req.session.customerId;
	console.log("customerId is "+custid);
	var deliverydate=req.param("date").substring(0,10);

	console.log("delivery date is"+deliverydate);


	var getQuery="select p.FARMER_ID,p.PRODUCT_ID,f.ADDRESS,f.CITY,f.ZIP_CODE " +
	"from product p,farmer f " +
	"where p.PRODUCT_ID in ("+productid.join()+")"  +
	"and p.FARMER_ID=f.FARMER_ID";

	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else{

			console.log("query is"+getQuery);
			var farmerid= [];
			var noOfFarmers= [];
			var source_add= [];
			var source_add_prod= [];
			var source_city= [];
			var source_city_prod= [];
			var source_zip= [];
			var source_zipcode_prod= [];

			for(i=0;i<results.length;i++)
			{
				farmerid[i]=results[i].FARMER_ID;
				source_add_prod[i]=results[i].ADDRESS;
				source_city_prod[i]=results[i].CITY;
				source_zipcode_prod[i]=results[i].ZIP_CODE;
			}
			var noOfFarmers = array_unique(farmerid);
			console.log("noOfFarmers "+noOfFarmers.length);
			var query="select f.FARMER_ID,f.ADDRESS,f.CITY,f.ZIP_CODE from farmer f where FARMER_ID in('"+noOfFarmers.join("','")+"')";
			mysql.fetchData(function(err, results){
				if (err) {
					throw err;
				} else{
					for(i=0;i<results.length;i++){
						source_add[i]=results[i].ADDRESS;
						source_city[i]=results[i].CITY;
						source_zip[i]=results[i].ZIP_CODE;}

					var query2="select t.DRIVER_ID , t.TRUCK_ID , c.ADDRESS, c.CITY,c.ZIP_CODE ,c.STATE from trucks t,customer c where t.STATUS= 'Available' and c.CUST_ID="+custid+" LIMIT "+noOfFarmers.length;
					mysql.fetchData(function(err, results){
						if (err) {
							throw err;
						} else
						{
							var driver_id= [];
							var truck_id= [];
							for(i=0;i<results.length;i++){
								driver_id[i]=results[i].DRIVER_ID;
								truck_id[i]=results[i].TRUCK_ID;}

							var dest_add=results[0].ADDRESS;
							var dest_city=results[0].CITY;
							var dest_zip=results[0].ZIP_CODE;
							console.log("truck id is"+JSON.stringify(truck_id));
							console.log("driver id is"+JSON.stringify(driver_id));
							console.log("dest addr is "+JSON.stringify(dest_add));


							fetchBillid(noOfFarmers,deliverydate,source_add,source_city,source_zip,productid,driver_id,truck_id,amount,source_add_prod,source_city_prod,source_zipcode_prod,dest_add,dest_city,dest_zip,custid,qty);




							var query5="update amazon.trucks set status='Unavailable' where DRIVER_ID in ("+driver_id.join()+") AND TRUCK_ID in("+truck_id.join()+")";	
							mysql.insertData1(function(err, results){
								if (err) 
								{
									throw err;
								} 
								else{
									console.log("status of truck has been updated successfully");
									res.send({code:200});
								}
							},query5);				
						}				
					},query2);
				}
			},query);
		}
	},getQuery);
};
exports.listtrips=function(req,res){
	var gettrips="SELECT * FROM TRIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("listtrips",{triplist:Result});
		}
	},gettrips);
};

exports.tripmap=function(req,res)
{
	var tripid=req.param("tripId");
	var gettrip="SELECT * FROM TRIP WHERE TRIP_ID="+tripid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.tripid=tripid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);
};

exports.tripmaps=function(req,res){
	var tripid=req.session.tripid;
	var gettrip="SELECT * FROM TRIP WHERE TRIP_ID="+tripid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("tripmap",{trip:Result});
		}
	},gettrip);

}

exports.listalltrips=function(req,res){
	var gettrips="SELECT * FROM TRIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("listalltrips",{trip:Result});
		}
	},gettrips);
};

exports.statspercustomer=function(req,res)
{
	var getcustomers="SELECT * FROM customer";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("statspercustomer",{cust:Result});
		}
	},getcustomers);

};

exports.stattripcust=function(req,res)
{
	var custid=req.param("custid");
	var gettrip="SELECT * FROM TRIP WHERE CUSTOMER_ID="+custid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.scid=custid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);
};

exports.cutstats=function(req,res)
{
	var custid=req.session.scid;
	var gettrip="SELECT count(*) as count,CUSTOMER_ID FROM TRIP WHERE CUSTOMER_ID="+custid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("chartcustomer",{stat:Result});
		}
	},gettrip);

}

exports.statsperdriver=function(req,res)
{
	var getcustomers="SELECT * FROM trucks";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("statsperdriver",{driver:Result});
		}
	},getcustomers);
}

exports.stattripdri=function (req,res)
{
	var driid=req.param("driid");
	var gettrip="SELECT * FROM TRIP WHERE DRIVER_ID="+driid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.drid=driid;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);
}

exports.dristats=function(req,res){
	var drid=req.session.drid;
	var gettrip="SELECT count(*) as count,DRIVER_ID FROM TRIP WHERE DRIVER_ID="+drid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("chartdriver",{stat:Result});
		}
	},gettrip);

}

exports.statsperarea=function(req,res){
	var getcustomers="SELECT * FROM TRIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render("statsperarea",{area:Result});
		}
	},getcustomers);

};

exports.stattriparea=function(req,res){
	var zip=req.param("zip");
	var gettrip="SELECT * FROM TRIP WHERE DROPOFF_ZIP="+zip+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			req.session.zip=zip;
			var json_response = {"Status":"Approved"};
			res.send(json_response);
		}
	},gettrip);

};

exports.areastat=function(req,res){
	var zip=req.session.zip;
	var gettrip="SELECT count(*) as count,DROPOFF_ZIP FROM TRIP WHERE DROPOFF_ZIP="+zip+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("chartarea",{stat:Result});
		}
	},gettrip);

};

exports.allareastat=function(req,res)
{
	var gettrip="SELECT count(*) as count,DROPOFF_ZIP FROM TRIP GROUP BY DROPOFF_ZIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.render("chartallarea",{stat:Result});
		}
	},gettrip);
};
exports.logout = function(req,res) {
	req.session.destroy();
	res.redirect('/');
};
exports.getReviewFarmer = function(req,res) {

	var farmerSearch = req.param("farmerSearch");
	var farmerSearchCriteria = req.param("farmerSearchCriteria");
	var json_response;
	if(farmerSearchCriteria !== undefined) {
		if(farmerSearch === 'farmerId') {

			var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE FARMER_ID = '"+farmerSearchCriteria+"'";
			mysql.fetchData(function(err, farmerResults){
				if (err) {
					throw err;
				} else{
					if (farmerResults.length > 0) {
						json_response={"getReviewFarmerStatus":200,"farmerResults":farmerResults};
						res.send(json_response);
					} else if (farmerResults.length === 0) {
						json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getFarmerList);			
		} else if(farmerSearch === 'farmerFirstName') {

			var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE FIRST_NAME LIKE '%"+farmerSearchCriteria+"%'";
			mysql.fetchData(function(err, farmerResults){
				if (err) {
					throw err;
				} else{
					if (farmerResults.length > 0) {
						json_response={"getReviewFarmerStatus":200,"farmerResults":farmerResults};
						res.send(json_response);
					} else if (farmerResults.length === 0) {
						json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getFarmerList);			
		} else if(farmerSearch === 'farmerLastName') {

			var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE LAST_NAME LIKE '%"+farmerSearchCriteria+"%'";
			mysql.fetchData(function(err, farmerResults){
				if (err) {
					throw err;
				} else{
					if (farmerResults.length > 0) {
						json_response={"getReviewFarmerStatus":200,"farmerResults":farmerResults};
						res.send(json_response);
					} else if (farmerResults.length === 0) {
						json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getFarmerList);			
		} else if(farmerSearch === 'farmerCity') {

			var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE CITY LIKE '%"+farmerSearchCriteria+"%'";
			mysql.fetchData(function(err, farmerResults){
				if (err) {
					throw err;
				} else{
					if (farmerResults.length > 0) {
						json_response={"getReviewFarmerStatus":200,"farmerResults":farmerResults};
						res.send(json_response);
					} else if (farmerResults.length === 0) {
						json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getFarmerList);			
		} else if(farmerSearch === 'farmerState') {

			var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE STATE LIKE '%"+farmerSearchCriteria+"%'";
			mysql.fetchData(function(err, farmerResults){
				if (err) {
					throw err;
				} else{
					if (farmerResults.length > 0) {
						json_response={"getReviewFarmerStatus":200,"farmerResults":farmerResults};
						res.send(json_response);
					} else if (farmerResults.length === 0) {
						json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"0 Search Results"};
						res.send(json_response);
					}
				}
			}, getFarmerList);			
		} 
	}
	else {
		var json_response={"getReviewFarmerStatus":401,"errorMessageDislay":"Field cannot be empty"};
		res.send(json_response);
	}		


};