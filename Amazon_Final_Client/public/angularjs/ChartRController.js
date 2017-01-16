amazon.controller("ChartRController", function($scope,$http,$location){

	$scope.populate=function(stat)
	{
		console.log("AJAY");
		var sum=[];
		var date=[];
		var d=[];
		stat=JSON.parse(stat);
		console.log(stat[0]);
		for(var i=0;i<stat.length;i++){
			sum[i]=stat[i].sum;
			date[i]=stat[i].Bill_date;
			d=date[i].split('T');
			console.log(d[0]);
			date[i]=d[0];
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
            date
        ,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Revenue'
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
        name: "Amount",
        data: sum

    }]
});

	}
});
