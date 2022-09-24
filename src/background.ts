import { browser } from "webextension-polyfill-ts";
import { BackgroundMessages } from './messages';

//import * as chrono from 'chrono-node';

class Background {
    selectedText?: string | null;

    requests = new Map();

    async receiveGetPlaintext(sender, data) {
        //console.log("Background: Message from", sender, data);

        let temp = this.selectedText;
        this.selectedText = null;

        return temp;
    }

    registerMessengerRequests() {
        this.requests.set(BackgroundMessages.GET_PLAINTEXT, this.receiveGetPlaintext.bind(this));
    }
    
    listenForMessages() {
        browser.runtime.onMessage.addListener((message, sender) => {
            const { type, data } = message;
            return this.requests.get(type)(sender, data);
        });
    }

    init() {
        this.registerMessengerRequests();
        this.listenForMessages();

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
            id: "miSelectionParse",
            type: 'normal',
            title: browser.i18n.getMessage("miSelectionParse"),
            contexts: ["selection"]
        }, onCreated);
        
        browser.contextMenus.onClicked.addListener(async (info, tab) => {
            switch (info.menuItemId) {
                case "miSelectionParse":
                    this.selectedText = info.selectionText;
                    await browser.browserAction.openPopup();

                    // let date = chrono.parseDate(info.selectionText || "");
                    // console.log(date);
                    
                    // let unixTimestamp = Math.floor(date.getTime() / 1000);
                    // console.log(unixTimestamp);
                    break;
            }
        });
    }
}

new Background().init();
