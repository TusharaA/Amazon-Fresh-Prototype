/**
 * http://usejsdoc.org/
 */
amazon.controller("AdminLoginController", function($scope,$http){
	$scope.accountDoesNtExist = true;
	$scope.unexpected_error = true;
	$scope.adminLogin = function() {
		$http({
			method : "POST",
			url : '/adminLogin',
			data : {
				"username":$scope.username,
				"password":$scope.password
			}
		}).success(function(data){
			//checking the response data for statusCode
			if (data.adminLoginStatus === "SuccesfulLogin") {
				window.location.assign("/adminProfile");
			}else if (data.adminLoginStatus === "AccountDoesNtExist"){
				$scope.accountDoesNtExist = false;
				$scope.unexpected_error = true;
			}
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.existingEmail = true;
		});
	};
});