/**
 * http://usejsdoc.org/
 */
amazon.controller("CustomerSignUpController", function($scope,$http){
	$scope.existingEmail = true;
	$scope.unexpected_error = true;
	$scope.invalid_customer_id=true;
	$scope.malformed_state=true;
		
	$scope.customerSignUp=function(){
		$http({
			method : "POST",
			url : '/customerSignUp',
			data : {
				"customerId":$scope.customerId,
				"firstName" : $scope.firstName,
				"lastName" : $scope.lastName,
				"address" : $scope.address,
				"city" : $scope.city,
				"state" : $scope.state,
				"zipCode" : $scope.zipCode,
				"phoneNumber" : $scope.phoneNumber,
				"emailId" : $scope.emailId,
				"password" : $scope.password,
				"ccNo":$scope.ccNo1+$scope.ccNo2+$scope.ccNo3+$scope.ccNo4,
				"ccv":$scope.ccv,
				"ExpiryMonth":$scope.ExpiryMonth,
				"ExpiryYear":$scope.ExpiryYear
			}
		}).success(function(data){
			//checking the response data for statusCode
			if (data.customerSignupStatus === 'ExistingEmail') {
				$scope.existingEmail = false;
				$scope.unexpected_error = true;
				$scope.invalid_customer_id=false;

			}else if (data.customerSignupStatus === "SuccesfullSignUp"){
				window.location.assign("/pendingProfile");
			}else if(data.customerSignupStatus ==="invalid_customer_id"){
				$scope.invalid_customer_id=false;
				$scope.unexpected_error = true;
				$scope.existingEmail = true;
			}else if(data.customerSignupStatus ==="malformed_state"){
				$scope.existingEmail = true;
				$scope.unexpected_error = true;
				$scope.invalid_customer_id=true;
				$scope.malformed_state=false;
				
			}
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.existingEmail = true;
			
		});
	};
});
