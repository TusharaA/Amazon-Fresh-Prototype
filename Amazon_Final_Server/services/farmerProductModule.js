var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";
var mysql = require("./mysql");

exports.addProduct = function(msg, callback){	
	var res = {};
	var productName = msg.productName;
	var productPrice = msg.productPrice;
	var productDescription = msg.productDescription;
	var productQuantity = msg.productQuantity;
	var productCategory = msg.productCategory;
	var farmerId = msg.farmerId;
	var p = msg.p;
	var productInfo = {FARMER_ID : farmerId,
			PRODUCT_NAME:productName,
			PRODUCT_PRICE:productPrice,
			PRODUCT_QTY:productQuantity,
			PRODUCT_DESCRIPTION:productDescription,
			PROD_CAT:productCategory};
	mysql.insertData("PRODUCT", productInfo, function(err, result) {
		if (err) {
			throw err;
		} else {
			var getProductId="SELECT PRODUCT_ID from PRODUCT where FARMER_ID='"+farmerId+"'AND PRODUCT_NAME='"+productName+"' AND PRODUCT_DESCRIPTION = '"+productDescription+"';";
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
			res.value="200";
			callback(null, res);
		}
	});
};

exports.deleteProduct = function(msg, callback){
	var res = {};
	var productId = msg.productId;
	console.log("in updateData farmerProductModule "+productId);
	mysql.updateData("PRODUCT", {STATUS : '0'}, 
			{PRODUCT_ID:productId}, function(err, result) {
				if (err) {
					throw err;
				} else {
					console.log("in updateData farmerProductModule");
					res.value="200";
					callback(null, res);
				}
			});
};

exports.updateProduct = function(msg, callback){
	var res = {};
	var productId = msg.productId;
	var productName = msg.productName;
	var productPrice = msg.productPrice;
	var productDescription = msg.productDescription;
	var productQuantity = msg.productQuantity;
	var productCategory = msg.productCategory;
	mysql.updateData("PRODUCT", {PRODUCT_NAME : productName,PRODUCT_PRICE : productPrice,PRODUCT_DESCRIPTION : productDescription,PRODUCT_QTY : productQuantity,PROD_CAT : productCategory}, 
			{PRODUCT_ID : productId}, function(err, result) {
				if (err) {
					throw err;
				} else {
					res.value="200";
					callback(null, res);
				}
			});
};

exports.searchFarmer = function(msg, callback){
	var res = {};
	var farmerSearch = msg.farmerSearch;
	var farmerSearchCriteria = msg.farmerSearchCriteria;

	if(farmerSearch === 'farmerId') {

		var getFarmerList = "SELECT FARMER_ID, FIRST_NAME, LAST_NAME, CITY, STATE FROM FARMER WHERE FARMER_ID = '"+farmerSearchCriteria+"'";
		mysql.fetchData(function(err, farmerResults){
			if (err) {
				throw err;
			} else{
				if (farmerResults.length > 0) {
					res.value = "200";
					res.farmerResults = farmerResults;
					callback(null, res);
				} else if (farmerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.farmerResults = farmerResults;
					callback(null, res);
				} else if (farmerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.farmerResults = farmerResults;
					callback(null, res);
				} else if (farmerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.farmerResults = farmerResults;
					callback(null, res);
				} else if (farmerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.farmerResults = farmerResults;
					callback(null, res);
				} else if (farmerResults.length === 0) {
					res.value = "401";
					callback(null, res);
				}
			}
		}, getFarmerList);			
	} 
};

