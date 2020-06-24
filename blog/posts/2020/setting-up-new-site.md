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
I'm hitting hiccups but with my own thoughts, nothing to do with eleventy.
Some of the issues I'm hitting deal with templating.

I tried to split my home page into partials but I can't figure out an easy way to accomplish this.
The reason why I wanted partials is for better internal link navigation on my home page.
However I was able to use the `markdown-it-attrs` plugin.
This plugin allows me to put IDs in markdown so that my internal links have divs to anchor to.

Getting responsive images is a pain in the ass.
Eleventy-img causes the site to endlessly serve itself.
image Responsiver only changes the markup and doesn't create the actual images for the responsive markup.
I've spent a few hours on this and it is getting old.

Finally got my responsive markup how I want it.
Finally got my syntax highlighting figured out so that code blocks are focusable!