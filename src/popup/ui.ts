import { browser } from "webextension-polyfill-ts";
import { BackgroundMessages } from '../messages';
import { Messenger } from '../messenger';

import * as chrono from 'chrono-node';

class UI {
    async init() {
        const response = await Messenger.sendMessageToBackground(BackgroundMessages.GET_PLAINTEXT);
        
        (<HTMLInputElement>document.getElementById("plaintext")).value = response;
    }
}

new UI().init();