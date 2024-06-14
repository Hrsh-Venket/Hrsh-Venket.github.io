---
layout: page
title: 3D reconstruction of C.Elegans 
description: Pipeline for 3D reconstruction of microscopic roundworm c.elegans using Spinning Disc Confocal Microscope images
img: assets/img/3D Reconstruction of SDCM images of C Elegans/logo.jpg
importance: 1
category: work
related_publications:
---

### Aim

**Given**: florescent spinning disk confocal microscope scan of a c.elegans sample, 

**Create**: a 3D reconstruction of the intestine which we can use to measure curvature and thickness

### Ground truth

- I have only one fully labeled image
- Hence my method and any changing must be based on general features of the intestine not on this specific image
- Hence, I tried to visually fine tune my work on unlabelled images, but test on my labeled stack

### Input

- input stack
- input trimap trimap

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/input.gif" title="input gif" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/trimap.gif" title="trimap gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Stage 1: Estimating Trimap

- Sato
- (Multi) Otsu's Thresholding
- RMSE

### Sato

- Calculate the hessian
- Take the eigen values of the hessian to detect ridge structures
- Along the eigenvectors, there is no change in intensity, while perpendicular to the eigenvectors there is a change in intensity
- I am unclear of the difference between Sato and similar other filters (meijering and the frangi filters), except that Sato works for 3D

### (Multi) Otsu's Thresholding

- Takes the histogram of grayscale values
- Finds the n biggest clusters
- Based on clusters decides optimal threshold values
- I look for 3 clusters:
	- 0% intestine
	- Unknown
	- 100% intestine

### Stage 1 Results
Stage 1 RMSE: 28.476046726131596

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/stage1.gif" title="stage1 gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Stage 2: Label propogation

- Assumption of label propogation: The labels around a point can help us identify the label of the point
- There are many ways of defining locality and finetuning it
- I used a weighted knn algorithm on the point cloud
- (I will get to how I did the transformation to the point cloud later in this presentation)

### Weighted knn

- Standard skelearn knn algorithm
- distance weight function using gaussian
- minor implementation detail:
incorporate the distance metric into scaling of the pcl, instead of calculating it each time since:
$$e^{-d^{2}/2 (n\sigma)^{2}} = e^{-(d/n)^{2}/2 \sigma^{2}}$$

### Stage 2 results
Stage 1 RMSE: 28.476046726131596

Stage 2 RMSE: 25.12695109038175

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/stage2.gif" title="stage2 gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>


### Stage 3: Denoising
- Remove small objects:
	- Calculates sizes of each contiguous object in 3D, and removes all objects below a minimum number of voxels
	- Visibility of the intestine in the image is used as a metric to discard bad scans, so we can use this as an absolute metric

### Stage 3: Unsuccessful

After this denoising stagee, I found we were losing important information. 

Stage 1 RMSE: 28.476046726131596

Stage 2 RMSE: 25.12695109038175

Stage 3 RMSE: 30.780235769535096

While this was part of my original plan, I discarded this step

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/stage3.gif" title="stage3 gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
### Stage 4: Projection to 3D

- Spinning disk confocal microscope:
	- orthographic projection
	- assumption: worm doesn't move
- x: 0.325 um
- y: 0.325 um
- z: 1 um

### Further Denoising

- Statistical outlier detection where we can remove points more than n standard deviations away from the centre of each pcl cluster.

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/point cloud.jpg" title="pcl image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Stage 5: Mesh generation

- alpha shapes:
	- Based on the convex hull problem for 2D
	- Starts with a larger bounding box
	- Removes spheres of radius alpha without any points, from the larger bounding box until a resulting 'alpha shape is created'
- The implementation I used is based on work by Edelsbrunner
	- They then tetrahedralise the remaining alpha shape
	- Follows assumptions of Delauney triangulation but does not maximise triangle angles 

The point cloud is in world coordinate space (x, y, z, in um)

We can use the above to do measurements on the image in the 3D space

<div class="row justify-content-sm-center">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/mesh.jpg" title="mesh view 1" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/3D Reconstruction of SDCM images of C Elegans/mesh1.jpg" title="mesh view 2" class="img-fluid rounded z-depth-1" %}
    </div>
</div>


### Further steps
- benchmarking against a larger dataset or against a true 3D benchmark to measure accuracy
- collapsing the mesh to a single line for measurements of curvature
- segmenting out the worm 'head'
