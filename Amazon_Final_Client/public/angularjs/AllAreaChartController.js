amazon.controller("AllAreaChartController", function($scope,$http,$location){

	$scope.populate=function(stat)
	{
		console.log("AJAY");
		var count=[];
		var zip=[];
		stat=JSON.parse(stat);
		console.log(stat[0]);
		for(var i=0;i<stat.length;i++){
			count[i]=stat[i].count;
			zip[i]=stat[i].DROPOFF_ZIP;
		}
		
		
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
        categories: 
            zip
        ,
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
        data: count

    }]
});

	}
});
