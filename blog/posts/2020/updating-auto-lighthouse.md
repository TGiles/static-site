---
layout: post-layout.njk
title: Adding features to auto-lighthouse
description: Tim Giles on adding new features to his auto-lighthouse package on NPM
date: 2020-05-29
tags: ['post', 'CLI', 'accessibility', 'Lighthouse', 'automation']
topics: ['CLI', 'accessibility', 'Lighthouse', 'automation']
---

# Fixing up auto-lighthouse

![auto-lighthouse running an audit](/img/updating-auto-lighthouse/auto-lighthouse.gif)
Recently my auto-lighthouse package has been receiving more attention from the community at large.
Because of this extra attention, I decided to add some features that were missing and fix some bugs that I was unaware of.
I ended up fixing my broken blocked list, thanks to [César Valadez](https://github.com/cesasol) for the initial fix which led to a more permanent fix.
I additionally added a new default behavior based on feedback and added a command line argument to change the number of threads used during the process.
Additional thanks to [Konrad Szwarc](https://github.com/szwarckonrad) for finding a documentation issue in the README!

## What is auto-lighthouse?

Auto-lighthouse is a command line interface tool that runs mobile and desktop Lighthouse audits on each page in an entire domain or domains.
I created this tool because I couldn't find a tool like it that was freely available.
The tool is heavily inspired by [lightcrawler](https://github.com/github/lightcrawler) but the tool is not maintained as far as I can tell.
At one of my previous jobs, I needed to generate accessibility audits on many different pages of many domains.
Unfortunately the software I was using, Sortsite, was not generating accurate audits of our web pages.
This was the initial spark of auto-lighthouse, just trying to make my day-to-day easier 😂

The main technologies used in auto-lighthouse are [simplecrawler](https://www.npmjs.com/package/simplecrawler), [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) and [commander](https://github.com/tj/commander.js/).
simplecrawler is a web crawler that is event driven.
For example, whenever the crawler adds a page to the queue, it fires off an event that can be caught and acted upon.
I use this add event to filter media types that are not relevant to my search.
Lighthouse only cares about HTML pages, so trying to run Lighthouse on a JPEG is not going to work.

## Fixing the broken blocked list regex

My old implementation of the filter on queue add was a block list, which created a very ugly and brittle regex expression.
Instead of saying: "Allow HTML extensions", I told the filter "Block JPEG, WOFF, WOFF2, JPG, GIF, WEBM, WEBP, ...etc. extensions".
For example, here is my old regex which is a pain to read:

```js
const regex = /\.(css|jpe?g|pdf|docx?|m?js|png|ico|gif|svgz?|psd|ai|zip|gz|zx|src|cassette|mini-profiler|axd|woff2?|eot|ttf|web[pm]|mp[43]|ogg|txt|webmanifest|json|manifest)$/i;
```

I'm not sure if the old regex created any kind of performance issue, but regardless the new filter is cleaner and much easier to read.
This new filter is an allowed list of valid web pages, and I switch the regex out for an `includes` test.

```js
const queueAdd = (queueItem, urlList) => {
    const [endOfURLPath] = queueItem.uriPath.split('/').slice(-1);
    const [fileExtension] = endOfURLPath.split('.').slice(-1);
    const isValidWebPage = whiteList.includes(fileExtension);

    if (isValidWebPage) {
        urlList.push(queueItem.url);
        console.log(`Pushed: ${queueItem.url}`);

    // if end of the path is /xyz/, this is still a valid path
    } if (endOfURLPath.length === 0) {
        urlList.push(queueItem.url);
        console.log(`Pushed: ${queueItem.url}`);
    }
    else {
        // if uri path is clean/no file path
        if (!endOfURLPath.includes('.')) {
        urlList.push(queueItem.url);
            console.log(`Pushed: ${queueItem.url}`);
        }
    }
};

```

Switching to this implementation created a few extra lines of code, but I'm in the camp that code should be more human readable first.
In the end, I now have a separate file for controlling which file extensions are allowed, so if I need to add any additional extensions it does not affect my implementation.
One problem fixed, but I still had two other features/fixes that I wanted in the new release of auto-lighthouse.

## Changing the default behavior of the tool

Thanks to feedback from my buddy [Dylan](https://www.dylansheffer.com/), I changed the default behavior of auto-lighthouse.
Previously, if you ran the tool, it would run with default options pointing at one of my websites.
When I initially created the tool, that was the exact experience I needed because I was the only one using it!
Dylan brought up an excellent point though, many CLI apps display help text when no options are passed to the app.
Now when you run auto-lighthouse with no arguments, it prints the help text instead to inform you what can be done!
This was achieved by the following block: 

```js
if (program.rawArgs.length === 2) {
    program.help();
}
```
`program` is an instance of commander, which has a handy `.help()` function that displays the help text.
The previous `-h` flag still works, since some users would prefer that for the help text.
The last part of this release is allowing a command line option to change the number of threads used to generate reports.

## Adding the ability to choose the number of threads used

This part was straightforward, like the help text issue.
I already had the logic for a variable number of threads in my implementation, but there were no variables exposed to control this number!
Because of this, I added a new option to my CLI which allows a user to specify the number of threads, or defaults to all threads on a machine.
To use the argument, I needed to add this if else statement:

```js
    let threads;
    ...
    ...
    ...
    if (program.threads === undefined) {
        threads = os.cpus().length;
    } else {
        threads = programs.threads;
    }
```

Then I needed to change my internal implementation to use this threads variable instead of a hardcoded number:

```js
...
...
...
    try {
        let combinedOpts = [desktopOpts, opts];
        const promises = await parallelLimit(
            [
                processReports(urlList, combinedOpts, tempFilePath)
            ],
            threads);
        await Promise.all(promises);
        console.log('Done with reports!');
    } catch (e) {
        console.error(e);
    }
...
...
...

```

## Summary

Since my auto-lighthouse package was receiving more attention than usual from the community, I decided to focus on some quality features/fixes for my most recent release (1.2.x).
These work items included:
* Fixing the blocked list so that web pages would successfully be added to the report generation queue
* Changing the default behavior of running auto-lighthouse with no arguments so that help text would display
* Adding a command line option to change the number of threads the tool using during a run

All in all, I'm happy to have the feedback and do what I can to make this tool better.