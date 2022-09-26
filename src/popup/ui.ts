import { browser } from "webextension-polyfill-ts";
import { BackgroundMessages } from '../messages';
import { Messenger } from '../messenger';

import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';

enum ControlGroups {
    Plaintext,
    DateTimeZone,
    Unix,
    Discord,
    DiscordFormat
}

class UI {
    readonly tbPlaintext = <HTMLInputElement>document.getElementById("plaintext");
    readonly dtDateTime = <HTMLInputElement>document.getElementById("datetime");
    readonly cbxTimeZone = <HTMLInputElement>document.getElementById("timezone");
    readonly tbUnix = <HTMLInputElement>document.getElementById("unix");
    readonly cbxDiscordFormat = <HTMLInputElement>document.getElementById("discordFormat");
    readonly tbDiscord = <HTMLInputElement>document.getElementById("discord");
    readonly tbPreview = <HTMLInputElement>document.getElementById("preview");

    readonly controlIdToGroup = new Map<string, ControlGroups>([
        [this.tbPlaintext.id, ControlGroups.Plaintext]
        ,[this.dtDateTime.id, ControlGroups.DateTimeZone]
        ,[this.cbxTimeZone.id, ControlGroups.DateTimeZone]
        ,[this.tbUnix.id, ControlGroups.Unix]
        ,[this.cbxDiscordFormat.id, ControlGroups.DiscordFormat]
        ,[this.tbDiscord.id, ControlGroups.Discord]
        ,[this.tbPreview.id, ControlGroups.Discord]
    ]);

    readonly controlGroupUpdate = new Map<ControlGroups, () => void>([
        [ControlGroups.Plaintext, () => {
            this.tbPlaintext.value = `${this.dateValue.toLocaleString(DateTime.DATETIME_MED)} ${this.getUTCRelativeString(this.dateValue.offset)}`;
        }],
        [ControlGroups.DateTimeZone, () => {
            this.dtDateTime.value = this.dateValue.setZone('system', { keepLocalTime: true }).toISO({ includeOffset: false });
            this.cbxTimeZone.value = this.dateValue.offset.toString();
        }],
        [ControlGroups.Unix, () => {
            this.tbUnix.value = (this.dateValue.setZone('UTC').toUnixInteger()).toString();
        }],
        [ControlGroups.Discord, () => {
            this.tbDiscord.value = '<t:' + (this.dateValue.setZone('UTC').toUnixInteger()).toString() + ':' + this.cbxDiscordFormat.value + '>';

            let format = "";
            switch (this.cbxDiscordFormat.value) {
                case 'd':
                    format = "dd/mm/yyyy";
                    break;

                case 'D':
                    format = "d MMMM yyyy";
                    break;

                case 't':
                    format = "HH:mm";
                    break;

                case 'T':
                    format = "HH:mm:ss";
                    break;

                case 'f':
                    format = "d MMMM yyyy HH:mm";
                    break;

                case 'F':
                    format = "EEEE, d MMMM yyyy HH:mm";
                    break;

                case 'R':
                    this.tbPreview.value = this.dateValue.setZone('system').toRelative();
                    return;
            }
            this.tbPreview.value = this.dateValue.setZone('system').toFormat(format);
        }]
    ]);

    dateValue: DateTime;

    async init() {
        for (let x = -690; x <= 690; x += 30) {
            let newOption = document.createElement('option');
            newOption.value = x.toString();
            newOption.text = this.getUTCRelativeString(x);
            this.cbxTimeZone.appendChild(newOption);
        }
        this.cbxTimeZone.value = "0";

        this.tbPlaintext.addEventListener('input', this.tbPlaintext_input.bind(this));
        this.dtDateTime.addEventListener('input', this.dtDateTime_input.bind(this));
        this.cbxTimeZone.addEventListener('input', this.cbxTimeZone_input.bind(this));
        this.tbUnix.addEventListener('input', this.tbUnix_input.bind(this));
        this.cbxDiscordFormat.addEventListener('change', this.cbxDiscordFormat_change.bind(this));

        const response = await Messenger.sendMessageToBackground(BackgroundMessages.GET_PLAINTEXT);
        
        this.tbPlaintext.value = response || "";
        this.cbxDiscordFormat.value = "f";

        if (!!this.tbPlaintext.value) {
            this.tbPlaintext_input(null);
        }
    }

    getUTCRelativeString(offset: number) {
        if (offset === 0) {
            return 'UTC';
        } else if (Math.abs(offset) % 60 === 0) {
            return `UTC${offset >= 0 ? '+' : '-'}${Math.abs(Math.floor(offset / 60))}`;
        } else {
            console.log('offset', offset, 'hours', Math.floor(Math.abs(offset) / 60), 'minutes', Math.abs(offset % 60));
            return `UTC${offset >= 0 ? '+' : '-'}${Math.floor(Math.abs(offset) / 60)}:${(Math.abs(offset % 60)).toString().padStart(2, '0')}`
        }
    }

    update(except: HTMLInputElement) {
        // console.log('Update:', this.dateValue);
        // console.log('TZ', this.dateValue.zoneName, this.dateValue.zone);

        const groupException = this.controlIdToGroup.get(except.id);
        const toUpdate = Object.keys(ControlGroups).filter(k => !isNaN(Number(ControlGroups[k])) && ControlGroups[k] !== groupException).map<ControlGroups>(s => ControlGroups[s]);

        for (let group of toUpdate) {
            let updateFunc = this.controlGroupUpdate.get(group);
            if (!!updateFunc) {
                updateFunc();
            }
        }
    }

    tbPlaintext_input(ev: Event) {
        //console.log('tbPlaintext_input', this.tbPlaintext.value);

        const c = chrono.parse(this.tbPlaintext.value)[0];
        if (c) {
            const offset = c.start.get('timezoneOffset');
            let dt = DateTime.fromJSDate(c.date());
            if (offset != null) {
                const zone = this.getUTCRelativeString(offset);
                console.log('zone:', zone);
                dt = dt.setZone(zone);
            }
            this.dateValue = dt;
        }

        this.update(this.tbPlaintext);
    }

    dtDateTime_input(ev: Event) {
        this.dateValue = DateTime.fromISO(this.dtDateTime.value, { zone: this.getUTCRelativeString(Number(this.cbxTimeZone.value)) });

        this.update(this.dtDateTime);
    };

    cbxTimeZone_input(ev: Event) {
        //this.dateValue = this.dateValue.setZone(this.getUTCRelativeString(Number(this.cbxTimeZone.value)), { keepLocalTime: true });
        this.dateValue = DateTime.fromISO(this.dtDateTime.value, { zone: this.getUTCRelativeString(Number(this.cbxTimeZone.value)) });

        this.update(this.cbxTimeZone);
    }

    tbUnix_input(ev: Event) {
        if (isNaN(Number(this.tbUnix.value))) {
            return;
        }

        this.dateValue = DateTime.fromMillis(Number(this.tbUnix.value) * 1000, { zone: this.getUTCRelativeString(Number(this.cbxTimeZone.value)) });

        this.update(this.tbUnix);
    }

    cbxDiscordFormat_change(ev: Event) {
        this.update(this.cbxDiscordFormat);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UI().init();
});