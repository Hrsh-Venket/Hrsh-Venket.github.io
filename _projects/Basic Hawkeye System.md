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

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1anim.gif" title="view 1 animation" class="view 1 animation" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v2anim.gif" title="view 2 animation" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### 2D interpolation

As you can probably tell from the animations above, the ball was not being detected when it was at the fastest points in its trajectory, and only was detected when it was in the minimum and maximum points of each bounce. I further had the issue that though both my cameras were taking 60 fps video, they were not perfectly synchronised. This can introduce problems in 3D reconstruction since the two cameras are never seeing the ball at the exact same time. 

To solve both of these issues, I used cubic interpolation to estimate the position of the ball between points where it was visible, and by using audio of the ball hitting the floor to check the delay between cameras , I was able to interpolate one video to synchronise position with the other. For the video above for instance, I noticed that there was a 0.55 * 100/60 ms  or approximately 0.91 ms gap between the frames, hence I also interpolated one video to match the other. The below GIFs show the result of this interpolation.

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v1inter.gif" title="view 1 interpolated" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v2inter.gif" title="view 2 interpolated" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Computing relative position of cameras

My next step was to use the camera input to calculate the relative position of the two camera centres. My method for this was to use SIFT features to calculate the homography between the first image of both videos (since camera does not move or shake significantly) and use singular value decomposition to decompose the rotation and translation between them. 

To do this, I got the intrinsic parameters of my two cameras using their focal lengths and pitch size:

I then calculate Rotation and translation matrices from the homography between the two images. 

First we normalise the homography using $K$
$$H=K^{-1}HK$$
Then we homogenise the homography matrix using Singular Value Decomposition. 
$$U,\Sigma,V^T=svd\left(H\right)$$
Thus, we compute the rotation matrix using the formula:

$$
R = U
\begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & \det(UV^{T})
\end{bmatrix}
V^{T}
$$
 
We then compute the translation vector:
$$T\ =\ H[:,2] / ||H[:,0]||$$
Where I refer to columns and rows using python indexing.
Note that, I went through some sanity check with this, for instance to check that rotation and transformation match with what I know the positions of the cameras to be. I had some trouble with computing homography.

First I had trouble since a majority of sift points were detected in the patterned ceiling of the area:


<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/sift features.png" title="sift features" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

Then I avoided using these points to compute the homography, which improved the computation.

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/sift features corrected.png" title="sift features corrected" class="img-fluid rounded z-depth-1"%}
    </div>
</div>

The other issue I had in computing this homography was that my matches are pretty much coplanar (with the exception of the wheels. Ideally, if I could match with the rubik’s cube on the floor that would improve computation. 


### Triangulate to convert to 3D

After this, I apply the cv2.triangulate points function on these points, to compute the 3D location of the points. I give homogenised points as an input and it uses the least squares method to triangulate location. Below is the output I got on the best of the video pairs I took.

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v13D.png" title="view 1 interpolated" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/Basic Hakeye System/v23D.png" title="3d view" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Ground Truth

One issue with my approach is that I don’t have a ground truth to compare against. An approach I might apply to this later is to take a good simulation software like blender or a game engine like godot or unity and do a 3D animation and view it from 2 camera angles, trying to move backwards and do the reconstruction. With that approach I can compare perfectly for my reconstruction. Alternatively, as professor suggested, if I can add something to the ball that can make a mark on the final location, I can measure the final location, which I can use as a partial metric of accuracy of this system.