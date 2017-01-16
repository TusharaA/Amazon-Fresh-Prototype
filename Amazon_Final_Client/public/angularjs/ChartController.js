amazon.controller("ChartController", function($scope,$http,$location){

	$scope.populate=function(count,id)
	{
		console.log("AJAY");
		count=parseInt(count);
		console.log(count+"1"+id);
		
		var chart = new Highcharts.Chart({
            colors: ["#7cb5ec", "#f7a35c"],
            chart: {
                type: 'column',
                renderTo: 'container'
            },
    title: {
        text: 'Statistics'
    },
    subtitle: {
        text: 'Amazon DB'
    },
    xAxis: {
        categories: [
            id
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Number of trips'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.3f} </b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: "Rides",
        data: [count]

    }]
});

	}
});
