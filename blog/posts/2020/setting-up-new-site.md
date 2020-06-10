---
layout: post-layout.njk
title: Setting Up A Blog in 11ty - Tim Giles
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