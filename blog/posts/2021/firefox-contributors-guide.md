---
layout: post-layout.njk
title: So, You Want To Contribute To Firefox
description: Thoughts about working on a password manager these last six months
date: 2021-04-16
tags: ['post', 'Firefox', 'Mozilla', 'contributing', 'open source']
topics: ['Firefox', 'contributing', 'open source', 'development', 'vscode']
---

# So, You Want to Contribute to Firefox

## Preface

I've been working with a few Outreachy applicants and I see that that these applicants are running into the same pitfalls independently of each other.
Although Mozilla has [first time contributors guides](https://firefox-source-docs.mozilla.org/setup/contributing_code.html), and [how to start on various operating systems](https://firefox-source-docs.mozilla.org/contributing/contribution_quickref.html#firefox-contributors-quick-reference), it appears that these instructions are not clear enough to first time contributors.
I like to make the process of contributing to open source projects easier, so I thought I'd expand on some of the common pitfalls I've seen so far and some strategies to mitigate these pitfalls!

## Common Pitfalls

I'll try to break up the common pitfalls into related categories, but can't guarantee that these categories will always be "perfectly" separated.
Additionally, for most other topics, there will be a wealth of knowledge in the [Firefox Source Docs](https://firefox-source-docs.mozilla.org/index.html).

### Using Visual Studio Code (vscode)

[Get link to the corresponding section in the contributors guide]
One of the pitfalls I've seen is dealing with the files within the `mozilla-central` repository (and Firefox repositories in general).
When building Firefox, you will get the output, or artifacts, of the build in a separate folder.
On Windows, this folder is `obj-x86_64-pc-mingw32` but will be different depending on your operating system and its architecture.
Because of this build folder, there will be duplicate files, one source file and one built file.
This can cause issues when searching for a file when using the search bar (`Ctrl + P` on Windows) in vscode.
![Search bar showing duplicate files](../../../../img/firefox-contributors-guide/duplicate-files-vscode.webp)

### Amending commit messages

Another of the pitfalls I've seen is when a contributor needs to amend their commit message.
In Firefox's workflow, we use a tool called [Phabricator](https://wiki.mozilla.org/Phabricator) for code reviews.
For Phabricator to keep track of all the patches that come through its system, it appends a "Phabricator Revision" id to the body of the commit message when a user runs `hg commit`.
For contributors coming from a different version control system, mainly Git, it seems like running `hg commit --amend -m "Bug ID - description of change"` would be the way to amend your commit message!
Unfortunately, this is not correct.
If a contributor re-writes the commit message and drops the "Phabricator Revision" information, then when the contributor submits an updated patch...Phabricator will then create a new patch, instead of updating the old one!

To avoid this issue, please use either of the following: `hg commit --amend` or `hg histedit`.

#### `hg commit --amend`

`hg commit --amend` is useful for modifying a single commit, since it allows you to change both the message and the commit's content.
This will probably be the more used option, especially when going through the patch feedback and approval process.
If you wish to change only the commit message of a certain commit, follow these steps:
1. Checkout the commit you wish to modify
2. Run `hg commit --amend`
3. Depending on your operating system and the terminal you are using, the following could happen
   1. On Windows, the Emacs editor should appear (but a terminal code editor may appear instead based on your environment).
         1. Emacs looks like Notepad or Notepad++, if you've used these programs before ![Emacs GUI](../../../../img/firefox-contributors-guide/emacs.png)
      1. Edit your commit message in Emacs
      2. Save and exit from Emacs by either
      3. Selecting the floppy disk icon then selecting the X icon to exit
      4. File > Save, then File > Close
   2. On Mac or Linux, most likely a terminal code editor will appear...probably Vim or Nano
      1. Edit the commit message in the editor that appears
      2. Save and exit from the editor
4. Afterwards, run `hg wip` and the resulting log should show your updated message! 🎉

#### `hg histedit`

`hg histedit` is useful for rewriting history, **but** is more complicated and **potentially more dangerous** than `hg commit --amend`.
`hg histedit` will allow you to:
- Edit the commit itself, `e, edit`
- Edit the commit message, `m, mess`
- Pick the commit (does not modify it), `p, pick`
- Drop the commit from history **dangerous, please ensure you mean to do this**, `d, drop`
- Fold the commit, which will keep the contents of the commit and its message but fold it into the commit above the folded commit, `f, fold`
- Roll the commit, which will keep the contents of the commit but drop its message, and rolls its into the commit above the rolled commit, `r, roll`

For contributors coming from a Git background, you may notice a similarity between these history editing commands and the interactive rebase from Git:
- The `edit` command is the same in both VCS
- `reword` in Git corresponds to `mess` in Mercurial
- The `pick` command is the same in both VCS
- The `drop` command is the same in both VCS
- `squash` in Git corresponds to `fold` in Mercurial
- `fixup` in Git corresponds to `roll` in Mercurial

If you have multiple intermediate commits on your patch, you will need to roll them up into one commit for Phabricator.
This is actually a great segue into the next pitfall I see, accidentally submitting unrelated commits to Phabricator.

### Keep separate commits separate

Unlike GitHub, GitLab, and other platforms that have code review features built into them...you cannot select "Squash and Merge" when landing a patch in Phabricator.
Hence, you should _probably_ have only one commit if you're a new contributor to the codebase.
However there are plenty exceptions to this, especially if the bug you are working on is large and could benefit from smaller logical commits.
Your bug reviewer and/or mentor should be able to help determine this for you.
If you're working on separate, unrelated bugs though, you should make sure you're not accidentally creating dependencies between these bugs!

Each bug that you work on should have its own separate patch, or patches depending on complexity and structure of the work required.
What this means from a development point of view is, before working on a new bug you should do the following:
1. Ensure your current bug's work is committed
2. Checkout the latest `central` commit
   1. `hg pull central` should pull the latest changes that exist in `mozilla-central`
      1. **NOTE**: this is not Git's `pull` and is more akin to Git's `fetch`
   2. `hg up central`
3. Start new work based off of latest `central`
4. Commit new work
   1. `hg commit -m "Bug XXX - Imperative description of what this commit will do"`

After following the previous steps, your work should have created a new separate head that you can switch to at any time.

### Keep repository and commits up to date

In the previous pitfall, I mentioned running `hg pull central` to pull the latest changes from `mozilla-central` to keep your new work up to date.
This begs the question, what do I need to do to keep my long running patches up to date with `mozilla-central`?
In order to keep your other work up to date, which will simplify the review process and hopefully prevent any large merge conflicts, you should do the following:
1. `hg pull central`, which will pull the latest changes from `mozilla-central`
2. `hg wip`, which should show all of your active patches
   1. Please note either the numeric ID or the hash (example `123456:7ade12fa0948`) of each of these patches, you'll need them in a minute
3. Depending on how your patches are structure, you should do one of the following:
   1. If your patches are single commits, you can run `hg rebase -r <your commit ID or hash> -d central -r <your commit ID or hash> -d central>`
      1. This will rebase each commit on to `central`
   2. If your patches are multiple commits, you can run `hg rebase -s <your source patch ID or hash> -d central`
      1. What is your source patch? It's the first commit that deviates from the mainline when you run `hg wip`
4. Solve any merge conflicts without losing your work
   1. This takes time and practice, so make sure you're choosing the correct option!
