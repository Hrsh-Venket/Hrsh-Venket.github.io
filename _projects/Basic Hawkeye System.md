---
layout: page
title: Basic Hawkeye system
description: I did 3D ball tracking and reconstruction using simple stereo for CS-2467 Computer Vision.
img: assets/img/12.jpg
importance: 1
category: work
related_publications:
---

My objective with this project was to replicate the results of a proprietary hawkeye sports ball tracking system using an amateurish camera setup. In terms of computer vision techniques, I a CNN for ball tracking, and simple camera calibration and stereo to triangulate the position of the ball. With this said, there are many engineering challenges I had to solve along the way. The project runs on video from smartphone cameras, so I had to find ways around some of the limitations that come from my setup. 

My broad method came down to:
- 2D ball tracking
- 2D interpolation
- Camera calibration and calculating relative position
- Triangulation and 3D reconstruction

# 2D ball tracking

