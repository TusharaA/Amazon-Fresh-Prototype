amazon.controller("StatCustController", function($scope,$http,$location){
	$scope.Trip=function(cust){
		console.log(JSON.stringify(cust));
		$http({
			method : "POST",
			url : '/stattripcust',
			data : {
				"custid":cust
			}
		}).success(function(data) {
			console.log(data);
			if(data.Status == 'Approved'){			
				window.location.assign("/custstat");
			}
		}).error(function(error) {});
	};
});