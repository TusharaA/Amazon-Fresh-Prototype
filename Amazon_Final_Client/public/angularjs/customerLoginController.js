/**
 * http://usejsdoc.org/
 */
amazon.controller("customerLoginController", function($scope,$http){
	$scope.accountDoesNtExist = true;
	$scope.unexpected_error = true;
	$scope.customerLogin = function() {
		$http({
			method : "POST",
			url : '/customerLogin',
			data : {
				"username":$scope.customerId,
				"password":$scope.password
			}
		}).success(function(data){
			//checking the response data for statusCode
			if (data.customerLoginStatus === "SuccesfulLogin") {
				window.location.assign("/customerProfile");
			}else if (data.customerLoginStatus === "AccountDoesNtExist"){
				$scope.accountDoesNtExist = false;
				$scope.unexpected_error = true;
			}else if(data.customerLoginStatus === "pending"){
				window.location.assign("/pendingProfile");
			}
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.existingEmail = true;
		});
	};
});