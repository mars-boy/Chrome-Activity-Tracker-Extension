var activityList = JSON.parse(localStorage["act_activityInfo"]);

function domainInfo(domainName){
    this.domainId = parseInt(localStorage["act_domainCount"])+1,
    this.domainName = domainName,
    this.category = DOMAIN_CATEGORY.other
}

function getDomainNameById(domainId){
    var domainInformation  = JSON.parse(localStorage["act_domainInfo"]);
    for(var i = domainInformation.length - 1; i > -1; i--){
        var domain = domainInformation[i];
        if(domain.domainId == domainId){
            return domain.domainName;
        }
    }
    return "";
}

function DomainTimeSpent(domainName, timeSpent){
    this.domainName = domainName,
    this.timeSpent = timeSpent
}

function ReturnDateActivityObject(date){
    var activityList = JSON.parse(localStorage["act_activityInfo"]);
    for(var i = activityList.length - 1; i > -1; i-- ){
        var dateActivity = activityList[i];
        if(dateActivity.date == date){
            return [i,dateActivity];
        }
    }
}

function getDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
}

function activeHoursSpentByDomain(date){
    var domainActivityDetailsList =  ReturnDateActivityObject(date)[1].domainActivityDetailsList;
    var domainTimeSpentMap = new Map();
    if(domainActivityDetailsList && domainActivityDetailsList.length > 0){
        for(var i = domainActivityDetailsList.length - 1; i > -1; i--){
            var domainId = domainActivityDetailsList[i].domainId;
            if(domainTimeSpentMap.has(domainId)){
                var valueToStore = domainTimeSpentMap.get(domainId)+
                                        domainActivityDetailsList[i].activeTimeSpent;
                domainTimeSpentMap.set(domainId, valueToStore);
            }else{
                domainTimeSpentMap.set(domainId, domainActivityDetailsList[i].activeTimeSpent);
            }
        }
        var returnObject = [];
        for(var [k,v] of  domainTimeSpentMap){
            var domainName = getDomainNameById(k);
            var domTimeObject = [domainName, v];
            returnObject.push(domTimeObject);
        }
        return returnObject; 
    }
    return [["None", 0]];
}

function drawChart(){
    var data = activeHoursSpentByDomain(getDate());
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

ImportData = function(){
    var backUpJson = {
        "domainCount" : localStorage['act_domainCount'],
        "domainInfo" : localStorage['act_domainInfo'],
        "activityInfo" : localStorage['act_activityInfo']
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