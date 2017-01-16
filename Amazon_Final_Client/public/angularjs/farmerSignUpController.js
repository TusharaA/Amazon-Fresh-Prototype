/**
 * http://usejsdoc.org/
 */
amazon.controller("FarmerSignUpController", function($scope,$http){
	$scope.existingEmail = true;
	$scope.unexpected_error = true;
	$scope.invalid_farmer_id=true;
	$scope.malformed_state=true;
	$scope.farmerSignUp = function() {
		$http({
			method : "POST",
			url : '/farmerSignUp',
			data : {
				"farmerId":$scope.farmerId,
				"firstName" : $scope.firstName,
				"lastName" : $scope.lastName,
				"address" : $scope.address,
				"city" : $scope.city,
				"state" : $scope.state,
				"zipCode" : $scope.zipCode,
				"phoneNumber" : $scope.phoneNumber,
				"emailId" : $scope.emailId,
				"password" : $scope.password
			}
		}).success(function(data){
			//checking the response data for statusCode
			if (data.farmerSignupStatus === 'ExistingEmail') {
				$scope.existingEmail = false;
				$scope.unexpected_error = true;
				$scope.invalid_farmer_id=false;

			}else if (data.farmerSignupStatus === "SuccesfullSignUp"){
				
				window.location.assign("/pendingProfile");
			}else if(data.farmerSignupStatus ==="invalid_farmer_id"){
				$scope.invalid_farmer_id=false;
				$scope.unexpected_error = true;
				$scope.existingEmail = true;
			}else if(data.farmerSignupStatus ==="malformed_state"){
				$scope.existingEmail = true;
				$scope.unexpected_error = true;
				$scope.invalid_farmer_id=true;
				$scope.malformed_state=false;
				
			}
			
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.existingEmail = true;
			
		});
	};
});