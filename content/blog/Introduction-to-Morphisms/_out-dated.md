---
title: Introduction to Morphisms and Functors
date: "2019-04-23T10:00:00+1000"
author: Zaymon Foulds-Cook
description: Exploring the world of Morphisms and Functors.
---

> This article is currently in draft form and will be subject to change over the coming __time units__.

> I am still in the __research phase__ and I have made my __best efforts__ to provide information that is correct, however, there will __likely be small mistakes__ or __inaccuracies__.

Mathematical jargon is _in my opinion_ the biggest __hinderance__ to FP adoption. __Unfortunately__ the mathematicians got there before programmers when naming abstract concepts.

We can't create new names for things because everyone needs to using a common language. Not having a uniform set of language and definitions would drastically reduce our ability to share of knowledge. However, it's through phrases like _"A monad is just a monoid in category of endofunctors"_ that [real programmers](https://web.mit.edu/humor/Computers/real.programmers) keep the gates to all the good that functional programming has to offer.

I'm writing this article to cement my own to understanding about the various key morphisms or functors commonly encountered in functional programming. I hope in doing so I can help demystify some of the esoteric terms you will hear on your journey.

### 0. Base Morphism
Before jumping into the world of _endomorphism's_, _catamorphism's_, _functors_ and more. We need to understand what a regular old morphism is.

> In mathematics a __morphism__ is a __structure preserving map__ between __two structures__.

Let's break down what that means for the programmers among us. If you are familiar with the concept of `Map` or `Mappable Types` then you are already most of the way there to understanding a __morphism__.

First abstractly we can say that a __morphism__ is the transformation:
```fsharp
A -> B
```
A morphism is a __function__ which takes a __thing__ of `Type A` and converts it into `Type B`.

> In __computing__ and __category theory__ a common name for a function that is a __morphism__ is a __functor__.

#### Morphism Recap
- Any mapping function is a __morphism__ if the function _maps_ or _transforms_ from one type to another.
- __Functors__ are __morphisms__ in computation.

#### Functors
Functors are morphisms where the transformation is expressed as a function.

### 1. Homomorphism | Homofunctor
A __homomorphism__ is a morphism where the transformation __preserves__ the same __structure__.

What is __mathematical structure__?
A __structure__ in mathematics __isn't synonymous__ with what fields a type has. A structure is a more abstract concept and can denote a few different things. The main two sources of structure we programmers are concerned about are:
- Abstract Algebra
- Categories

__Algebraic structure__ is the set of all possible operations on a set of some type. Where the collection of operations on that set is the __Algebra__.

The structure in __category theory__ are categories. Where each category denotes that the type has certain properties, such as: __associativity__ _(operations aren't dependent on order)_ or __identity__ _(some element where the product of the thing and the element results in no change)_.

### 2. Endomorphism | Endofunctor
Now that we know what a __homomorphism__ is, an __endomorphism__ is much easier to explain. An __endomorphism__ is a __homomorphism__ that __maps__ from a __type__ to __itself__.

An __endomorphism__ is the transformation:
```fsharp
A -> A
```

An __endofunctor__ is a function that performs this transformation.

### 3. Isomorphism
An __isomorphism__ is a __morphism__ that is reversible.

An __isomorphism__ is the transformation:
```fsharp
A -> B | where exists a transformation B -> A
```

For the transformation to be isomorphic no information can be lost in either direction of the transformation.

Here is an example of a transformation that is not an __isomorphism__:
```fsharp
["Hello"; " world!"] |> List.fold (+) "" //highlight-line
// Results in "Hello world!"
```
When the `string list` is collapsed into a `string` we _lose information_. There is no function that can take the produced `string` and __definitively calculate__ the `string list` that produced it.

Here is an example of a transformation that is an __isomorphism__:
```fsharp
[10; 20; 30] |> List.map (fun x -> x * 2) //highlight-line
// Results in [20; 40; 60]
```

Since no information about the structure is lost there exists a function that can perform the __reverse transformation__:
```fsharp
[20; 40; 60] |> List.map (fun x -> x / 2) //highlight-line
// Results in [10; 20; 30]
```

