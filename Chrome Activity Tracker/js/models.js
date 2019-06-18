var domain_count = 1;

class DomainActivityDetails{
    constructor(domain_id, active_time_spent, background_time_spent, browsing_mode, start_time, title_name){
        this.domain_id = domain_id,
        this.active_time_spent = active_time_spent,
        this.background_time_spent = background_time_spent,
        this.browsing_mode = browsing_mode,
        this.start_time = start_time,
        this.title_name = title_name 
    }

    hoursSpent(){
        return this.active_time_spent/360.0;
    }

    minutesSpent(){
        return this.active_time_spent/60.0;
    }
}

class DateActivity{
    constructor(date,domain_activity_details_list){
        this.date = date;
        this.domain_activity_details_list = domain_activity_details_list;
    }
}

class DomainInfo{
    constructor(domain_name){
        var current_count = JSON.parse(localStorage[Enum_STORAGE.DOMAIN_COUNT_INFO]);
        localStorage[Enum_STORAGE.DOMAIN_COUNT_INFO] = JSON.stringify(current_count+1);
        this.domain_id = current_count+1;
        this.domain_name = domain_name;
        this.category = Enum_DOMAIN_CATEGORY.OTHER;
    }
}

class DomainTimeSpent{
    constructor(domain_name, time_spent){
        this.domain_name = domain_name;
        this.time_spent = time_spent;
    }
}

class DataFormatForChart{
    constructor(label, value){
        this.label = label;
        this.value = value;
    }

    GoogleChartFormat(){
        return [this.label, this.value];
    }

    D3JsFormat(){
        return { "label": this.label , "value": this.value }
    }
}

// Regions for enums

const Enum_DOMAIN_CATEGORY = {
    SEARCH : "search",
    NEWS : "news",
    OTHER : "other"
};

const Enum_BROWSING_MODE = {
    PRIVATE : "private",
    NORMAL : "normal"
}; 

const Enum_STORAGE = {
    DOMAIN_INFO : 'act_domain_info',
    ACTIVITY_INFO : 'act_activity_info',
    DOMAIN_COUNT_INFO : 'act_domain_count_info'
};

const Enum_Chart_Type = {
    GOOGLE_CHARTS : 0,
    D3_Charts : 1
}

const Enum_CHROME_INVALID_TABS = ["newtab", "extensions","settings"];

const CON_RUN_INTERVAL = 60;

export {
    DomainTimeSpent,
    DateActivity,
    DomainInfo,
    DomainActivityDetails,
    DataFormatForChart,

    Enum_DOMAIN_CATEGORY,
    Enum_BROWSING_MODE,
    Enum_STORAGE,
    Enum_CHROME_INVALID_TABS,
    Enum_Chart_Type,

    CON_RUN_INTERVAL
}