function getProductList(res,callback,farmerId) {
	var productList = '';
	var getProductList1 = "SELECT PRODUCT_ID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_QTY,PRODUCT_DESCRIPTION,PROD_CAT,PRODUCT_AVG_RATINGS FROM PRODUCT WHERE FARMER_ID='" + farmerId + "' and APPROVED_PRODUCT='1' and STATUS ='1' ORDER BY PRODUCT_ID;";
	mysql.fetchData(function(err, getProductList){
		if (err) {
			throw err;
		} else{
			if (getProductList.length > 0) {
				var productIdList =[];
				for(var i=0;i<getProductList.length;i++) {
					productIdList[i] = getProductList[i].PRODUCT_ID;
				}
				res.productList = getProductList;
				mongo.connect(mongoURL, function(){

					var coll = mongo.collection('ProductReview');
					coll.find({"productId" : { $in: productIdList}},{"productId":1,"imgpath":1,"_id":0}).sort({"productId":1}).toArray(function(err, productImageResult){
						if (err) {
							throw err;
						} else{
							if (productImageResult){
								res.productImageResult = productImageResult;												
							} else {
								res.productImageResult  = '';
							}
							res.value="200";
							callback(null, res);
						}												
					});
				});
			} else {
				//res.productList = '';
				//res.productImageResult  = '';
				res.value="200";
				callback(null, res);
			}
		}
	}, getProductList1);
};

exports.viewFarmerProfile = function(msg, callback){	
	var res = {};
	var farmerId = msg.farmerId;
	var farmervideoResult = {};
	var emailId = msg.emailId;
	var getFarmerInfo="select * from FARMER where FARMER_ID='"+farmerId+"'OR EMAIL_ID='"+emailId+"';";
	mysql.fetchData(function(err, getFarmerInfoResult){
		if (err) {
			throw err;
		} else{
			mongo.connect(mongoURL, function(){

				var coll = mongo.collection('farmer');
				coll.findOne({"farmerId" :   farmerId},{"imgpath":1,"_id":0},function(err, farmervideoResult){
					if (err) {
						throw err;
					} else{
						if (farmervideoResult){
							res.farmervideoResult = farmervideoResult;

						}
						else {

							//res.farmervideoResult = '';

						}
					}												
				});
			});
			if (getFarmerInfoResult.length > 0) {
				res.farmerId=getFarmerInfoResult[0].FARMER_ID;
				res.firstName=getFarmerInfoResult[0].FIRST_NAME;
				res.lastName=getFarmerInfoResult[0].LAST_NAME;
				res.address=getFarmerInfoResult[0].ADDRESS;
				res.city=getFarmerInfoResult[0].CITY;
				res.state=getFarmerInfoResult[0].STATE;
				res.zipCode=getFarmerInfoResult[0].ZIP_CODE;
				res.phoneNumber=getFarmerInfoResult[0].PHONE;

				getProductList(res,callback,farmerId);
			} else {
				res.value = "404";
				callback(null, res);
			}
		}
	}, getFarmerInfo);
};

exports.editFarmerInfo=function(msg,callback){
	var firstName=msg.firstName;
	var lastName=msg.lastName;
	var address=msg.address;
	var city=msg.city;
	var state=msg.state;
	var zipCode=msg.zipCode;
	var phoneNumber=msg.phoneNumber;
	var emailId=msg.emailId;
	var farmerId=msg.farmerId;
	var res={};
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
			"FARMER_ID": farmerId
	};
	mysql.updateData("FARMER", insertValues, primaryKeys, function(err, result) {
		if (err){
			throw err;
		}else{
			res.value="EditFarmerInfoSuccesful";
			callback(null,res);
		}
	});

};

exports.deleteFarmer = function(msg,callback){
	var farmerId=msg.farmerId;
	var res={};

	mysql.updateData("FARMER", {STATUS : '0'}, 
			{FARMER_ID:farmerId}, function(err, result) {
				if (err) {
					throw err;
				} else {
					var getHisProducts="SELECT PRODUCT_ID FROM PRODUCT WHERE FARMER_ID='"+farmerId+"'";
					mysql.fetchData(function(err, getHisProductsResult){
						if (err) {
							throw err;
						} else{
							var i;
							for(i=0;i < getHisProductsResult.length; i++){
								mysql.updateData("PRODUCT", {STATUS : '0'}, 
										{PRODUCT_ID:getHisProductsResult[i].PRODUCT_ID}, function(err, result){});
							}

							if( i === getHisProductsResult.length){
								res.value="deletedFarmer";
								callback(null,res);
							}
						}
					},getHisProducts);
				}
			});



};
