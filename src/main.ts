'use strict';

import { browser } from "webextension-polyfill-ts";

class Background {
    init() {
        const chrono = require('chrono-node');

        /*
        Called when the item has been created, or when creation failed due to an error.
        We'll just log success/failure here.
        */
        function onCreated() {
            if (browser.runtime.lastError) {
                console.log(`Error: ${browser.runtime.lastError}`);
            } else {
                console.log("Item created successfully");
            }
        }
          
        /*
        Called when the item has been removed.
        We'll just log success here.
        */
        function onRemoved() {
            console.log("Item removed successfully");
        }
          
        /*
        Called when there was an error.
        We'll just log the error here.
        */
        function onError(error) {
            console.log(`Error: ${error}`);
        }
        
        browser.contextMenus.create({
            id: "log-selection",
            type: 'normal',
            title: browser.i18n.getMessage("menuItemSelectionLogger"),
            contexts: ["selection"]
        }, onCreated);
        
        browser.contextMenus.onClicked.addListener((info, tab) => {
            switch (info.menuItemId) {
                case "log-selection":
                    browser.browserAction.openPopup();
                    let date = chrono.parseDate(info.selectionText);
                    console.log(date);
                    
                    let unixTimestamp = Math.floor(date.getTime() / 1000);
                    console.log(unixTimestamp);
                    break;
            }
        });
    }
}

new Background().init();
