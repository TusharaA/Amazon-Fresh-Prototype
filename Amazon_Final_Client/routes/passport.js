var mq_client = require('../rpc/client');
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mysql = require('./mysql');
var encryption= require('./encryption');

module.exports = function(passport) {
    passport.use('adminlogin', new LocalStrategy(function(username, password, done) {
    	
    	console.log("Inside admin validation page"+username)
    	var password1=encryption.encrypt(password);
    	console.log("passowrd is"+password1);
    	var msg_payload = { operation:"adminlogin",message:{"username": username,"password1":password1} };
    	
    	mq_client.make_request('login_queue',msg_payload, function(err,results){
    		
    		console.log("response from server is"+results.code);
    		if(err){
    			throw err;
    		}
    		else 
    		{
    			if(results.code==200){
        		 process.nextTick(function(){
                  
        			 var user=results.user;
                     done(null, user);
                 });
        			}
        			else{
        				 process.nextTick(function(){
        	               console.log("No user found\login not successful");  
                                
        	                     return done(null, null);
       
        	             });
         			}
             }
    	});

    	
    	
          
    }));
    
   passport.use('customerLogin', new LocalStrategy(function(username, password, done) {
    	
    	console.log("Inside customerLoginpage"+username)
    	var password1=encryption.encrypt(password);
    	console.log("passowrd is"+password1);
    	var msg_payload = { operation:"customerlogin",message:{"username": username,"password1":password1} };
    	
    	mq_client.make_request('login_queue',msg_payload, function(err,results){
    		
    		console.log("response from server is"+results.code);
    		if(err){
    			throw err;
    		}
    		else 
    		{
    			if(results.code==200){
        		 process.nextTick(function(){
                  
                     var user=results.user;
                     done(null, user);
                 });
        			}
        			else{
        				 process.nextTick(function(){
        	               console.log("No user found\login not successful");  
                                
        	                     return done(null, null);
       
        	             });
         			}
             }
    	});

    	
    	
          
    }));

   passport.use('farmerlogin', new LocalStrategy(function(username, password, done) {
   	
   	console.log("Inside farmerlogin"+username)
   	var password1=encryption.encrypt(password);
   	console.log("passowrd is"+password1);
   	var msg_payload = { operation:"farmerlogin",message:{"username": username,"password1":password1} };
   	
   	mq_client.make_request('login_queue',msg_payload, function(err,results){
   		
   		console.log("response from server is"+results.code);
   		if(err){
   			throw err;
   		}
   		else 
   		{
   			if(results.code==200){
       		 process.nextTick(function(){
                 
    			 var user=results.user
                    done(null, user);
                });
       			}
       			else
       			{
       				 process.nextTick(function(){
       	               console.log("No user found\login not successful");  
                               
       	                     return done(null, null);
      
       	             });
        			}
            }
   	});

   	
   	
         
   }));
   

}



