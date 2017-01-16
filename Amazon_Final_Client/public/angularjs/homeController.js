/**
 * http://usejsdoc.org/
 */
amazon.controller("HomeController", function($scope,$http,$location){
	
	$scope.farmerSignUp=function(){
		window.location.assign("/farmerSignUp");
	};
	$scope.customerSignUp=function(){
		
		window.location.assign("/customerSignUp");
	};
	$scope.adminLogin=function(){
		window.location.assign("/adminLogin");
	};
	$scope.customerLogin=function(){
		window.location.assign("/customerLogin");
	};
	$scope.farmerLogin=function(){
		window.location.assign("/farmerLogin");
	};
	
	
	
	
});
	 			