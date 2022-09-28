import { DateTime } from 'luxon';

import * as chrono from 'chrono-node';

export const customParser = chrono.casual.clone();

// Hopefully not required in future versions of node.js
declare namespace Intl {
    type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit';
  
    function supportedValuesOf(input: Key): string[];
}

// If we end up with multiple results, copy the first certain timezone to the first result
customParser.refiners.push({
    refine: (context, results) => {
        //console.log('results', results);

        const resultsWithTimezone = results.filter(r => r.start.isCertain('timezoneOffset'));
        if (resultsWithTimezone[0] && results[0] && !results[0].start.isCertain('timezoneOffset')) {
            results[0].start.assign('timezoneOffset', resultsWithTimezone[0].start.get('timezoneOffset'))
        }

        return results;
    }
});

const getOffset = (timeZone = 'UTC', date = new Date()) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
}

export const timeZones = Intl.supportedValuesOf('timeZone')
    // Gather offset data, replace underscores
    .map(zs => {
        //console.log('zone', zs, DateTime.local().setZone(zs).toFormat('ZZZZ'));
        
        return {
            name: zs.replaceAll('_', ' '),
            offset: getOffset(zs)
        };
    })
    // Remove weird zones
    .filter(t => t.name.indexOf('Etc/') !== 0 && t.name !== 'Factory')
    // Sort by offset, then name
    .sort((a, b) => {
        let offsetDiff = a.offset - b.offset;
        if (offsetDiff !== 0) {
            return offsetDiff;
        }

        if (a.name == 'UTC') {
            return -1;
        }
        if (b.name == 'UTC') {
            return 1;
        }

        return a.name.localeCompare(b.name); 
    })
    // Group by offset
    .reduce((p, c) => {
        if (p.length === 0 || p[p.length-1].offset !== c.offset) {
            p.push(c);
            return p;
        }

        const l = p[p.length-1];
        
        if (c.name.indexOf('/') >= 0 && l.name.indexOf('/') >= 0) {
            let [continent, region] = c.name.split('/');
            let lContinent = l.name.substring(0, l.name.lastIndexOf('/'));
            lContinent = lContinent.substring(lContinent.lastIndexOf(' ')+1);

            if (continent !== lContinent) {
                l.name += ', ' + c.name;
            } else {
                l.name += ', ' + region;
            }
        } else {
            l.name += ', ' + c.name;
        }

        if (l.name.length > 80) {
            l.name = l.name.substring(0, 80) + '...';
        }
        return p;
    }, <Array<{ name: string, offset: number}>>[]);

for (const zone of Intl.supportedValuesOf('timeZone')) {
    const offset = getOffset(zone);

    let zoneName = zone;
    if (zoneName.indexOf('/') >= 0) {
        [, zoneName] = zoneName.split('/');
    }

    const regex = new RegExp(`\\b${zoneName.replace('_', '[_\\s]')}\\b`, 'i');

    //console.log(`Adding parser for ${zone} with offset ${offset}`);

    customParser.parsers.push({
        pattern: () => { return regex },
        extract: (context, match) => {
            //console.log(`Zone match: ${zone} = ${offset}`);
            return {
                timezoneOffset: offset
            }
        }
    });
}
