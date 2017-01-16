
var mysql = require("./mysql");

function handle_request(req, callback){
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);
	
	switch(operation){
	
	case "statsperdriver" :
		statsperdriver(message,callback);
			break;
	
	case "dristats" : 
		
		dristats(message,callback);
		break;
			
case "statsperarea" : 
		
	statsperarea(message,callback);
		break;
case "areastat" : 
	
	areastat(message,callback);
	break;
case "allareastat" : 
	
	allareastat(message,callback);
	break;
case "revenuestat" : 
	
	revenuestat(message,callback);
	break;
case "revenuestats" : 
	
	revenuestats(message,callback);
	break;
	
case "tripmap" : 
	
	tripmap(message,callback);
	break;
	
case "tripmaps" : 
	
	tripmaps(message,callback);
	break;
	
case "listtrips" : 
	
	listtrips(message,callback);
	break;
	
case "listalltrips" : 
	
	listalltrips(message,callback);
	break;
	
case "statspercustomer" : 
	
	statspercustomer(message,callback);
	break;
	
case "stattripcust" : 
	
	stattripcust(message,callback);
	break;
	
case "cutstats" : 
	
	cutstats(message,callback);
	break;
	
case "stattripdri" : 
	
	cutstats(message,callback);
	break;
	
case "stattriparea" : 
	
	stattriparea(message,callback);
	break;
	default : 
		callback({status : 400,message : "Bad Request"});
}
	
}
function revenuestats(msg, callback){
	var res = {};
	var gettrip="select Bill_date,Sum(Total_amount) as sum from Billing where substr(Bill_date,1,10) between '"+msg.sdate+"' and '"+msg.edate+"' group by substr(Bill_date,1,10);";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			res.result=Result;
			res.code=200;
			
			callback(null,res);
			
		}
	},gettrip);


	}

function revenuestat(msg, callback){
var res = {};
var gettrip="select Bill_date,Sum(Total_amount) from Billing where substr(Bill_date,1,10) between '"+msg.sdate+"' and '"+msg.edate+"' group by substr(Bill_date,1,10);";
mysql.fetchData(function(err, Result){
	if (err) {
		throw err;
	} else{
		res.code=200;
		
		callback(null,res);
		
	}
},gettrip);


}

function allareastat(msg, callback){
	var res = {};
	var gettrip="SELECT count(*) as count,DROPOFF_ZIP FROM TRIP GROUP BY DROPOFF_ZIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			 res.code=200;
				res.result=Result;
				callback(null,res);
			
		}
	},gettrip);
        

}
function statsperarea(msg, callback){
	var res = {};
	var getcustomers="SELECT DISTINCT DROPOFF_ZIP FROM TRIP";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			res.code=200;
			res.result=Result;
			callback(null,res);
			
		}
	},getcustomers);

}
function areastat(msg, callback){
	var res = {};
	var gettrip="SELECT count(*) as count,DROPOFF_ZIP FROM TRIP WHERE DROPOFF_ZIP="+msg.zip+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			res.code=200;
			res.result=Result;
			callback(null,res);
		
		}
	},gettrip);
	
}

function dristats(msg, callback){
	var res = {};
	var gettrip="SELECT count(*) as count,DRIVER_ID FROM TRIP WHERE DRIVER_ID="+msg.drid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			res.code=200;
			res.result=Result;
			callback(null,res);
			
		}
	},gettrip);
	
}
function statsperdriver(msg, callback){
	var res = {};
	var getcustomers="SELECT * FROM trucks";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
			res.code=400;
		} else{
			console.log(Result);
			res.code=200;
			res.result=Result;
	callback(null,res);
		}
	},getcustomers);
}

function tripmap(msg,callback)
{
	console.log("in"+msg);
	var res={};
var tripid=msg.tripId;
var gettrip="SELECT * FROM TRIP WHERE TRIP_ID="+tripid+";";
mysql.fetchData(function(err, Result){
	if (err) {
		throw err;
	} else{
		res.value="200";
		callback(null,res);
	}
},gettrip);
}

function listtrips(msg,callback)
{
	res={};
	var gettrips="SELECT * FROM TRIP LIMIT 1000";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.value="200"
			res.result=Result;
			callback(null,res);
		}
	},gettrips);
	
}

function tripmaps(msg,callback)
{
	console.log("in"+msg);
	var res={};
var tripid=msg.tripId;
var gettrip="SELECT * FROM TRIP WHERE TRIP_ID="+tripid+";";
mysql.fetchData(function(err, Result){
	if (err) {
		throw err;
	} else{
		res.value="200";
		res.result=Result;
		callback(null,res);
	}
},gettrip);
}

function listalltrips(msg,callback)
{
	res={};
	var gettrips="SELECT * FROM TRIP  LIMIT 1000";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.value="200"
			res.result=Result;
			callback(null,res);
		}
	},gettrips);
	
}

function statspercustomer(msg,callback){
	
	var res={};
	var getcustomers="SELECT * FROM customer  LIMIT 1000";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log("c"+Result);
			res.value="200"
				res.result=Result;
				callback(null,res);
		}
	},getcustomers);
}

function stattripcust(msg,callback){
	
var res={};
custid=msg.custid;
var gettrip="SELECT * FROM TRIP WHERE CUSTOMER_ID='"+custid+"';";
mysql.fetchData(function(err, Result){
	if (err) {
		throw err;
	} else{
		console.log(Result);
		res.value="200";
		callback(null,res);
	}
},gettrip);
}

function cutstats(msg,callback) {
	var res={};
	custid=msg.custid;
	var gettrip="SELECT count(*) as count,CUSTOMER_ID FROM TRIP WHERE CUSTOMER_ID='"+custid+"';";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log("tc"+Result);
			res.value="200";
			res.result=Result;
			callback(null,res);
		}
	},gettrip);
	
}

function stattripdri(msg,callback){
	
	var res={};
	var driid=msg.driid;
	var gettrip="SELECT * FROM TRIP WHERE DRIVER_ID="+driid+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.value="200";
			callback(null,res);
		}
	},gettrip);
	
}

function stattriparea(msg,callback){
	var res={};
	var zip=msg.zip;
	var gettrip="SELECT * FROM TRIP WHERE DROPOFF_ZIP="+zip+";";
	mysql.fetchData(function(err, Result){
		if (err) {
			throw err;
		} else{
			console.log(Result);
			res.value="200";
			callback(null,res);
		}
	},gettrip);
}
exports.handle_request = handle_request;