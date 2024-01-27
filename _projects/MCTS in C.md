---
layout: page
title: MCTS in C
description: I implemented Monte Carlo Tree Search in C to play tic tac toe/Mega tic tac toe
img: assets/img/MCTS in C/icon.png
importance: 1
category: work
related_publications:
---

I implemented monte carlo tree search in C, in this case for the simple game of mega tic tac toe. Monte Carlo Tree search, which uses Monte Carlo Trees is a common algorithm to solve board games without much tree pruning. It is a probabalistic approach originally used to solve the multi arm bandit problem.

The algorithm works effectively in 4 stages:
- Selection
- Expansion
- Simulation
- Backpropogation

### Selection

Inituitively this is the line of decisions that we want to investigate in a game, for instance. For this program, I used Upper Confidence Bounds applied to Trees or UCB1. This is a probabalistic approached that was originally used to solve the [Multi-armed bandit](https://en.wikipedia.org/wiki/Multi-armed_bandit) problem. This is commonly used in Reinforcement learning when a decision maker iteratively makes one of a set of choices. Nodes are evaluated based on their value according to the formula:

$$\frac{w_{i}}{n_{i}} + c \sqrt{\frac{\ln N_{i}}{n_{i}}}$$

where:
$w_{i}$ stands for the number of wins after the $i^{th}$ move\\
$n_{i}$ stands for the number of simulations of the node, or the extentent to which we have expanded past that node\\
$N_{i}$ stands for the total number of simulations after the parent (you think of it like n_{i} of the parent)\\
$c$ is is the exploration parameter. This is usually set to $\sqrt{2}$, but we can set this based on the extent on the tradeoff between new approaches and already successful approaches.

### Expansion

Expansion involves randomly expanding the tree from the node you have selected by picking a random new decision. The tree is only expanded by a single node

### Simulation

Now we simulate a set of random moves after this expansion. Since the game I have picked is relatively simple, we can simulate with a set of random moves till termination. However, in more complex games, we can consider a limited number of random moves and quantify whether you reach some objective (ie.: if the game terminates, then we quantify if the move lead to a win or not. If the game does not terminate, we measure against some greedy objective).

### Backpropogation

The final step involves adjusting scores of each node based on the success rate of the line of decisions. After this, we iteratively run the 4 steps again. The greater the number of iterations, the more likely that MCTS has arrived at the best possible moves. 