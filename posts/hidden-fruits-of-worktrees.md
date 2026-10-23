---
title: Hidden fruits of worktrees
date: 2026-08-20
description: Worktrees have become an integral part of my workflow, because they have been allowing me to minimize the impact of context switching.
image: ''
draft: false
---

Worktrees have become an integral part of my workflow, because they have been allowing me to minimize the impact of context switching during my workflow. Recently I've been working on a fast paced project, and I've found myself needing to move through tickets quickly, switching branches more often, and reviewing others' work quickly. This typically has meant finding ways to manage multiple tasks in parallel. I need to be able to quickly check in on one branch, while I have another agent busy working on another branch.

I've known about worktrees for some time, but I never really took the leap to fully adopt them into my workflow, despite hearing about their many benefits, many times. Even when the agentic development wave really took off in the beginning of this year, and worktrees became an even hotter topic, I managed to put off adopting them for months. I did my fair share of experimentation, but nothing seemed to stick for me. It seems it took a new project and more aggressive deadlines for me to jump fully in and not look back.

I've been using warp terminal for professional projects for the past year or so. For side projects I typically reach for cursor, and have adopted the various evolutions of development experiences that cursor has provided over the past two years. But as for warp, which I've been using heavily lately, I've grown really comfortable with how I'm able to customize it for each of my projects and different development workflows. Using worktrees within warp has only been a recent progression in my usage of warp, but I've been enjoying using them within it. 

For my recent project, I created some "git scripts" (ie: \`git wt <branch>\`, \`git wt-done\`) which I've checked into our repo, which have served as something of an opinionated bridge between warp and git. I found myself spending too much time trying to manage "where" I'm working, and worry about making sure I'm working in the right place. With worktrees, while not overly complicated conceptually, add another layer of configuration and setup for developers to manage, which is.. simply not fun or productive to manage all the time as a developer.

Anyway, the scripts automate creating worktrees and branches, opening them in new warp tabs, color coding those tabs, grouping them, and running some initial commands in each. This has been really awesome for me for a few reasons. With the complexity of worktrees solved once, the way I want, in a deterministic script, I've been able to realize some of the less obvious benefits of worktrees. By automating the parts of them that are easy to trip up on, it unlocks a more consistent, less stressful, and an overall smoother developer experience. Kicking off a PR review has become `git review <branch>`, and I have the branch checked out in a new worktree, with one warp tab running tests, and another warp tab kicking off our local PR review claude skill.

One of the biggest fruits I've discovered, unexpectedly, is that claude code session management has been greatly simplified. Things like context management, deciding when to start a new session vs. continue with an existing session, or being afraid to end a session because of the context it's accumulated, has felt like mostly a thing of the past. With a fresh warp tab and claude agent for each feature, I typically manage one agent conversation in each branch (and worktree). If it is a large effort, I might compact a few times, or hand-off to a new session after a while. But the majority of the time I can get away with one agent session, and with worktrees, I can tab up or down to check in on other agent conversations and features. 

That's all for now 🦥
