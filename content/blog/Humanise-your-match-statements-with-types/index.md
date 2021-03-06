---
title: Humanise your match statements with types in fsharp
date: "2019-04-16T10:00:00+1000"
author: Zaymon Foulds-Cook
description: Exploring the application of single use types and active patterns to enhance the readability of match expressions.
---

### The Problem
I've been programming in fsharp for a little over 3 months.  I've noticed a repeating struggle when it comes to matching on multiple variables or expressions in match statements.

Consider the following function.

```fsharp
let handleDeleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (isAdmin: bool)
  (canDeleteUser: bool)
  (user: User) =

  match isAdmin, canDeleteUser with
  | true, true -> deleteUser user
  | false, true -> deleteUserWithLogging user
  | _, _ -> ()
```

You're probably thinking _"This is perfectly readable I don't see a problem here."_ Let's dial up the complexity a little bit.

```fsharp
let handleDeleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (currentUser: User)
  (permissions: Permission list)
  (user: User) =

  let canDeleteUsers = permissions |> List.contains CanDeleteUser

  match currentUserType, canDeleteUsers, user.Type with
  | Admin, true, _ -> deleteUser user
  | User, true, User -> deleteUserWithLogging user
  | User, true, Admin -> failwith "Cannot delete admin user"
  | _, _, _ -> failwith "You do not have the required permissions"
```

Very quickly the mental overhead 🤯 required to parse multivariable match statements gets in the way of code readability.

#### Some Problems:
- Code is hard to scan at a glance
- Logic for branching is hard to maintain because there is no name given to cases and the logic is often spread throughout a poorly structured function
- Matching on __combinations__ of different types can be confusing such as `bool` and `UserType`
- Calculating booleans in a greater control flow is __brittle__ and __clutters__ the function

### Introducing - single use types
Creating a private single use type serves two purposes:
- __Modularize__ match logic
- Create __human readable__ control flow

Lets create a type for our complicated example. First what would you name each branch? There are four options:
1. Permitted
2. PermittedWithLogging
3. CannotDeleteAdminAsUser
4. NotPermitted

The code the best represents this is naturally a discriminated union:
```fsharp
let private DeletionActions =
  | Permitted
  | PermittedWithLogging
  | CannotDeleteAdminAsUser
  | NotPermitted
```
> It should be noted that this type `DeletionActions` should be __as specific__ as possible. Since there is no case for reuse and its visibility is private we really want to __tailor__ the type to the expression at hand.

We can encode our match logic into a static constructor which is a member of the type `DeletionActions`.

```fsharp
  let private DeletionActions =
  | Permitted
  | PermittedWithLogging
  | CannotDeleteAdminAsUser
  | NotPermitted
with
  static member OfConditions currentUserType permissions user : DeletionActions =
    let canDeleteUsers = permissions |> List.contains CanDeleteUser
    match currentUserType, canDeleteUsers, user.Type with
    | Admin, true, _ -> Permitted
    | User, true, User -> PermittedWithLogging
    | User, true, Admin -> CannotDeleteAdminAsUser
    | _, _, _ -> NotPermitted
```

Now refactoring the original code we can see how much clearer it is.
```fsharp
let handleDeleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (currentUser: User)
  (permissions: Permission list)
  (user: User) =

  let action = DeletionActions.OfConditions currentUserType permissions user // highlight-line

  match action with // highlight-line
  | Permitted -> deleteUser user
  | PermittedWithLogging -> deleteUserWithLogging user
  | CannotDeleteAdminAsUser -> failwith "Cannot delete admin user"
  | NotPermitted -> failwith "You do not have the required permissions"
```

Some may argue that this technique is _obscuring_ the logic for matching and branching. And in some cases this would be __overkill__ and is unnecessary.
However, for more complicated examples like the one above, by clearly defining a __boundary__ around the match logic we are forcing ourselves to write all of the logic in one place.

### Using Active Patterns
This same logic can be encoded into an `Active Pattern`.
```fsharp
// highlight-start
let (|Permitted|PermittedWithLogging|CannotDeleteAdminAsUser|NotPermitted|)
  (currentUserType, permissions, user) =
    let canDeleteUsers = permissions |> List.contains CanDeleteUser
    match currentUserType, canDeleteUsers, user.Type with
    | Admin, true, _ -> Permitted
    | User, true, User -> PermittedWithLogging
    | User, true, Admin -> CannotDeleteAdminAsUser
    | _, _, _ -> NotPermitted
// highlight-end

let handleDeleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (currentUser: User)
  (permissions: Permission list)
  (user: User) =

  match (currentUserType, permissions, user) with // highlight-line
  | Permitted -> deleteUser user
  | PermittedWithLogging -> deleteUserWithLogging user
  | CannotDeleteAdminAsUser -> failwith "Cannot delete admin user"
  | NotPermitted -> failwith "You do not have the required permissions"
```

In this case the active pattern's definition is the structure of the union we want to match on. The body of the active pattern is our matching logic. The active pattern takes a tuple of parameters, very similar to how our types static member took the three parameters. The active pattern's usage is _inferred_ in the `handleDeleteUser` function based on the tuple of parameters which match the pattern and the union cases we are matching on.

#### Which approach is right for me?
_It depends_.

I see _pros_ and _cons_ in both approaches. From a _correctness_ point of view they are both __perfectly valid__. They both __humanise__ and __encapsulate__ the match logic. It comes down to a matter of _personal taste_.

~~I personally prefer `single use types` because the call to convert from the input parameters to the decision cases is more explicit, however, they are more boiler plate code in comparison to `active patterns`.~~

**Update July 2019:** Although I think `active patterns` incur a little more mental overhead at first, I believe that they are the superior choice for representing single use types. The savings in syntax combined with the amount composability and payload carrying properties make `active patterns` my current choice in the production software I work on.

#### The Wrap
So far in my experience coming into a codebase with many long functions where match logic is often spread out, condensing multivariable match logic into `single use types` or `active patterns` is a very effective way to __reduce the time required__ to understand the rules at play.

---
If you disagree, have any suggestions for extending this technique or have questions about the approach  __please don't hesitate__ to get in touch with me on twitter :>.
