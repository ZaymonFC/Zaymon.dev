---
title: Refactoring Boolean Book Keeping with the Help of F#
date: "2020-06-17 15:04:29"
author: Zaymon Foulds-Cook
description: Stop the mental gymnastics of boolean state management
---

## The Problem
Recently I have been working on an integration within one of our apps:

### Initial Requirements

> - When a new invitation is generated we need to create a record of it.

> - A scheduled task loads all the pending invitations and sends them out.


To start tracking invitations I created a table with a schema like this:

```fsharp
type InvitationRecord =
    { InvitationId: Guid
      ...
      InvitationSent: bool }
```

Starting off simple this is okay. The scheduled task simply loads all invitations where `InvitationSent = False` and then sends an email for each one.

Once that was working I addressed the next requirement:

> - Invitations need to be re-sent on demand

Changing the code we add a new flag to our record and the corresponding column to our database:

```fsharp
type InvitationRecord =
    { InvitationId: Guid
      ...
      InvitationSent: bool
      MarkedForReSending: bool } // highlight-line
```

Now when the invitation needs to be `re-sent` we check `InvitationSent = True` and mark it for re-sending. If it hasn't been processed yet then it's a `noop`. Then the scheduled task queries all invitation that are either `not processed` or `marked for re-sending`

Let's look at the next requirement:

```
- Invitations can be withdrawn
- Invitations can't be completed if they are withdrawn
```

Again we can add another flag:

```fsharp
type InvitationRecord =
    { InvitationId: Guid
      ...
      InvitationSent: bool
      MarkedForReSending: bool
      Withdrawn: bool } // highlight-line
```

Now when querying invitations to send out, we check for:
```
   (InvitationSent = False OR MarkedForReSending = TRUE)
   AND Withdrawn = False
```

A final requirement for this task.

> - Mark when Invitations are completed

You can see where this is going:

```fsharp
type InvitationRecord =
    { InvitationId: Guid
      ...
      InvitationSent: bool
      MarkedForReSending: bool
      Withdrawn: bool
      SignupComplete: bool } // highlight-line
```

Now this is getting ridiculous. It's too hard to know what states are valid at different times. This is what I refer to as __boolean book keeping__.

## The Answer

So how can we simplify this? Here's where the compiler and F# come in. Currently we are operating on a combination of 4 boolean variables.
That means there are `2^n where n is 4` `2^4 = 16` possible combinations of these boolean variables!

Now it should be noted that not all combinations are going to be valid. The motivation for the following refactor is the idea of:

> Making invalid states unrepresentable

First I create a function that takes an `Invitation` and matches on all the booleans:

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    ...
```

Now the compiler is instantly going to complain that I haven't exhausted all possible combinations. `Incomplete pattern matches on this expression.` So let's start our elimination process.


First I add:

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed" // highlight-line
```

I know that no matter what values are in the other columns if `SignupComplete` is `true` in isolation then the process is complete.

The compiler is still yelling at me that I haven't matched all cases so let's encode the case where we need to send the initial invitation: `InvitationSent = False AND Withdrawn = False`

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed"
    | false, false, _, _ -> "Awaiting Invitation Sending" // highlight-line
```

Now let's encode the case where the invitation has been __withdrawn__. We know logically that if the invitation has been __withdrawn__ then the invitation will not be __complete__:

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed"
    | false, false, _, _ -> "Awaiting Invitation Sending"
    | _, true, _, false -> "Withdrawn" // highlight-line
```

Okay now we are getting somewhere but the compiler is still not satisfied. What about when the invitation needs to be __Re-Sent__?

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed"
    | false, false, _, _ -> "Awaiting Invitation Sending"
    | _, true, _, false -> "Withdrawn"
    | _, false, true, _ -> "Awaiting Re-Sending" // highlight-line
```

Now my brain hurting a little and my sensibilities are telling me I should be stopping here. But the compiler is __still__ complaining:

> Incomplete pattern matches on this expression. For example the value (\_, \_\, false, _) may indicate a case not covered by the pattern(s).

Of course! There's still the case where the invitation has been sent and there is nothing to do.

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed"
    | false, false, _, _ -> "Awaiting Invitation Sending"
    | _, true, _, false -> "Withdrawn"
    | _, false, true, _ -> "Awaiting Re-Sending"
    | true, false, false, _ -> "Invitation Sent" // highlight-line
```

Now the compiler is satisfied and we have reduced 16 combinations down to a reasonable 5! There's still some more we can do though, since `Awaiting Invitation Sending` and `Awaiting Re-Sending` are the same logical action we can condense them!

```fsharp
let toState (x: InvitationRecord) =
    match x.InvitationSent, x.Withdrawn, x.ReSendInvitation, x.SignupComplete with
    | _, _, _, true -> "Completed"
    | false, false, _, _ // highlight-line
    | _, false, true, _ -> "Awaiting Invitation Sending" // highlight-line
    | _, true, _, false -> "Withdrawn"
    | true, false, false, _ -> "Invitation Sent"
```

Much better, now we have successfully reduced our state complexity to 4 cases. Time to delete this function and encode this in the type system.

```fsharp
type InvitationStatus =
    | WaitingToSendInvitation
    | InvitationSent
    | Withdrawn
    | SignupComplete
```

Now we can simply store a single value in a new `status` column:

```fsharp
type InvitationRecord =
    { InvitationId: Guid
      ...
      Status: InvitationStatus } // highlight-line
```

When loading invitations we can just query invitations that are in the `WaitingToSendInvitation` status. This system makes it much easier to check different states.

The reason I didn't do this modeling initially is because I was still in the process of discovering the requirements and working out how the system would fit together. Adding booleans is a valid approach of incrementally adding functionality but there comes a point where the burden is high, so use the compiler to help you refactor them away!

### Bonus Section - Defined State Transitions
There's something interesting we can do now to make our modeling safer. We can define the transitions between states to better reflect the domain requirements.

```fsharp
let (==>) x y = x , y // Custom operator to tuple elements

let transitions =
    Map [
        WaitingToSendInvitation ==> InvitationSent
        WaitingToSendInvitation ==> Withdrawn
        InvitationSent ==> WaitingToSendInvitation
        InvitationSent ==> Withdrawn
        InvitationSent ==> Complete
        Withdrawn ==> Withdrawn
        Complete ==> Complete
    ]
```

The usage of this is left as a thought exercise but you see that by defining the transitions between states, and checking if a transformation is allowed before an operation, we can never end up an invalid state. For example we can't go from `Complete` to `WaitingToSendInvitation`.

