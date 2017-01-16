var mysql = require("./mysql");
var mongo= require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";

function handle_request(req, callback){
	console.log("operationnnnn::"+req.operation+"::message::"+req.message);
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);

	switch(operation){
	case "viewIndividualProducts" :
			viewIndividualProducts(message,callback);
		break;




	default : 
		callback({status : 400,message : "Bad Request"});
	}

}

exports.viewIndividualProducts = function (msg,callback){
	var res={};
	var customerReviews='';
	var json_response;
	var productId = msg.productId;
	var productName = msg.productName;
	var productPrice = msg.productPrice;
	var productQuantity = msg.productQuantity;
	var productDescription = msg.productDescription;
	var productCategory = msg.productCategory;
	var productAvgRatings = msg.productAvgRatings;
	var farmerId = msg.farmerId;
	var imgpath = msg.imgpath;
	var customerId=msg.customerId;
	console.log("customerId;;;;;;"+customerId);
	
	mongo.connect(mongoURL, function(){
		var collProductReview = mongo.collection('PurchaseHistory');
		collProductReview.findOne({"customerId":customerId},{"products":1,"_id":0},function(err,result){
			if (err) {
				throw err;
			} else{
				if(result && result.hasOwnProperty("products")){
					console.log("entered allow comment0:::"+result.products.length);
					for(var i=0;i< result.products.length;i++){
						console.log("entered for::"+productId+"::"+result.products[i]);
						if(result.products[i]=== parseInt(productId)){
							console.log("entered allow comment1");
							res.AllowComment=true;
							mongo.connect(mongoURL, function(){
								var collProductReview = mongo.collection('ProductReview');
								collProductReview.findOne({"productId":parseInt(productId)},{"customerReviews":1,"_id":0},function(err,reviewResult){
									if (err) {
										throw err;
									} else{
										console.log("are you entering here??::"+res.AllowComment);
										res.customerReviews=reviewResult.customerReviews;
										res.viewIndividualProductsStatus="200";
										callback(null,res);
									}
								});
							});
						}
						else{
							res.AllowComment=false;
							mongo.connect(mongoURL, function(){
								var collProductReview = mongo.collection('ProductReview');
								collProductReview.findOne({"productId":parseInt(productId)},{"customerReviews":1,"_id":0},function(err,reviewResult){
									if (err) {
										throw err;
									} else{

										res.customerReviews=reviewResult.customerReviews;
										res.viewIndividualProductsStatus="200";
										callback(null,res);
									}
								});
							});
						}
					}
				}else{
					console.log("going here");
					res.customerReviews=customerReviews;
					res.AllowComment=false;
					res.viewIndividualProductsStatus="200";
					callback(null,res);
				}
			}
		});
	});
};

exports.addProductReview=function(msg,callback){
	var res={};
	var reviewComments =msg.reviewComments;
	var productId=msg.productId;
	var farmerId=msg.farmerId;
	var rating =msg.rating;
	var getRatings = "SELECT PRODUCT_ID,PRODUCT_AVG_RATINGS,PRODUCT_TOT_POINTS,NoOfCustomersRated FROM PRODUCT WHERE PRODUCT_ID='"+productId+"';";
	mysql.fetchData(function(err, getRatingsResult){
		if (err) {
			throw err;
		} else{
			if (getRatingsResult.length > 0) {
				console.log("entering here???");
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
										collProductReview.update({'productId':parseInt(productId)},{$push:{customerReviews:{"firstName":msg.firstName,"lastName":msg.lastName,"Review":reviewComments,"Rating":rating}}},function(err,addPoductReview){});
										res.value="PostedReview";
										callback(null,res);
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