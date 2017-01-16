amazon.controller("StatAreaController", function($scope,$http,$location){
	$scope.Trip=function(cust){
		console.log(JSON.stringify(cust));
		$http({
			method : "POST",
			url : '/stattriparea',
			data : {
				"zip":cust
			}
		}).success(function(data) {
			console.log(data);
			if(data.Status == 'Approved'){			
				window.location.assign("/areastat");
			}
		}).error(function(error) {});
	};
	
	$scope.Trips=function(){
		window.location.assign("/allareastat");
	}
});