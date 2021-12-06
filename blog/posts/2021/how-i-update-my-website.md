---
layout: post-layout.njk
title: How I Update My Website
description: A reminder for myself since I don't regularly update my website content
date: 2021-12-16
tags: ['post', 'workflow', 'AWS', 'GitHub']
topics: ['workflow', 'AWS', 'development']
---

# How I Update My Website

Since I forget what I actually need to do to update this website, figured it would be a nice little post.
I set up the workflow for hosting my site by following [the cloud resume challenge by Cloud Irregular](https://cloudirregular.substack.com/p/the-cloud-resume-challenge).
I didn't follow the challenge exactly since I didn't really care about the visitor count part (or having to set up dynamoDB for a static site).
These are the parts I did implement though:

- Resume written in HTML and styled with CSS (which I had for a year or two before this challenge anyway)
- Deploy the HTML resume (and later this entire site) via [Amazon S3 static website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- Use [Amazon CloudFront](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/) to host the resume (and later this entire site) via HTTPS
- Use [GitHub](https://github.com/TGiles/static-site) to version control the site and its assets, which includes the resume
- Use [GitHub Actions](https://github.com/TGiles/static-site/actions) to automatically deploy the new assets to the linked S3 bucket

So most of the workflow for updating the site is automated for me, all I have to worry about is writing posts, updating my resume, and pushing that code to GitHub right?
Well, it's _almost_ entirely automated except for one small but important bit...invalidating the CloudFront cache.

## The Manual Part of Updating

Since I'm not an expert in AWS or other cloud tech, I wanted to keep things simple where I could.
One of the things I could have done is set up object versioning in my S3 bucket.
This would have allowed CloudFront to automatically invalidate its cache when new versions of objects in the bucket appeared.
Sometimes I push many commits very quickly and sometimes I have to redo commits and other things that would cause many versions of the objects to appear and many invalidations to occur (potentially).
I don't want to deal with accidentally occurring fees by using AWS, so I decided that I would manually invalidate the cache when I needed to.
Unfortunately, I didn't really write that decision anywhere! 😬

If I recall correctly, CloudFront cache checks my bucket once a day for updates and would invalidate itself if the bucket had changed...but I could be wrong about that.
Most cases though when I update something on my website, I want it to appear ASAP.
(With this post though, when it appears is when it appears, what's more important is that the post is in GitHub 😂)
The way to get this new content to appear, after the GitHub action has successfully deployed to S3, is to manually invalidate the cache.

- Go to CloudFront via AWS console
- Find the distribution you want to invalidate
- Go to "Invalidations"
- Activate the "Create invalidation" button
- In my case, I want to clear all object paths so I use `/*` for the path
- Activate "Create invalidation" button
- and that's it

Cool, so now there's another part of maintaining things that I don't have to remember...just need to remember to view this document 😂
