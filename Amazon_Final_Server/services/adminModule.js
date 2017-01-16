var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/amazon";
var mysql = require("./mysql");

exports.reviewProduct = function(msg, callback){	
	
	var res = {};
	var productSearch = msg.productSearch;
	var productSearchCriteria = msg.productSearchCriteria;
	if(productSearch == 'productName') {

		var getProductList = "SELECT P.PRODUCT_ID,P.FARMER_ID,F.FIRST_NAME,P.PRODUCT_NAME,P.PRODUCT_PRICE,P.PRODUCT_QTY,P.PRODUCT_DESCRIPTION,P.PRODUCT_AVG_RATINGS,P.APPROVED_PRODUCT FROM PRODUCT P,FARMER F WHERE P.PRODUCT_NAME LIKE '%"+productSearchCriteria+"%' AND P.FARMER_ID = F.FARMER_ID";
		mysql.fetchData(function(err, productResults){
			if (err) {
				throw err;
			} else{
				if (productResults.length > 0) {
					res.value = "200";
					res.productResults = productResults;
					callback(null, res);
				} else if (productResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.productResults = productResults;
					callback(null, res);
				} else if (productResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.productResults = productResults;
					callback(null, res);
				} else if (productResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.productResults = productResults;
					callback(null, res);
				} else if (productResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.productResults = productResults;
					callback(null, res);
				} else if (productResults.length === 0) {
					res.value = "401";
					callback(null, res);
				}
			}
		}, getProductList);			
	}
};

exports.reviewCustomer = function(msg, callback){	
	var res = {};
	var customerSearch = msg.customerSearch;
	var customerSearchCriteria = msg.customerSearchCriteria;
	if(customerSearch == 'customerFirstName') {

		var getCustomerList = "SELECT CUST_ID,FIRST_NAME,LAST_NAME,ADDRESS,CITY,STATE,PHONE,EMAIL_ID,APPROVED_CUST FROM CUSTOMER WHERE FIRST_NAME LIKE '%"+customerSearchCriteria+"%'";
		mysql.fetchData(function(err, customerResults){
			if (err) {
				throw err;
			} else{
				if (customerResults.length > 0) {
					res.value = "200";
					res.customerResults = customerResults;
					callback(null, res);
				} else if (customerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.customerResults = customerResults;
					callback(null, res);
				} else if (customerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.customerResults = customerResults;
					callback(null, res);
				} else if (customerResults.length === 0) {
					res.value = "401";
					callback(null, res);
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
					res.value = "200";
					res.customerResults = customerResults;
					callback(null, res);
				} else if (customerResults.length === 0) {
					res.value = "401";
					callback(null, res);
				}
			}
		}, getCustomerList);			
	} 
};

