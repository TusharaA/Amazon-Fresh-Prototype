var mysql = require("./mysql");

function handle_request(req, callback){
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);
	
	switch(operation){
	
	case "billsearch" :
		billsearch(message,callback);
			break;
	
	case "cancelorder" : 
		
		cancelorder(message,callback);
		break;
			
case "checkout" : 
		
	checkout(message,callback);
		break;
case "orderhistroy" : 
	
	orderhistroy(message,callback);
	break;
	default : 
		callback({status : 400,message : "Bad Request"});
}
	
}
function orderhistroy(msg, callback){
	//console.log("Inside hande_rew function"+msg.username ""+msg.password);
	var res = {};
	console.log("In handle request:"+ msg);
	
	var query="select * from billing where CUSTOMER_ID='"+msg.cust_id+"' order by EXPCTD_DELIVERY_DATE"; 
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		}
		else
		{
			if(results && results.length>0)
			{
			     res.code=200;
				res.result={server_result:results,code:200}
				callback(null,res);
				
			}
			
				else{
					console.log("No data found");
					res.code=400;
					callback(null,res);
					
				}
		}
	},query);
}
function array_unique(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) == -1) {
            result.push(arr[i]);
        }
    }
    return result;
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

function checkout(msg, callback){
	//console.log("Inside hande_rew function"+msg.username ""+msg.password);
	var res = {};
	console.log("In handle request:"+ msg);
	
	var getQuery="select p.FARMER_ID,p.PRODUCT_ID,f.ADDRESS,f.CITY,f.ZIP_CODE " +
	"from product p,farmer f " +
	"where p.PRODUCT_ID in ("+msg.productid.join()+")"  +
	"and p.FARMER_ID=f.FARMER_ID";

mysql.fetchData(function(err, results){
if (err) {
	throw err;
	res.code=400;
	callback(null,res);
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
				res.code=400;
				callback(null,res);
			} else{
				for(i=0;i<results.length;i++){
					source_add[i]=results[i].ADDRESS;
					source_city[i]=results[i].CITY;
					source_zip[i]=results[i].ZIP_CODE;}

	var query2="select t.DRIVER_ID , t.TRUCK_ID , c.ADDRESS, c.CITY,c.ZIP_CODE ,c.STATE from trucks t,customer c where t.STATUS= 'Available' and c.CUST_ID='"+msg.custid+"' LIMIT "+noOfFarmers.length;
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
			res.code=400;
			callback(null,res);
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
		

fetchBillid(noOfFarmers,msg.deliverydate,source_add,source_city,source_zip,msg.productid,driver_id,truck_id,msg.amount,source_add_prod,source_city_prod,source_zipcode_prod,dest_add,dest_city,dest_zip,msg.custid,msg.qty);
	
			


			var query5="update trucks set status='Unavailable' where DRIVER_ID in ("+driver_id.join()+") AND TRUCK_ID in("+truck_id.join()+")";	
			mysql.insertData1(function(err, results){
				if (err) 
				{
					throw err;
					res.code=400;
					callback(null,res);
				} 
				else{
					console.log("status of truck has been updated successfully");
					res.code=200;
					callback(null,res);
					
				}
			},query5);				
}				
		},query2);
			}
		},query);
		}
	},getQuery);
		
		
}


function cancelorder(msg, callback){
	//console.log("Inside hande_rew function"+msg.username ""+msg.password);
	var res = {};
	console.log("In handle request:"+ msg);
	
	var query0="select * from `billing` WHERE `BILLING_ID`='"+msg.billid+"' and EXPCTD_DELIVERY_DATE >'"+msg.today+"' ";
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
				var query01="select DRIVER_ID,TRUCK_ID from trip where BILLING_ID='"+msg.billid+"'";
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
                        var query="DELETE FROM `billing` WHERE `BILLING_ID`='"+msg.billid+"'";
					   mysql.fetchData(function(err, result){
							if (err) {
								throw err;
							} else
							{
								console.log("result of delete query from bill is");
								
						var query1="UPDATE `trucks` SET `STATUS`='Available' WHERE `TRUCK_ID`='"+truck_id+"' and `DRIVER_ID`='"+driver_id+"'";
						 mysql.fetchData(function(err, result02){
							if (err) {
								throw err;
							} else
							{
								console.log("truck status has been updated");
								// change the inventory now
								var query2="UPDATE `product` SET `PRODUCT_QTY`=`PRODUCT_QTY`+"+Number(qty)+" WHERE `PRODUCT_ID`='"+product_id+"'";
								 mysql.fetchData(function(err, result02){
										if (err) {
											throw err;
										}
										else
										{
											res.code=200;
											callback(null, res);
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
						res.code=400;
						callback(null, res);
						}
						
                }
				 },query01);
	      }
		else
		{
			console.log("bill can not be deleted");
			res.code=400;
			callback(null, res);
		}

       }

    },query0);
	
}


function billsearch(msg, callback){
	//console.log("Inside hande_rew function"+msg.username ""+msg.password);
	var res = {};
	console.log("In handle request:"+ msg);
	var getQuery="select * from amazon.billing where "+msg.column+"='"+msg.value+"'";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
			res.code=400;
			callback(null,res);	
			
		} 
		else
		{
	if(results && results.length>0){
		res.code=200;
		res.result={server_result:results,code:200}
		callback(null,res);	
		
	}
	else{
		res.code=400;
		callback(null,res);	
		
	}
		}
		
},getQuery);
	
		
		
}
exports.handle_request = handle_request;