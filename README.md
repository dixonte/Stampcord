# Stampcord
WebExtension that converts human dates into Discord timestamps.

## What?
A Discord timestamp is basically a Unix timestamp with a little extra text on either side. They look like this: `<t:1663347600:f>`

However, when you type or paste one into Discord, what everyone actually sees is the represented date and time in their local timezone. This makes them very handy for planning events with people in different places around the world, or even the same country if your country is wide enough to have multiple time zones.

In my case, I made this tool so that I could take times for events announced in online games and easily convert them to Discord timestamps for pasting into my community server.

## Getting Stampcord
At this time, Stampcord is available for the following browsers:

* [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/stampcord/)

I've also tried it in the following browsers but not submitted it to their stores:

* Microsoft Edge

I haven't tried it in the following browsers, but expect it would probably work:

* Google Chrome

There doesn't seem to be a way to trigger a popup from a context menu in Edge or Chrome, so that feature is missing. You can still select text in the page and then open the popup from the action button, though.

In order to use Stampcord in these other browsers, you'll need to sideload them.

## Building
You'll need [node.js](https://nodejs.org/en/download/current/), then it should be as simple as

* npm install
* npm install -g gulp
* gulp
* gulp pack

## Usage
I intend to try and submit this to various browser stores, starting with Mozilla's, once I'm fully happy with it.

If you want to install this extension without going via the extension stores you'll have to load it as a temporary extension via `about:debugging#/runtime/this-firefox`.

Once installed, select any text that includes a human-readable date stamp. E.g. Friday, September 16 at 5pm UTC

In Firefox, you'll be able to right-click and select `Parse 'Friday, September 16 at 5pm UTC' as date` from the context menu. In other browsers you'll need to click the action button in the toolbar. The conversion window will pop up with that text pre-filled. Alternately, opening the popup via the action button without any text selected will pre-fill the form with your current local date.

Changes to the date will update the generated Discord timestamp on the fly. Then just click the timestamp and it will be copied to your clipboard, ready to be pasted into Discord.
