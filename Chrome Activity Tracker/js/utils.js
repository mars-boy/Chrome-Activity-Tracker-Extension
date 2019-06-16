import {
    DomainTimeSpent,
    DateActivity,
    DomainInfo,
    DomainActivityDetails,

    Enum_DOMAIN_CATEGORY,
    Enum_BROWSING_MODE,
    Enum_STORAGE,
    Enum_CHROME_INVALID_TABS,

    CON_RUN_INTERVAL
} from '../js/models.js';


function createStorageSpaces(){
    if(!localStorage[Enum_STORAGE.DOMAIN_INFO]){
        localStorage[Enum_STORAGE.DOMAIN_INFO] = JSON.stringify(new Array());
    }
    if(!localStorage[Enum_STORAGE.ACTIVITY_INFO]){
        localStorage[Enum_STORAGE.ACTIVITY_INFO] = JSON.stringify(new Map());
    }
}

function update_storage(){
    var current_date = get_utc_date();
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                update_storage_for_tab(tab, current_date);
            });
        });
    });
}

function get_domain_info(domain_name){
    let domain_objects = JSON.parse(localStorage[Enum_STORAGE.DOMAIN_INFO]);
    for(var i = domain_objects.length - 1; i > -1; i-- ){
        if(domain_objects[i].domain_name == domain_name){
            return domain_objects[i];
        }
    }
    var new_domain = new DomainInfo(domain_name);
    domain_objects.push(new_domain);
    localStorage[Enum_STORAGE.DOMAIN_INFO] = JSON.stringify(domain_objects);
    return new_domain;
}

function get_activity_info_by_date(date_passed){
    var activity_info_all_dates = JSON.parse(localStorage[Enum_STORAGE.ACTIVITY_INFO]);
    var activity_info_for_passed_date = activity_info_all_dates[date_passed] == undefined ?
         new DateActivity(date_passed, []) : activity_info_all_dates[date_passed];
    return activity_info_for_passed_date;
}

function update_storage_for_tab(tab, current_date){
    let domain_name = get_domain_from_url(tab.url);
    let title_name = tab.title;
    if(Enum_CHROME_INVALID_TABS.indexOf(domain_name) == -1){
        var domain_object = get_domain_info(domain_name);
        var current_date_activity = get_activity_info_by_date(current_date);
        var activities = JSON.parse(localStorage[Enum_STORAGE.ACTIVITY_INFO]);
        if(current_date_activity.domain_activity_details_list.length > 0){
            var domain_activitity_list_for_date  = current_date_activity.domain_activity_details_list;
            for(var i = domain_activitity_list_for_date.length - 1; i > -1; i-- ){
                if(domain_object.domain_name == domain_name && 
                    domain_activitity_list_for_date[i].title_name == title_name){
                        if(tab.active){
                            domain_activitity_list_for_date[i].active_time_spent += CON_RUN_INTERVAL;
                        }else{
                            if(tab.audible){
                                domain_activitity_list_for_date[i].background_time_spent += CON_RUN_INTERVAL; 
                            }
                        }
                        current_date_activity.domain_activity_details_list = domain_activitity_list_for_date;
                        activities[current_date] = current_date_activity;
                        localStorage[Enum_STORAGE.ACTIVITY_INFO] = JSON.stringify(activities);
                        return;
                }
            }
        }
        var browsing_mode = tab.incognito ? Enum_BROWSING_MODE.PRIVATE : Enum_BROWSING_MODE.NORMAL;
        var domainActivityObj = new DomainActivityDetails(domain_object.domain_id, 0, 0,
             browsing_mode, get_utc_date(true), title_name);
        activities[current_date] = current_date_activity;
        activities[current_date].domain_activity_details_list.push(domainActivityObj);
        localStorage[Enum_STORAGE.ACTIVITY_INFO] = JSON.stringify(activities);
        return;
    }
}

function get_domain_name_by_id(domain_id){
    var domain_datas = JSON.parse(localStorage[Enum_STORAGE.DOMAIN_INFO]);
    for(var i = domain_datas.length - 1; i > -1; i--){
        var domain = domain_datas[i];
        if(domain.domain_id == domain_id){
            return domain.domain_name;
        }
    }
    return "";
}

// General utils

function get_domain_from_url(url){
    if(url){
        return url.split(/\/\/|[?#\/]/)[1];
    }else{
        return '';
    }
}

function get_utc_date(isTimeRequired){
    var today = new Date();
    var utc_date = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
                        today.getUTCHours(), today.getUTCMinutes());
    utc_date = new Date(utc_date);
    var dd = utc_date.getDate();
    var mm = utc_date.getMonth()+1;
    var yyyy = utc_date.getFullYear();
    if(dd<10){
        dd=`0${dd}`;
    } 
    if(mm<10){
        mm=`0${mm}`;
    } 
    var return_str = `${dd}/${mm}/${yyyy}`;
    if(isTimeRequired){
        return_str = `${dd}/${mm}/${yyyy} ${utc_date.getHours()}:${utc_date.getMinutes()}`
    }
    return return_str;
}


export {
    createStorageSpaces,
    get_domain_name_by_id,
    update_storage,
    get_utc_date,
    get_activity_info_by_date
}