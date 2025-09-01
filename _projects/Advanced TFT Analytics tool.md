---
noteId: "0d93890086e911f0b31a93c616ae8d20"
tags: []
layout: "page"
title: "Advanced TFT Analytics tool"
description: "I am currently building my own TFT Analytics tool"
img: "assets/img/Advanced TFT Analytics tool/tft background image.jpeg"
importance: 1
category: "work"
related_publications: null

---

I am currently building my own analytics tool for the game TeamFightTactics (TFT) by Riot Games. It is a live service game that belongs to the auto-chess genre. I am a fairly well ranked player, regularly reaching Master (roughly top 1.8% player) in the Southeast Asia Region. 

Given that TFT is a live service game, he META (Most Effective Tactics Available) tends to change often as the game is updated and players around the world come up with new strategies. Thus, being a competitive player involves:

1. innovating as a player and coming up with your own ideas, and
2. keeping up with the META strategies come up with by other players

Many of the resources used by advanced players strike at the latter. These resources further tend to be divided into two types

1. Statistics derived from match data
2. Analyses made by even higher ranked players from their experience innovating

The former have the benefit of being instant and unbiased to the opinions of any one player. However they generally fail to offer the intuition by which players often understand a strategy(i.e. What are the key breakpoints that make this strategy strong? What do you need to make this strategy successful?)

This is often solved by the latter: the best players in the world have built sites where they regularly update what they think are the META strategies in the game *alongside* their intuition about the strategies. These are often more popular as they are a lot more human-usable when playing a game and making quick decisions. However, such resources tend to have a delay: a few days after a new update where the top player tries to understand the changes and finally puts pen to paper. For advanced players to remain competitive, a few days not understanding the META is enough to fall behind. Further, such resources involve the inherent human biases of these top players. Certain good strategies can be overlooked and thus not even investigated till much later.

Thus, I have had a strong feeling that both strategies are unsatisfactory and have sought a way to at least weakly automate the development of intuition. My idea is as follows:

1. Train one model to ask "interesting" questions and structure queries to answer them from existing match data
2. Call an LLM to analyse the data and summarise the answer to the interesting question in a short "thumb rule".

This is meant to mimic human intution and while it could lack the depth of a very experienced player, it can offer some basic intuition about the newest strategies much faster than someone doing this manually.

## Done so far

This project is still in progress. So far I have:

1. Written everything needed to call the Riot Games Api and get match data
2. Built a pipeline to structure matchdata and store it in a PostgreSQL database on supabase
3. Built an improved querying system that allows for more complex chained queries than traditional analytics tools through the support the NOT, OR, AND, and XOR binary operators
4. Built a 'clustering' system to detect similar looking boards and cluster them as a particular strategy. Allows for the detection of new strategies. 
5. Built an MVP with streamlit and stress tested the querying functionality

## Doing:

1. Building the webapp to deploy via vercel with a flask backend, and debating between htmx and django for the frontend)


## To-do:

1. Migrate stack to AWS
2. Build an automatic downloading pipeline that updates the json database when there is an update to the game or significant distribution shifts (new strategies developed)
3. Build protections to avoid SQL injection
4. Design and train a model to ask interesting questions (queries). This would require help from users to understand what other players consider 'interesting'
5. Build LLM calling pipeline (use cheapest available at the time XD) to analyse user data and provide thumb rule
6. Optimise the querying system to simplify user side queries into more efficient backend SQL queries
7. Systematic large scale testing of webapp and how it handles greater load


This was last updated September 1st 2025. Please reach out to me if you would like a more recent update