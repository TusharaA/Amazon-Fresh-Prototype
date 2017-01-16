var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";
var mysql = require("./mysql");

exports.searchProduct = function(msg, callback){	
	var res = {};
	var searchProductResults = '';
	var searchString = msg.searchString;
	var searchQuery = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS FROM PRODUCT P INNER JOIN FARMER F ON  F.FARMER_ID = P.FARMER_ID WHERE P.STATUS ='1' and P.APPROVED_PRODUCT='1' AND P.PRODUCT_NAME LIKE '%"+searchString+"%' OR P.PROD_CAT LIKE '%"+searchString+"%' ORDER BY PRODUCT_ID";
	mysql.fetchData(function(err, searchProductResult) {
		if (err) {
			throw err;
		} else{
			res.searchProductResults = searchProductResult;
			var productIdList =[];
			for(var i=0;i<searchProductResult.length;i++) {
				productIdList[i] = searchProductResult[i].PRODUCT_ID;
			}
			mongo.connect(mongoURL, function(){
				var coll = mongo.collection('ProductReview');
				coll.find({"productId" : { $in: productIdList}},{"productId":1,"imgpath":1,"_id":0}).sort({"productId":1}).toArray(function(err, productImageResult){
					if (err) {
						throw err;
					} else{
						if (productImageResult){
							res.productImageResult = productImageResult;
						}
						res.value="200";
						callback(null, res);
					}

				});
			});

		}
	}, searchQuery);
};

exports.updateProductQty = function(msg, callback){	
	var res = {};
	var productId = msg.productId;
	var productQuantity = msg.productQuantity;
	var getProductQuantity = "SELECT PRODUCT_QTY FROM PRODUCT WHERE PRODUCT_ID=" + productId + ";";
	mysql.fetchData(function(err, getProductQuantityResults) {
		if (err) {
			throw err;
		} else{
			var newProductQuantity = Number(getProductQuantityResults[0].PRODUCT_QTY) - Number(productQuantity);
			var insertValues={
					"PRODUCT_QTY":newProductQuantity
			};
			var primaryKeys ={
					"PRODUCT_ID": productId
			};
			mysql.updateData("PRODUCT", insertValues, primaryKeys, function(err, result) {
				if (err){
					throw err;
				}else{
					res.value="200";
					callback(null, res);
				}
			});			
		}		
	}, getProductQuantity);	
};

exports.viewBill = function(msg, callback){	
	var res = {};
	var cartProductIdList = msg.cartProductIdList;
	var cartFarmerIdList = msg.cartFarmerIdList;
	var customerId = msg.customerId;
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('PurchaseHistory');
		coll.findOne({"customerId":customerId},{"_id":0},function(err, result) {
			if (err) {
				throw err;
			} else{						
				if(result){
					for(var j=0;j<cartProductIdList.length;j++) 
					{
						coll.update({'customerId':customerId},{$push:{products:cartProductIdList[j]}},function(err,addPurchaseHistory){});
					}
					for(var j=0;j<cartFarmerIdList.length;j++) 
					{
						coll.update({'customerId':customerId},{$push:{farmers:cartFarmerIdList[j]}},function(err,addPurchaseHistory){});
					}
					res.value="200";
					callback(null, res);
				}else{
					coll.insert({"customerId":customerId},{"products":cartProductIdList,"farmers":cartFarmerIdList});
					res.value="200";
					callback(null, res);
				}

			}	
		});
	});
};

exports.deleteCustomer=function(msg,callback){
	var res={};
	var customerId=msg.message.customerId;
	mysql.updateData("CUSTOMER", {STATUS : '0'}, 
			{CUST_ID:customerId}, function(err, result) {
				if (err) {
					throw err;
				} else {
					res.value="deletedCustomer";
					callback(null,res);
				}
			});
};