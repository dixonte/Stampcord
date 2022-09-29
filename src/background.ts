import { browser } from "webextension-polyfill-ts";

class Background {
    selectedText?: string | null;

    init() {
        /*
        Called when the item has been created, or when creation failed due to an error.
        We'll just log success/failure here.
        */
        function onCreated() {
            if (browser.runtime.lastError) {
                console.log(`Error: ${browser.runtime.lastError}`);
            }
        }
          
        browser.contextMenus.create({
            id: "miSelectionParse",
            type: 'normal',
            title: browser.i18n.getMessage("miSelectionParse"),
            contexts: ["selection"],
            command: '_execute_browser_action'
        }, onCreated);
    }
}

new Background().init();
