var DOMAIN_CATEGORY = {
    search : "search",
    news : "news",
    other : "other"
};

var BROWSING_MODE = {
    private : "private",
    normal : "normal"
}; 

var RUN_INTERVAL = 60;

var CHROME_TABS = ["newtab", "extensions"];

// Classes Start

function DomainTimeSpent(domainName, timeSpent){
    this.domainName = domainName,
    this.timeSpent = timeSpent
}

function DateActivity(date, domainActivityDetailsList){
    this.date = date,
    this.domainActivityDetailsList = domainActivityDetailsList // DomainActivityDetails
}

function getDomainNameById(domainId){
    var domainInformation  = JSON.parse(localStorage["act_domainInfo"]);
    for(var domain in domainInformation){
        if(domain.domainId == domainId){
            return domain.domainName;
        }
    }
}

function DomainActivityDetails(domainId, activeTimeSpent, backgroundTimeSpent, browsingMode, startTime, titleName){
    this.domainId = domainId,
    this.activeTimeSpent = activeTimeSpent,
    this.backgroundTimeSpent = backgroundTimeSpent,
    this.browsingMode = browsingMode,
    this.startTime = startTime,
    this.titleName = titleName 


    hoursSpent = function(){
        return this.activeTimeSpent/360.0;
    }

    minutesSpent = function(){
        return this.activeTimeSpent/60.0;
    }
}

function domainInfo(domainName){
    this.domainId = parseInt(localStorage["act_domainCount"])+1,
    this.domainName = domainName,
    this.category = DOMAIN_CATEGORY.other
}

// End Classes

function ReturnDateActivityObject(date){
    var activityList = JSON.parse(localStorage["act_activityInfo"]);
    for(var i = activityList.length - 1; i > -1; i-- ){
        var dateActivity = activityList[i];
        if(dateActivity.date == date){
            return [i,dateActivity];
        }
    }
    var newdateActivity = new DateActivity(date, null);
    activityList.push(newdateActivity);
    localStorage["act_activityInfo"] = JSON.stringify(activityList);
    return [activityList.length-1, newdateActivity];
}

function createStorageSpaces(){
    if(!localStorage["act_domainCount"]){
        localStorage["act_domainCount"] = 0;
    }

    if(!localStorage["act_domainInfo"]){
        localStorage["act_domainInfo"] = JSON.stringify(new Array());
    }
    
    if(!localStorage["act_activityInfo"]){
        localStorage["act_activityInfo"] = JSON.stringify(new Array());
    }
}

createStorageSpaces();

function chk_domainExist(domainName){
    var existingDomainsList = JSON.parse(localStorage["act_domainInfo"]);
    if(existingDomainsList.length == 0){
        return false;
    }else{
        var domainObject = returnDomain(domainName);
        return domainObject != null ? true : false;
    }
}

function returnDomain(domainName){
    var existingDomainsList = JSON.parse(localStorage["act_domainInfo"]);
    if(existingDomainsList.length == 0){
        return null;
    }else{
        for(var i = existingDomainsList.length - 1; i > -1; i-- ){
            var currentDomain = existingDomainsList[i];
            if(currentDomain.domainName == domainName){
                return currentDomain;
            }
        }
        return null;
    }
}

function insertNewDomain(domainName){
    if(!chk_domainExist(domainName)){
        var newDomainInfo = domainInfo(domainName);
        var domainsList = JSON.parse(localStorage["act_domainInfo"]);
        domainsList.push(newDomainInfo);
        localStorage["act_domainInfo"] = JSON.stringify(domainsList);
        localStorage["act_domainCount"] = localStorage["act_domainCount"] + 1;
    }
}

function retrieveDomainFromStorage(domainName){
    var domainsList = JSON.parse(localStorage["act_domainInfo"]);
    if(!chk_domainExist(domainName)){
        var newDomainInfo = new domainInfo(domainName);
        domainsList.push(newDomainInfo);
        localStorage["act_domainInfo"] = JSON.stringify(domainsList);
        localStorage["act_domainCount"] = parseInt(localStorage["act_domainCount"]) + 1;
        return newDomainInfo;
    }else{
        return returnDomain(domainName);
    }
}

function getDomain(url){
    if(url){
        return url.split(/\/\/|[?#\/]/)[1];
    }else{
        return "";
    }
}

function updateStorage(){
    var currentDate = getDate();
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                updateStorageForTab(tab, currentDate);
            });
        });
    });  
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

function updateStorageForTab(tab, currentDate){
    var domainName = getDomain(tab.url);
    var titleName = tab.title;
    if(CHROME_TABS.indexOf(domainName) == -1){
        var domainObject = retrieveDomainFromStorage(domainName);
        // Transfer to other
        var [dateActivityObjectIndex, dateActivityObject] = ReturnDateActivityObject(currentDate);
        var domainActivityDetailsList = dateActivityObject.domainActivityDetailsList;
        var activities = JSON.parse(localStorage["act_activityInfo"]);
        if(domainActivityDetailsList){
            for(var i = domainActivityDetailsList.length - 1; i > -1; i-- ){
                var domainActivityObject = domainActivityDetailsList[i];
                if(domainActivityObject.domainId == domainObject.domainId && domainActivityObject.titleName == titleName){
                    if(tab.active){
                        domainActivityObject.activeTimeSpent += RUN_INTERVAL;
                    }else{
                        domainActivityObject.backgroundTimeSpent += RUN_INTERVAL; 
                    }
                    domainActivityDetailsList[i] = domainActivityObject;
                    activities[dateActivityObjectIndex].domainActivityDetailsList =  domainActivityDetailsList;
                    localStorage["act_activityInfo"] = JSON.stringify(activities);
                    return;
                }
            }
        }
        // No DomainObject Found...
        var browsingMode = tab.incognito ? BROWSING_MODE.private : BROWSING_MODE.normal;
        var domainActivityObj = new DomainActivityDetails(domainObject.domainId, 0, 0, browsingMode, new Date(), titleName);
        if(!activities[dateActivityObjectIndex].domainActivityDetailsList){
            activities[dateActivityObjectIndex].domainActivityDetailsList = [];
        }
        activities[dateActivityObjectIndex].domainActivityDetailsList.push(domainActivityObj);
        localStorage["act_activityInfo"] = JSON.stringify(activities);
        return;
    }
}

setInterval(updateStorage, RUN_INTERVAL*1000);