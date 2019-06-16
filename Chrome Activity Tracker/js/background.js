import { CON_RUN_INTERVAL } from '../js/models.js';
import { update_storage, createStorageSpaces } from '../js/utils.js';


createStorageSpaces();
setInterval(update_storage, CON_RUN_INTERVAL*1000);