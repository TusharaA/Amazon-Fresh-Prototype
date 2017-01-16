
amazon.controller('customerProfileController', function($scope, $http) {	
	$scope.count=0;
	$scope.rating=3;
	$scope.productQuantity=1;
	$scope.discount=true;
	$scope.constant=1;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	today = mm+'-'+dd;
	console.log("today's date is"+today);
	var xmas='05-01';
	var new_year='01-01';
    var independence_day='07-04';
	
	if(today==xmas||today==new_year||today==independence_day){
	
		$scope.constant=0.6;
		console.log("discont offer will be available");
		$scope.discount=false;	
	}
	else{
		$scope.discount=true;
	}
	$scope.addProductToCart = function(productId,productName,productPrice,farmerId) {
		$http({
			method : "POST",
			url : '/addCart',
			data : {
				"productId" : productId,
				"productName" : productName,
				"productPrice":productPrice,
				"farmerId" : farmerId,
				"productQuantity":$scope.productQuantity
			}
		}).success(function(data) {
			if(data.addCartStatus == 200){
			window.location.assign('/customerProfile');
			}
		}).error(function(error) {
		});
	};

	$scope.checkout = function(productId,productName,productPrice,farmerId) {
		$http({
			method : "POST",
			url : '/checkout',
			data : {
			}
		}).success(function(data) {
			if(data.checkoutStatus === 200)
				window.location.assign('/viewFinalBill');
		}).error(function(error) {
		});
	};

	$scope.displayIndividualProduct = function(productId,productName,productPrice,productQuantity,productDescription,productCategory,productAvgRatings,farmerId,imgpath){ 
		//alert("clicked");
		$http({
			method : "POST",
			url : '/productDetails',
			data : {
				"productId" : productId,
				"productName" : productName,
				"productPrice":productPrice,
				"productQuantity":productQuantity,
				"productDescription":productDescription,
				"productCategory":productCategory,
				"productAvgRatings":productAvgRatings,
				"farmerId" : farmerId,
				"imgpath":imgpath
			
			}
		}).success(function(data){
			if(data.viewIndividualProductsStatus === "200") {
				window.location.assign('/displayProductDetails');
			}
		}).error(function(error) {
		});
	};

	$scope.submitReview = function(productId,farmerId) {
		$http({
			method : "POST",
			url : '/addProductReview',
			data : {
				"reviewComments" : $scope.reviewComments,
				"productId":productId,
				"farmerId":farmerId,
				"rating":$scope.rating
			}
		}).success(function(data) {
			if(data.reviewPostStatus === "PostedReview"){
				window.location.assign("/customerProfile");
			}else
				window.location.assign("/");
		}).error();
	};
	
	$scope.load = function(loadCount) {
		$http({
			method : "POST",
			url : '/loadNext',
			data : {
				"loadCount" : loadCount
			}
		}).success(function(data) {
				window.location.assign("/customerProfile");
		}).error();
	};
	
	$scope.loadSearch = function(loadCountSearch) {
		$http({
			method : "POST",
			url : '/loadNextSearch',
			data : {
				"loadCountSearch" : loadCountSearch
			}
		}).success(function(data) {
				window.location.assign("/searchProduct");
		}).error();
	};
	
	
	
});


