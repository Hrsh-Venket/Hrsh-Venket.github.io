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

### 2D ball tracking

To track the volleyball in 2D from each of my cameras, I used the Yolo v8 model. It is a pretrained CNN used for object tracking, detection, and segmentation. While it was not specifically trained on volleyball images, I was able to get reasonable tracking for a slow moving volleyball, being detected as a general ‘sports ball’. I then went on to track the centre of the bounding box for each camera.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1anim.gif" title="view 1 animation" class="view 1 animation" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1anim.gif" title="view 2 animation" class="img-fluid rounded z-depth-1" %}
    </div>``
</div>

### 2D interpolation

As you can probably tell from the animations above, the ball was not being detected when it was at the fastest points in its trajectory, and only was detected when it was in the minimum and maximum points of each bounce. I further had the issue that though both my cameras were taking 60 fps video, they were not perfectly synchronised. This can introduce problems in 3D reconstruction since the two cameras are never seeing the ball at the exact same time. 

To solve both of these issues, I used cubic interpolation to estimate the position of the ball between points where it was visible, and by using audio of the ball hitting the floor to check the delay between cameras , I was able to interpolate one video to synchronise position with the other. For the video above for instance, I noticed that there was a 0.55 * 100/60 ms  or approximately 0.91 ms gap between the frames, hence I also interpolated one video to match the other. The below GIFs show the result of this interpolation.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1inter.gif" title="view 1 interpolated" class="view 1 animation" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1inter.gif" title="view 2 interpolated" class="img-fluid rounded z-depth-1" %}
    </div>``
</div>