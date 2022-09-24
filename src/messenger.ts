// Messenger.ts
import { browser } from "webextension-polyfill-ts";

export const Messenger = {
    async sendMessageToBackground(type, data = null) {
        try {
            const response = await browser.runtime.sendMessage({ type, data });
            return response;
        } catch (error) {
            console.error("sendMessageToBackground error: ", error);
            return null;
        }
    },

    async sendMessageToContentScript(tabID, type, data = null) {
        try {
            const response = await browser.tabs.sendMessage(tabID, { type, data });
            return response;
        } catch (error) {
            console.error("sendMessageToForeground error: ", error);
            return null;
        }
    },
};
