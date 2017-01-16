/**
 * http://usejsdoc.org/
 */
amazon.controller("AdminController", function($scope,$http,$location){
	$scope.productSearch = "productName";
	$scope.customerSearch = "customerFirstName";
	$scope.hideProductList = true;
	$scope.hideNoProductMessage = true;
	$scope.hideCustomerList = true;
	$scope.hideNoCustomerMessage = true;
	$scope.bills=true;
	$scope.truckstatus=true;
	$scope.aftersearch=true;
	$scope.farmerRequestList=function(){
		window.location.assign("/farmerRequestList");
	};
	$scope.customerRequestList=function(){
		window.location.assign("/customerRequestList");
	};
	$scope.productRequestList=function(){
		window.location.assign("/productRequestList");
	};
	$scope.customerLogin=function(){
		window.location.assign("/customerLogin");
	};
	$scope.farmerLogin=function(){
		window.location.assign("/farmerLogin");
	};

	$scope.approveFarmer = function(farmerEmailId,farmerId) {

		$http({
			method : "POST",
			url : '/approveFarmer',
			data : {
				"farmerEmailId" : farmerEmailId,
				"farmerId":farmerId
			}
		}).success(function(data) {
			
			if(data.farmerApprovalStatus == 'Approved'){			
				window.location.assign("/farmerRequestList");
			}
		}).error(function(error) {});
	};
	$scope.approveCustomer = function(customerEmailId,customerId) {
		$http({
			method : "POST",
			url : '/approveCustomer',
			data : {
				"customerEmailId" : customerEmailId,
				"customerId":customerId
			}
		}).success(function(data) {
			if(data.customerApprovalStatus == "Approved"){
				
				window.location.assign("/customerRequestList");
			}
		}).error(function(error) {});
	};
	
	$scope.approveProduct = function(productId) {
		
		$http({
			method : "POST",
			url : '/approveProduct',
			data : {
				"productId":productId
			}
		}).success(function(data) {
			if(data.productApprovalStatus == 'Approved'){			
				window.location.assign("/productRequestList");
			}
		}).error(function(error) {});
	};	
	
	$scope.reviewProduct = function(productId) {			
				window.location.assign("/reviewProduct");
	};
	
	$scope.reviewCustomer = function(productId) {			
		window.location.assign("/reviewCustomer");
	};
	
	$scope.searchProductList = function(productId) {

		$http({
			method : "POST",
			url : '/getReviewProduct',
			data : {
				"productSearch":$scope.productSearch,
				"productSearchCriteria" : $scope.productSearchCriteria
			}
		}).success(function(data) {
			if(data.getReviewProductStatus == 200){		
				$scope.productResults = data.productResults;
				$scope.hideProductList = false;
				$scope.hideNoProductMessage = true;
			} else if(data.getReviewProductStatus == 401) {
				//alert(data.errorMessageDislay);
				$scope.hideNoProductMessage = false;
				$scope.hideProductList = true;
				$scope.errorMessageDislay = data.errorMessageDislay;
			}
		}).error(function(error) {});
	};	
	
	$scope.searchCustomerList = function(productId) {

		$http({
			method : "POST",
			url : '/getReviewCustomer',
			data : {
				"customerSearch":$scope.customerSearch,
				"customerSearchCriteria" : $scope.customerSearchCriteria
			}
		}).success(function(data) {
			if(data.getReviewCustomerStatus == 200){		
				$scope.customerResults = data.customerResults;
				$scope.hideCustomerList = false;
				$scope.hideNoCustomerMessage = true;
			} else if(data.getReviewCustomerStatus == 401) {
				alert(data.errorMessageDislay);
				$scope.hideNoCustomerMessage = false;
				$scope.hideCustomerList = true;
				$scope.errorMessageDislay = data.errorMessageDislay;
			}
		}).error(function(error) {});
	};	
	$scope.truckstatus1=function(){
	
		console.log(" truck status function called");
		$http({
			method : "POST",
			url : '/truckstatus',
			data : {
				
			}
		}).success(function(data) {
			if(data.code == 200)
			{
			//alert("search successful");
				
				$scope.searchResult = data.server_result;
				$scope.aftersearch=true;
				$scope.truckstatus=false;
			
			}
			else{
				
				alert("All trucks which delievered the products have been made available");
				$scope.aftersearch=false;
				$scope.truckstatus=true;
				
			}
		}).error(function(error) {
		});
	
	}

	$scope.modifytruckstatus=function(TRUCK_ID,DRIVER_ID){
		console.log(" truck status function called"+TRUCK_ID);
		console.log(" truck status function called"+DRIVER_ID);
		$http({
			method : "POST",
			url : '/modifytruckstatus',
			data : {
				"TRUCK_ID":TRUCK_ID,
				"DRIVER_ID":DRIVER_ID
			}
		}).success(function(data) {
			if(data.code == 200)
			{
			alert("UPDATE SUCCESSFUL");
	      	}
			else{
				
				alert("UPDATE NOT SUCCESSFUL");
			}
		}).error(function(error) {
		});
		
		$scope.truckstatus1();
	}
$scope.billidsearch=function(){
	$scope.truckstatus=true;
	console.log(" admin controller called"+$scope.bill);
	console.log("value is"+$scope.value);
	
	$http({
		method : "POST",
		url : '/billsearch',
		data : {
			"column":$scope.bill,
			"value":$scope.value
		}
	}).success(function(data) {
		if(data.code == 200)
		{
		alert("search successful");
			
			$scope.bill_id=data.server_result[0].BILLING_ID;
			$scope.cust_id=data.server_result[0].CUSTOMER_ID;
			console.log("BILL ID IS"+$scope.bill_id);
			console.log("CUSTID IS"+	$scope.cust_id);
			$scope.searchResult = data.server_result;
			$scope.aftersearch=false;
			$scope.truckstatus=true;
		
		}
		else{
			
			alert("Data not found");
			$scope.aftersearch=true;
			$scope.truckstatus=true;
		}
	}).error(function(error) {
		

	});
	}
$scope.listtrips= function(){
		window.location.assign("/listtrips");
		/*$http({
			method : "GET",
			url : '/listtrips',
			
		}).success(function(data) {
			if(data.productApprovalStatus == 'Approved'){			
				window.location.assign("/productRequestList");
			}
		}).error(function(error) {});
	};*/
	
	};
	
	$scope.listalltrips= function(){
		window.location.assign("/listalltrips");
		/*$http({
			method : "GET",
			url : '/listtrips',
			
		}).success(function(data) {
			if(data.productApprovalStatus == 'Approved'){			
				window.location.assign("/productRequestList");
			}
		}).error(function(error) {});
	};*/
	
	}
	$scope.statspercustomer= function(){
		window.location.assign("/statspercustomer");
		/*$http({
			method : "GET",
			url : '/listtrips',
			
		}).success(function(data) {
			if(data.productApprovalStatus == 'Approved'){			
				window.location.assign("/productRequestList");
			}
		}).error(function(error) {});
	};*/
	
	}
	$scope.statsperdriver= function(){
		window.location.assign("/statsperdriver");
	};
	$scope.statsperarea= function(){
		window.location.assign("/statsperarea");
	};
	$scope.revenuestats= function(){
		window.location.assign("/revenuestats");
	}

	$scope.searchBill=function(){
			$scope.bills=false;
			$scope.truckstatus=true;
	
	};
});