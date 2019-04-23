---
title: All the Morphisms
date: "2019-04-23T10:00:00+1000"
author: Zaymon Foulds-Cook
description: Exploring the world of Morphisms in FP.
---

__Morphisms__ are _in my opinion_ the biggest __hinderance__ to FP adoption. It's through _morphisms_ that __real programmers__ keep the gates to all that functional programming has to offer. I'm writing this article to cement my own to understanding about the various key morphisms commonly encountered in functional programming. I hope in doing so I can be of benefit to you as well.

### 0. Base Morphism
Before jumping into the world of _endomorphism's_, _catamorphism's_, _funktors_ and more. We need to understand what a regular old morphism is.

> In mathematics a __morphism__ is a __structure preserving map__ between __two structures__.

Let's break down what that means for the programmers among us. If you are familiar with the concept of `Map` or `Mappable Types` then you are already most of the way there to understanding a __morphism__.

First abstractly we can say that a __morphism__ is the transformation 
```
A -> B
```
That's all. A morphism is any __structure__ or __function__ which takes a __thing__ of `Type A` and converts it into `Type B`. There's one __caveat__.