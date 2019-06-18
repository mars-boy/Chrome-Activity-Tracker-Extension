import { DomainInfo, Enum_STORAGE, DomainTimeSpent,DataFormatForChart,Enum_Chart_Type} from '../js/models.js';
import { get_domain_name_by_id, get_utc_date,get_activity_info_by_date  } from '../js/utils.js';

var activityList = JSON.parse(localStorage[Enum_STORAGE.ACTIVITY_INFO]);

function activeHoursSpentByDomain(date,chartType){
    var domainActivityDetailsList =  get_activity_info_by_date(date).domain_activity_details_list;
    var domainTimeSpentMap = new Map();
    if(domainActivityDetailsList && domainActivityDetailsList.length > 0){
        for(var i = domainActivityDetailsList.length - 1; i > -1; i--){
            var domainId = domainActivityDetailsList[i].domain_id;
            if(domainTimeSpentMap.has(domainId)){
                var valueToStore = domainTimeSpentMap.get(domainId)+
                                        domainActivityDetailsList[i].active_time_spent;
                domainTimeSpentMap.set(domainId, valueToStore);
            }else{
                domainTimeSpentMap.set(domainId, domainActivityDetailsList[i].active_time_spent);
            }
        }
        var returnObject = [];
        for(var [k,v] of  domainTimeSpentMap){
            var domainName = get_domain_name_by_id(k);
            var domTimeObject;
            if(chartType == Enum_Chart_Type.GOOGLE_CHARTS){
                domTimeObject = new DataFormatForChart(domainName, v).GoogleChartFormat();
            }else if(chartType == Enum_Chart_Type.D3_Charts){
                domTimeObject = new DataFormatForChart(domainName, v).D3JsFormat();
            }
            
            returnObject.push(domTimeObject);
        }
        return returnObject; 
    }
    var domTimeObject;
    if(chartType == Enum_Chart_Type.GOOGLE_CHARTS){
        domTimeObject = new DataFormatForChart('None', 0).GoogleChartFormat();
    }else if(chartType == Enum_Chart_Type.D3_Charts){
        domTimeObject = new DataFormatForChart('None', 0).D3JsFormat();
    }
    return [domTimeObject];
}

// function drawChart(){
//     var data = activeHoursSpentByDomain(get_utc_date());
//     var googleChartFormatData = new google.visualization.DataTable();
//     googleChartFormatData.addColumn('string', 'Domain');
//     googleChartFormatData.addColumn('number', 'Time Spent');
//     googleChartFormatData.addRows(data);
//     var options = {
//         title: 'My chrome activity',
//         'width':300,
//         'height':300
//     };
//     var chart = new google.visualization.PieChart(document.getElementById('chartDiv'));
//     chart.draw(googleChartFormatData, options);
// }


// google.charts.load('current', {'packages':['corechart']});
// google.charts.setOnLoadCallback(drawChart);

function drawChart(chartType){
    if(chartType == Enum_Chart_Type.D3_Charts)
    {
        load_for_d3_chart();
    }else if(chartType == Enum_Chart_Type.GOOGLE_CHARTS){
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(load_for_google_chart);
    }
}

function load_for_google_chart(){
    var data = activeHoursSpentByDomain(get_utc_date(), Enum_Chart_Type.GOOGLE_CHARTS);
    var googleChartFormatData = new google.visualization.DataTable();
    googleChartFormatData.addColumn('string', 'Domain');
    googleChartFormatData.addColumn('number', 'Time Spent');
    googleChartFormatData.addRows(data);
    var options = {
        title: 'My chrome activity',
        'width':300,
        'height':300
    };
    var chart = new google.visualization.PieChart(document.getElementById('chartDiv'));
    chart.draw(googleChartFormatData, options);
}

function load_for_d3_chart(){
    var data = activeHoursSpentByDomain(get_utc_date(), Enum_Chart_Type.D3_Charts);
    debugger;
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 75;
    var div = d3.select("body").append("div")
     .attr("class", "tooltip-donut")
     .style("opacity", 0);
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var svg = d3.select('#chartDiv')
     .append('svg')
     .attr('width', width)
     .attr('height', height)
     .append('g')
     .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
     var arc = d3.arc()
     .innerRadius(radius - donutWidth)
     .outerRadius(radius);
     var pie = d3.pie()
     .value(function (d) {
          return d.value;
     })
     .sort(null);
     var path = svg.selectAll('path')
     .data(pie(data))
     .enter()
     .append('path')
     .attr('d', arc)
     .attr('fill', function (d, i) {
          return color(d.data.label);
     })
     .attr('transform', 'translate(0, 0)')
     .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '.85');
        div.transition()
             .duration(50)
             .style("opacity", 1);
        let num = d.data.label+'-'+d.value;
        div.html(num)
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY - 15) + "px");
    })
   .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
        div.transition()
             .duration('50')
             .style("opacity", 0);
   });
}

drawChart(Enum_Chart_Type.D3_Charts);

function ImportData(){
    var backUpJson = {
        "domainInfo" : localStorage[Enum_STORAGE.DOMAIN_INFO],
        "activityInfo" : localStorage[Enum_STORAGE.ACTIVITY_INFO]
    };
    var currentDateTime = new Date().toLocaleString();
    var fileName = "ChromeActivity till "+currentDateTime +".json";
    var fileContent = JSON.stringify(backUpJson);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


  const mainButton = document.getElementById('GraphTabDiv');
  const mapButton = document.getElementById('MapTabDiv');

  mainButton.addEventListener('click', (event) => {  
    var tabContentShowPromise = Show_Tab_Content('Main');
  });

  mapButton.addEventListener('click', (event) => {  
    var tabContentShowPromise = Show_Tab_Content('Map');
  });


  function Hide_And_Inactive_All_Tabs(){
      var tabcontent,i,tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
  }

  function Show_Tab_Content(tabId){
    var hideTabsPromise = Hide_And_Inactive_All_Tabs();
    document.getElementById(tabId).style.display = "block";
  }



document.getElementById('importButton').addEventListener('click', ImportData, false);