import { browser } from "webextension-polyfill-ts";
import { BackgroundMessages } from '../messages';
import { Messenger } from '../messenger';

import chrono from 'chrono-node';

class UI {
    readonly tbPlaintext = <HTMLInputElement>document.getElementById("plaintext");
    readonly dtDateTime = <HTMLInputElement>document.getElementById("datetime");
    readonly cbxTimeZone = <HTMLInputElement>document.getElementById("timezone");
    readonly tbUnix = <HTMLInputElement>document.getElementById("unix");
    readonly cbxDiscordFormat = <HTMLInputElement>document.getElementById("discordFormat");
    readonly tbDiscord = <HTMLInputElement>document.getElementById("discord");

    async init() {
        const response = await Messenger.sendMessageToBackground(BackgroundMessages.GET_PLAINTEXT);
        
        this.tbPlaintext.value = response || "";
        this.cbxDiscordFormat.value = "f";

        this.tbPlaintext.addEventListener('input', this.update);
    }

    update(ev: Event) {
        console.log((<HTMLInputElement>ev.target).id);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UI().init();
});