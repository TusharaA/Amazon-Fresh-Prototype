

var mysql = require("./mysql");

function handle_request(req, callback){
	var operation = req.operation;
	var message = req.message;
	var res = {};
	console.log("In handle request:"+ req.operation);
	console.log("a"+req.message);
	
	switch(operation){
	
	case "truckstatus" :
		truckstatus(message,callback);
			break;
	
	case "modifytruckstatus" : 
		
		modifytruckstatus(message,callback);
		break;
			
	default : 
		callback({status : 400,message : "Bad Request"});
}

	
}

function truckstatus(msg, callback){
	//console.log("Inside hande_rew function"+msg.username ""+msg.password);
	var res = {};
	console.log("In handle request:"+ msg);
	var getQuery="select tr.TRUCK_ID,tr.DRIVER_ID,t.DELIVERY_DATE,tr.STATUS FROM trucks tr, trip t where tr.TRUCK_ID=t.TRUCK_ID and tr.DRIVER_ID=t.DRIVER_ID and tr.status='Unavailable'  and t.DELIVERY_DATE > '"+msg.today+"' GROUP BY tr.TRUCK_ID,tr.DRIVER_ID,t.DELIVERY_DATE,tr.STATUS";
	mysql.fetchData(function(err, results){
		if (err) {
			throw err;
		} else
		{
			
		
		if(results && results.length>0)
		{
			console.log("truck status data found"+results[0]);
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
		
},getQuery);
	
			
		
}

function modifytruckstatus(msg,callback){
	var res = {};
	console.log("In handle request:"+ msg);
	var query="UPDATE `amazon`.`trucks` SET `STATUS`='Available' WHERE `TRUCK_ID`='"+msg.truck_id+"' and `DRIVER_ID`='"+msg.driver_id+"'";
	mysql.fetchData(function(err, results){
		if(err)
		{
			throw err;
			res.code=400;
		 
		 callback(null,res);
		 }
		else{
			console.log("update successful");
			res.code=200;
			callback(null,res);
	        
		}
	},query);
}
exports.handle_request = handle_request;