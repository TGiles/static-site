---
layout: post-layout.njk
title: Setting Up A Blog in 11ty
description: Tim Giles creates his new website featuring a blog using eleventy
date: 2020-05-19
tags: ['post', '11ty', 'Web Development']
topics: ['11ty', 'Web Development']
---

# Setting up a blog in Eleventy/11ty

Eleventy seems straightforward.
It's an unopinionated static site generator that allows you to add plugins, functions, filters, and shortcodes when you need them.
I decided to use [Nunjucks](https://mozilla.github.io/nunjucks/) as most of the examples involving Eleventy used Nunjucks.
Having to learn Nunjucks did give me some issues, but given enough time and research I've resolved them.

## Nunjucks

My main issue I ran into with Nunjucks was figuring out how to use partial templates.
I have some experience with Razor and so one of the first patterns I use with templates is creating partials.
However, most of the [starter projects on Eleventy](https://www.11ty.dev/docs/starter/) don't use partials!
Fortunately the Nunjucks developers saw this use case as well and have a handy tag called [include](https://mozilla.github.io/nunjucks/templating.html#include).
Calling 
```html
{'% include "SomeFile.html" %'}
``` 
(minus the single quotes) will dump `someFile`'s content into a different template, allowing a user to compose templates through partials.

## Responsive Images

Another issue I ran into was creating responsive images.
[Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) increase the performance of your site by delivering images that fit a device's viewport.
For example, sending a 2000 x 2000 image would not make sense to a mobile phone user.
The image will be scaled down to fit the viewport of the phone and display at a much smaller size, probably 300x300 or so.
By creating multiple copies of my images at multiple sizes, I can then tell the `<img>` element which image to display based on the width (or height) of a user's viewport.

There are a few plugins and utilities for Eleventy to create responsive images, such as [Eleventy-img](https://github.com/11ty/eleventy-img) and [eleventy-plugin-images-responsiver](https://www.npmjs.com/package/eleventy-plugin-images-responsiver).
When I used Eleventy-img, my site would endlessly build and serve itself.
I'm still not entirely sure why this endless loop was happening, but I ended up dropping the utility function.

### Eleventy-plugin-images-responsiver

I thought that eleventy-plugin-images-responsiver would create the responsive images for me, but instead the plugin creates responsive markup.
The plugin allows me to use markdown images, but then the generated HTML `<img>` element has additional attributes for responsive images.
My main issue with this plugin was figuring out how to configure it to my need.
The options that I needed for this plugin would be the same type of attributes that I would write to my images if I was writing my content in HTML.
For example some of the attributes include: `sizes`, `loading`, `srcset`, etc.
The plugin takes care of `srcset` for me, allowing me to configure `sizes` and `loading`.
What's strange about the `srcset` generation though is that the plugin generates, by default, five steps between the `minWidth` and `maxWidth`.
I wish this was more visible in the documentation, but it could also be because I was learning about five different technologies while making this site 🤷‍♂️.

### Generating responsive image copies

Since Eleventy-img didn't work for me, and eleventy-plugin-images-responsiver does not create the actual responsive images, I had to write my own build script to generate them.
At first, I used the [sharp module](https://sharp.pixelplumbing.com/) to create resized copies of my static images.
I also used the [gif-resize module](https://github.com/gumlet/gif-resize) to create resized copies of my animated images.
The source code can be found in the [generate-responsive-imgs.js](https://github.com/TGiles/static-site/blob/master/build/generate-responsive-imgs.js) file.

As I created copies of my JPEGs and my GIFs, I ran Google Lighthouse on my page to ensure the performance of my site.
My resized images kept decreasing my performance score in Lighthouse, since JPEG and GIF are not the most performant image types.
Lighthouse's recommendation was to convert JPEGs to WebP and GIFs to WebM.
Converting JPEGs to WebP was straightforward thanks to sharp, converting the GIFs is a different story unfortunately.

Using sharp, the only change I needed to make to my previous JPEG script was to change the file extension from `.jpeg` to `.webp`.
After this change, Lighthouse no longer shows a warning about my static images.
Unfortunately, I have not been able to convert my GIFs to WebM.
I thought that [webp-converter](https://www.npmjs.com/package/webp-converter) would solve this issue, but I have not found success in converting GIFs.
This is not a huge problem however, since I can still create responsive GIFs thereby cutting down the served file size.

## Creating accessible fenced code blocks

At first, I was using a plugin [eleventy-plugin-syntaxhighlight](https://www.11ty.dev/docs/plugins/syntaxhighlight/) for syntax highlighting, but was unable to add `tabindex` to my fenced blocks.
Since some of my code blocks, as seen in my [HTML to PDF CI post](../htmlToPdcCI.md), are scrollable, I needed a way for keyboard users to interact with the blocks.
This is where my custom markdown fence renderer with [Prism.js](https://prismjs.com/) comes into play.
Watch out if you're using Prism in a Node environment, since you have to initialize it differently than what the docs show.
For example
```js
const PrismLoader = require('prismjs/components/index');
PrismLoader(['bash', 'js']);
```
This previous snippet will load both Bash and JavaScript into the initialized Prism instance.
The [`PrismLoader` is a helper function, according to an issue I found](https://github.com/PrismJS/prism/issues/1129) while trying to solve this problem.

I could have remedied the missing tab indices after the fact with javascript, but that would be a more expensive operation.
Instead, my custom fence renderer fixes this issue at build time, allowing my fenced code block to be operable by keyboard users!
You can find the [custom renderer on GitHub](https://github.com/TGiles/static-site/blob/master/.eleventy.js#L74).

## Creating auto generated heading links

To improve the viewing experience, I wanted to have heading auto generate a skip link to that particular heading.
For example, if you hover or focus the above heading, you will see a link icon at the beginning of the heading.
Markdown-it, by default, doesn't include a mechanism for adding ids to heading.
Markdown-it has many plugins to achieve what a user needs though, and in my case I used [markdown-it-github-headings](https://www.npmjs.com/package/markdown-it-github-headings).
Using the plugin with its default options almost achieved what I wanted, but the links' id and href were not the format I was expecting.
For example, my "About Me" section on the main page would have a link with a href of "#user-content-about-me", but I was expecting a href of "#about-me".
This is simple to fix however, I just needed to pass an options object with `prefixHeadingsIds: false` to get rid of the "user-content" prefix.
Be warned, without prefixed ids you can run into [DOM Clobbering](https://portswigger.net/web-security/dom-based/dom-clobbering).
Since my website is nothing but static content that is controlled by me, I'm not worried about any potential DOM clobbering.

## Summary

Huge thanks to [Jon Keeping](https://github.com/JonUK) and his blog post on [creating a blog with Eleventy](https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/) which helped immensely in getting started!
By putting all of the previous together, I was able to create my new personal site using Eleventy, markdown, plugins, and some custom code.
Although I needed to write a good bit of custom code, using Eleventy for generating my static site has been an enjoyable, but challenging, experience.
Now I have a site that scores well on Lighthouse audits and is accessible to many users!