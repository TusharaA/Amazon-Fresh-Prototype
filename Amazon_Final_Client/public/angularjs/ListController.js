amazon.controller("ListController", function($scope,$http,$location){

$scope.Trip=function(trip){
	console.log(JSON.stringify(trip));
	$http({
		method : "POST",
		url : '/tripmap',
		data : {
			"tripId":trip
		}
	}).success(function(data) {
		console.log(data);
		if(data.Status == 'Approved'){			
			window.location.assign("/tripmaps");
		}
	}).error(function(error) {});
};

});