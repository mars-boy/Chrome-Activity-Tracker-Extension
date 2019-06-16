import { DomainInfo, Enum_STORAGE, DomainTimeSpent} from '../js/models.js';
import { get_domain_name_by_id, get_utc_date,get_activity_info_by_date  } from '../js/utils.js';

var activityList = JSON.parse(localStorage[Enum_STORAGE.ACTIVITY_INFO]);

function activeHoursSpentByDomain(date){
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
            var domTimeObject = [domainName, v];
            returnObject.push(domTimeObject);
        }
        return returnObject; 
    }
    return [["None", 0]];
}

function drawChart(){
    var data = activeHoursSpentByDomain(get_utc_date());
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


google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

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

document.getElementById('importButton').addEventListener('click', ImportData, false);