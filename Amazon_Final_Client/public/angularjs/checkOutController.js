/**
 * http://usejsdoc.org/
 */
amazon.controller("checkOutController", function($scope,$http,$location){
		console.log("CheckOut Controller called");
//		$scope.checkout=true;
//		$scope.beforeChkOut=false;
	$scope.AfterChkOut=true;
	$scope.cancelorderflag=true;

	$scope.orderhistroy=function(){
		console.log("order histroy function called");
		$scope.custid=100000000
		$http({
			method : "POST",
			url : '/orderhistroy',
			data : {
			
				"custid":$scope.custid
				
			}
		}).success(function(data) {
			if(data.code == 200){
			
				console.log("code is"+data.code);
				//alert("order histroy found");
				$scope.searchResult = data.server_result;
			
				$scope.AfterChkOut=true;
				$scope.cancelorderflag=false;
				$scope.checkout=true;
				$scope.beforeChkOut=true;
			}
			else{
				
				alert("No Orders found");
				$scope.AfterChkOut=false;
				$scope.cancelorderflag=true;
				$scope.checkout=true;
				$scope.beforeChkOut=true;
			}
		}).error(function(error) {
			

		});
	}
	   $scope.cancelorder=function()
	   {
		console.log("cancel order function called"+$scope.billid);   
		$http({
			method : "POST",
			url : '/cancelorder',
			data : {
			
				"billid":$scope.billid
				
			}
		}).success(function(data) {
			if(data.code == 200){
			
				console.log("code is"+data.code);
				alert("order has been cancelled");
				//$scope.orderhistroy();
				window.location.assign("/customerProfile");
			}
			else{
				
				alert("This order can not be cancelled");
				$scope.AfterChkOut=false;
				$scope.cancelorderflag=true;
				$scope.checkout=true;
				$scope.beforeChkOut=true;
			}
		}).error(function(error) {
			

		});
	   };
	$scope.confirm=function(addToCart){
		var someDate = new Date();
		if($scope.date==2){
		var numberOfDaysToAdd = 2;
		someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
		console.log("if called 2 days shipping it is date is"+someDate);
		}
		else{
			var numberOfDaysToAdd = 4;
			someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
			console.log("date is"+someDate);	
		}
		
		//$scope.time=req.param("time");
		var cart=JSON.parse(addToCart)
		

//		for(i=0;i<addToCart.productList.length;i++)
//			{
//			var productId= addToCart.product[i].product;
//			}
//		var addToCart.product[];
		console.log("Product Name   "+ JSON.parse(addToCart));
		
		$http({
			method : "POST",
			url : '/checkoutconfirm',
			data : {
				"cart" : cart,
				"date" : someDate
			}
		}).success(function(data) {
			if(data.code == 200){
			
				console.log("code is"+data.code);
				$scope.AfterChkOut=false;
				$scope.checkout=true;
				$scope.beforeChkOut=true;
			}
			else{
				
				alert("Couldnt generate bill");
			}
		}).error(function(error) {
			

		});
		}
});