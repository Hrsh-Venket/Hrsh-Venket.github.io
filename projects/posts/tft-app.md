---
title: tft app
date: 2026-05-06
description: advanced tft analytics tool supporting nl2sql
tags: [cicd, postgresql, nl2sql, hci]
---

# Introduction

As an advanced player of the game TFT, I found myself in a position where I had complex questions about the game I wanted answered. For me, analysing this data was fairly straightforward -- just call the API, collate match data, use Postgres to make queries to answer my exact questions. However, this is not the case for many non-technical players of the game who might have similar complex questions. While other tools exist to query game data, they are limited in the type of queries they can allow users to make and don't give the flexibility that SQL allows.

An example not supported by existing tools (for those well versed in TFT) is: what is the winrate of Jinx 3 star with Infinity Edge but without a Kaisa on the team with Last Whisper? Operators like the NOT and XOR operators are not supported by traditional sites, which my tool supports.

It is likely the reason they are not commonly supported is that they may over-complicate the UI for a non-technical user. First-time users or those without any relevant background might be too intimidated to see a full-fledged querying system.

This motivated my second feature: easy 'Natural Language to SQL' (or NL2SQL) so users may easily describe their question and get a response. After testing a prototype of this idea, we noticed users had very little faith in the idea of direct NL2SQL. Many felt that the data was 'hallucinated' by AI (even though a proper querying system was being used). In speaking to them it became clear that the tool would need to give non-technical users the feeling of agency -- as though they had written the queries themselves -- without having them write any queries.

Thinking through how humans generally interact with each other, I observed that when two people want to validate that they have understood each other, they rephrase what they have understood in different words. Thus, getting an LLM to do this, while generating the query a user can use, we can give the feeling of control back to the user.

# Challenges while building and design decisions

## Why I used a home-server instead of GCP
Although I first build this tool using bigquery on GCP, persistent disk storage prices were increased (likely attributed to the recent surge in prices for SSDs recently. Thereby, such a tool primarily requires persisntent storage for a database that users can consistently query. I decided running this site on a linux homeserver would be the most economical option, so I set up a debian server on an old laptop for exactly this task. Set up with cloudflare tunneling, the app would be hosted on this device and would be sufficient for the traffic I was getting. 

## Docker
I set up app to run from a docker container so I could easily transfer to a better equipped VM in case demand surged, although unlike what I had done on GCP, did not set up anything for autoscaling. This is a tradeoff I thought was acceptable for the moment.

## PostgreSQL
The database was setup with postgres, with an abstracted querying system for the user. This ensures that inputs are sanitised as well as create a querying system that is easier to learn. 

## Openrouter
Finally, the aforementioned system of NL2SQL (plus the SQL2NL rephrasing to validate) are done with calls to a model on openrouter with a substantial free-tier and high uptime. Once again, this is an economical choice, and it would be trivial to replace this with a better model and model-provider should the need arise. 

## CI/CD
I set up CI/CD next, using github actions and a local running for the deployment. This experience was a first for me, and taught me how to handle uptime better than in previous projects. Main (after setting up CI/CD) would remain untouched and even I as admin would require a pull request to make any changes. Deployment would thus be seamless, allowing me to test changes before shipping them to production.

# User Experience

Given the infrastructure was running correctly and everything working as intended, I started to build the UI. Admittedly, my frontend experience is abysmall, so I used Claude to help me set up the UI. At the same time, I made some key design decisions keeping in mind user experience. My goal was to maximise usability. I did this through some of the heuristics I learned in my HCI Class @ HKUST.

## Nielsen's Usability Heuristics

1. Consistency: Internal (within the app), External (across websites generally), Metaphorical, and Least-surprise. In this app, I ensure that the website uses design conventions of colour, shape, and input and output boxes. Notably, the run command is a different colour from the background, to make it stand out and act as the default option when users click through. The idea is to reduce friction for those using this app for the first time. The output box is greyed out to ensure that it is clear the user cannot type inside of it but can copy the text with a singe click.
2. Minimalism: On entry, the app has nothing unnecessary. It renders cleanly on mobile and desktop versions of the site due (in part) to this. Technical information that is not necessary for the average user is hidden under the 'Syntax for Nerds' section (as a homage to Youtube's 'Stats for nerds'). 
3. Freedom: There is a clear function for the user to make the second most common operation (Second to 'Run') easier. The NL2SQL feature also gives immense freedom to any user
4. Flexibility: While NL2SQL is the default path I assume most users will take, the app gives power users to write queries directly, including in different languages and using slang
5. Recognition: The minimal design with clear input and output boxes does this. Further, a rainbow celebration shows up where the user gets relevant output. This directs the user's attention to where things are happening
6. Visibility: The aforementioned celebration aside, visibility is also improved by using some fun words while the model is "thinking". I used a phrase list from the Claude Code source code leak as I personally enjoyed the phrases they included in it. 
7. Help: Users are guided on what to naturally do if the LLM output is not what they desired. Instructuions to use the app are also immensely clear

## Aspects of Usability

Taking a step back, overall usability can be considered in terms of three ideas: Learnability, Efficiency and Memorability.

The app has simple instructions, a consistent UI, and for all TFT-players, no prior knowledge is required. This, and user feedback indicates the app is easily operable.

It is also efficient. There is no slow tutorial for users to go through. It is fast to learn, and fast to use -- especially with a syntax-only options for power-users.

The consistency and minimalism also make the app memorable. The process of learning for the first time is so straightforward that relearning is trivially fast. Returning power users have syntax easily available to them as a reference, and the site is usable even without this.

# Limitations and TO-DO:

There are some structural limitations for this project. Given that the site is run locally on a home-server, and uses free models on openrouter, it can have issues with reliability. With access to a cloud provider or simply multiple systems in different places around the world, server load could be more elegantly handled. However, for the time being I think the local server setup is suitable.

I periodically will update this post and update the TO-DOs for this site to address it's limitations. Think of this like an issues section on github which starts with TODOs at the time of writing this post.

- [ ] Improve handling coloqial phrases in different languages
- [ ] Allow more complex queries and comparisons by users
- [ ] Cluster data and rank compositions by different metrics
