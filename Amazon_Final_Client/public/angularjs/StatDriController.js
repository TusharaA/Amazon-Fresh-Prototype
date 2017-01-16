amazon.controller("StatDriController", function($scope,$http,$location){
	$scope.Trip=function(dri){
		console.log(JSON.stringify(dri));
		$http({
			method : "POST",
			url : '/stattripdri',
			data : {
				"driid":dri
			}
		}).success(function(data) {
			console.log(data);
			if(data.Status == 'Approved'){			
				window.location.assign("/dristat");
			}
		}).error(function(error) {});
	}
});