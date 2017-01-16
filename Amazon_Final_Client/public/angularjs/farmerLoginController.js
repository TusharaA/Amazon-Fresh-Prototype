
amazon.controller("FarmerLoginController", function($scope,$http){
	$scope.accountDoesNtExist = true;
	$scope.unexpected_error = true;
	$scope.farmerLogin = function() {
		$http({
			method : "POST",
			url : '/farmerLogin',
			data : {
				"username":$scope.farmerId,
				"password":$scope.password
			}
		}).success(function(data){
			//checking the response data for statusCode
			if (data.farmerLoginStatus === "SuccesfulLogin") {
				window.location.assign("/farmerProfile");
			}else if (data.farmerLoginStatus === "AccountDoesNtExist"){
				$scope.accountDoesNtExist = false;
				$scope.unexpected_error = true;
			}else if(data.farmerLoginStatus === "pending"){
				window.location.assign("/pendingProfile");
			}
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.existingEmail = true;
		});
	};
});