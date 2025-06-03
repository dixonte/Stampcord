import { runtime, contextMenus, i18n } from "webextension-polyfill";

class Background {
    selectedText?: string | null;

    init() {
        /*
        Called when the item has been created, or when creation failed due to an error.
        We'll just log success/failure here.
        */
        function onCreated() {
            if (runtime.lastError) {
                console.log(`Error: ${runtime.lastError}`);
            }
        }
          
        contextMenus.create({
            id: "miSelectionParse",
            type: 'normal',
            title: i18n.getMessage("miSelectionParse"),
            contexts: ["selection"],
            command: '_execute_browser_action'
        }, onCreated);
    }
}

new Background().init();
