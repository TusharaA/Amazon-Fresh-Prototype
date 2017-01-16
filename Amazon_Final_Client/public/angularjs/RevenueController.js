amazon.controller("RevenueController", function($scope,$http,$location){
	$scope.submit=function()
	{
		console.log(document.getElementById('date1').value);
		console.log(document.getElementById('date2').value);
		var sdate=document.getElementById('date1').value;
		var edate=document.getElementById('date2').value
		$http({
			method : "POST",
			url : '/revenuestat',
			data : {
				"sdate":sdate,
				"edate":edate
			}
		}).success(function(data) {
			console.log(data);
			console.log(data.Status);
			if(data.Status == "Approved")
			{
			window.location.assign('revenuestat');
	      	}
			else{
				
				//alert("Something went wrong");
			}
		}).error(function(error) {
		});
	}
});