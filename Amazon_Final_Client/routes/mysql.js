var ejs= require('ejs');
var mysql = require('mysql');
var config= require('./config');
var poolConfig= config.dbpool;
var pool =[];
var db=config.db;
//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	return mysql.createConnection({
	    host     : db.host,
	    user     : db.user,
	    password : db.password,
	    database : db.database,
	    port	 : db.port
	});
}

exports.createConnectionPool= function createConnectionPool(){
	for(var i=0; i<poolConfig.maxsize;i++){
		pool.push(getConnection());
	}
	
};
function getConnectionFromPool(){
	if(pool.length<=0){
		console.log("empty connection pool, sorry dude!");
		return null;
	}
	else{
		return pool.pop();
		
	}
	
}

//fetching the data from the sql server
function fetchData(callback,sqlQuery){
	console.log("\nSQL Query::"+sqlQuery);
	var connection=getConnectionFromPool();
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: hereeeee " + err.message);
			pool.push(connection);
		}
		else {
			console.log("DB Results:"+rows);
			pool.push(connection);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	
}
exports.insertData1=function insertData1(callback,query)
{
	
	console.log("\nSQL Query::"+query);
	
	var connection=getConnectionFromPool();
	
	connection.query(query, function(err, rows) {
		if(err){
			console.log("ERROR: " + err.message);
			pool.push(connection);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+rows);
			pool.push(connection);
			callback(err, rows);
			
		}
	});
	console.log("\nConnection closed..");

}

//insert data
function insertData(tableName,insertValues,callback){
	console.log("insertValues==="+insertValues);

	var connection=getConnection();
	var query1 = 'INSERT INTO ' + tableName+' SET ?';

	connection.query(query1,insertValues, function(err, result) {
		if(err){
			console.log("ERROR: " + err.message);
			pool.push(connection);
		}
		else
		{ // return err or result
			console.log("success insert!");
			pool.push(connection);
			callback(err, result);
		}
	});
	console.log("\nConnection closed..");
	
}

//update data
function updateData(tableName,insertValues,primaryKeys,callback){
	var connection=getConnection();
	connection.query('UPDATE '+ tableName+' SET ? WHERE ?', [insertValues, primaryKeys],function(err, result) {
		if(err){
			console.log("ERROR: " + err.message);
			pool.push(connection);
		}
		else
		{ // return err or result
			callback(err, result);
			pool.push(connection);
		}
	});
	console.log("\nConnection closed..");	
}

//delete data
function deleteData(tableName,primaryKeys,callback){
	var connection=getConnection();
	connection.query('DELETE FROM '+ tableName+' WHERE ?', [primaryKeys],function(err, result) {
		if(err){
			console.log("ERROR: " + err.message);
			pool.push(connection);
		}
		else
		{ // return err or result
			callback(err, result);
			pool.push(connection);
		}
	});
	console.log("\nConnection closed..");	
}

exports.addProducts=function(){
	var insert_values={
			FARMER_ID:"874-85-7894",
			PRODUCT_NAME:"Apple",
			PRODUCT_PRICE:2.99,
			PRODUCT_QTY:1000,
			PRODUCT_DESCRIPTION:"Desc",
			PROD_CAT:"Fruits",
			APPROVED_PRODUCT:true
	};
	for(var i=0; i < 1000 ; i++){
		insertData("PRODUCT",insert_values,function(err,result){});
	}
	
};


exports.fetchData=fetchData;
exports.insertData=insertData;
exports.updateData=updateData;
exports.deleteData=deleteData;

