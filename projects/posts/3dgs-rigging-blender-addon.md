---
title: Blender Addon to Rig 3DGS
date: 2026-05-16
description: An open source blender addon to rig 3D Gaussian Splats for animation. 
tags: [blender, 3DGS, novel-view-synthesis]
---

I am in the process of building a Blender Addon to allow users to rig Gaussian Splats. I am working under the guidance of [Dr. Pedro Sander](https://cse.hkust.edu.hk/~psander) (HKUST) and [Dr. Li Ma](https://limacv.github.io/homepage/) (Netflix Eyeline Studios). The [pre-release version is available on my GitHub](https://github.com/Hrsh-Venket/3dgs-rig-blender-addon) and is being built for Blender LTS 4.5.7. The plugin was originally forked from a Gaussian Splatting plugin by Kiri Engine but I have significantly extended it and am building it independently now. 

# Introduction and Design Philosophy

The objective behind the plugin is to allow animators to rig gaussian splats in a way that is natural to them. This means that they should be able to use native blender tools to deform 3D Gaussian Splats for Animation. This should enable them to use mesh deformation methods to work with splats. This is to allow animators to easily capture splats and work with them in Blender alongside their existing 3D scenes. It should therefore at least be usable with amateurishly captured splats as well -- not just splats captured from professional camera rigs.

I will explain the process by which rigging can be done with this plugin alongside supporting images. My examples will be shown on a splat taken on a Samsung Galaxy S23 with less than 150 images


# Importing and editing 3DGS and proxy mesh

First, the user may import their splat and proxy mesh. At this stage, they can use existing blender tools to edit and clean both as they see fit. This is particularly important when using mesh proxies that are inaccurate. 

The operations in this plugin are built around finding a suitable proxy-mesh for a splat and binding them together in such a way that deformations on the mesh are able to help naturally deform the splat.

In the below case, I took a splat of a toy and removed everything but the arm.


![](/assets/img/projects/mesh_and_splat.png)

# Create an Armature and paint weights onto proxy mesh

The next step is natural for Linear Blend Skinning (LBS) and Dual Quaternion Skinning (DQS), which is to create an armature and paint weights onto the proxy mesh

Demonstrating on an arm in isolation allows us to see what LBS and DQS might look like. At the same time, since any mesh based deformation can deform the splats, this plugin can allow for greater flexibility than what I demonstrate below.

![](/assets/img/projects/painted_mesh.png)

# Binding of Splats to Proxy mesh

The animator may then bind the splat to the proxy mesh. There are some options to configure this further, which I shall explain below but the basic operation involves identifying a mesh face to 'bind' each gaussian to. After this step, when the triangle is deformed, the same deformation is applied to the gaussians. 



Position: TBN coordinates are stored and updated are done by checking this

Rotation: Maintain a rotation delta relative to original rotation (at bind time). We use original delta as there can be regular update checks and this ensures idempotency.

Scaling: Maintain TBN ratios with the gaussian, and update them. Amounts to an affine transform being applied the gaussian

## Priority Queue

Assigning gaussians is another problem to consider. A naiive solution is to simply assign gaussians with triangles that are closest to their centre. This is trivial to compute with a bary centric coordinate system and we can bind the gaussian to the closest point on the triangle (think of it like an orthogonal projection onto the triangle)

However, this approach fails to account for many minor issues with proxy meshes. In cases like fingers of a hand, some gaussians which represent one finger may be closer to the mesh faces that represent an adjacent finger. Thus, we use a priority queue that assigns gaussians based:
(1) the difference in distance between closest and second closest triangles
(2) a penalty based on the topological distance on mesh of closest gaussians that have already been assigned. 

During the first iteration we use only the first metric but we add this penalty in future iterations, updating this priority queue (as needed)

## Splitting of large-gaussians

Although the above can provide some decent results, around locations that are heavily deformed, large gaussians that are assigned to small triangles can scale up too fast. This can lead to some strange artifacts as we see below

<figure class="embed">
  <iframe allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=2b199b30"></iframe>
  <figcaption>Original (non-deformed) splat</figcaption>
</figure>

<figure class="embed">
  <iframe allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=f2727cc5"></iframe>
  <figcaption>Basic deformation of splat</figcaption>
</figure>

Thus, we split overly large splats. I use a condition that is fairly common in [papers that discuss mesh-construction at train time](https://arxiv.org/pdf/2402.04796): namely that if a gaussian is about to be assigned, if it's largest dimension > lambda *  the radius of the circumcircle of the triangle it is about to be assigned to, then we split it. Since this condition is mainly introduced in papers during train-time, we need a different solution to split gaussians in Blender. 

[EVSplitting](https://cg.cs.tsinghua.edu.cn/papers/SIGASIA-2024-EVSplitting.pdf) introduces a closed form, visually consistent solution to split gaussians. We uses this closed form solution to split, and maintain the alpha channel to handle the transparency case.

## Strict vs Global Lambda

Although some operations can be vectorised, and I plan to optimise this bind-time operation in the future, an overly strict lambda can lead to the number of gaussians exploding. If we have particularly dense mesh, this is likely to be counter-productive. Most users do not require smaller, highly deformable gaussians outside of certain key regions. In a conventional defomration workflow, users might add additional faces to a mesh near elbows or joints to allow for smother deformation. Similarly, with this addon, users can set a lenient global lambda, and a strict local lambda -- marking specific regions they want to have highly deformable gaussians. 

This process requires much testing and optimsiation, although the below examples show that even with a only using a moderately strict local lambda (1.5) and no global lambda, we can reduce or eliminate many of the artifacts that come from deformation

## Comparision of Results

<figure class="embed">
  <iframe allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=2b199b30"></iframe>
  <figcaption>Original (non-deformed) splat</figcaption>
</figure>

<figure class="embed">
  <iframe allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=f2727cc5"></iframe>
  <figcaption>Basic deformation of splat</figcaption>
</figure>

<figure class="embed">
  <iframe allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=9d023440"></iframe>
  <figcaption>Better deformation with added gaussians</figcaption>
</figure>

## TODO
- Make this plugin more efficient when rendering and especially binding gaussian and proxy mesh
- Some operations are vectorised but can rely more heavily on GPU
- The LTS version of blender I am using uses an older version of python 3.13, which still has a GIL, so non-GIL based solutions in later versions of many libraries (numpy, pytorch) are not utilised.
- Combining gaussians and reducing resolution of the splat where needed can be a good optimisation at both design and rendering time.
- Removing gaussians with very low alpha, particularly those made during deofmration -- a common optimisation usually made during training
- Creating a reliable benchmark for artifacts that come from deformation of gaussian splats, perhaps using synthetic methods and comparing against novel views generated using a high quality mesh


