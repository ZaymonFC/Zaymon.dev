---
title: Humanise your match statements with types in fsharp
date: "2019-04-16T10:00:00+1000"
author: Zaymon Foulds-Cook
description: Exploring the application of single use types to enhance the readability of match expressions.
---

### The Problem
I've been programming in fsharp for a little over 3 months.  I've noticed a repeating struggle when it comes to matching on multiple variables or expressions in match statements.

```fsharp
let deleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (isAdmin: bool)
  (canDeleteUser: bool)
  (user: User) =

  match isAdmin canDeleteUser with
  | true, true -> deleteUser user
  | false, true -> deleteUserWithLogging user
  | _, _ -> ()
```

You're probably thinking _"This is perfectly readable I don't see any problem here."_ Let's dial up the complexity a little bit.

```fsharp
let deleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (currentUser: User)
  (permissions: Permission list)
  (user: User) =

  let canDeleteUsers = permissions |> List.contains CanDeleteUser

  match currentUserType canDeleteUsers user.Type with
  | Admin, true, _ -> deleteUser user
  | User, true, User -> deleteUserWithLogging user
  | User, true, Admin -> failwith "Cannot delete admin user"
  | _, _, _ -> failwith "You do not have the required permissions"
```

Very quickly the mental overhead 🤯 required to parse match statements gets in the way of code readability.

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
> It should be noted that this type `DeletionActions` should be __as specific__ as possible. Since there is no case for reuse and it's visibility is private we really want to
tailor the type to the expression at hand.

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
    match currentUserType canDeleteUsers user.Type with
    | Admin, true, _ -> Permitted
    | User, true, User -> PermittedWithLogging
    | User, true, Admin -> CannotDeleteAdminAsUser
    | _, _, _ -> NotPermitted
```

Now refactoring the original code we can see how much clearer it is.
```fsharp
let deleteUser
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit)
  (currentUser: User)
  (permissions: Permission list)
  (user: User) =

  let action = DeletionActions.OfConditions currentUserType permissions user

  match action with
  | Permitted -> deleteUser user
  | PermittedWithLogging -> deleteUserWithLogging user
  | CannotDeleteAdminAsUser -> failwith "Cannot delete admin user"
  | NotPermitted -> failwith "You do not have the required permissions"
```

Some may argue that this technique is _obscuring_ the logic for matching and branching. And in some cases this would be __overkill__ and is unnecessary.
However, for more complicated examples like the one above, by clearly defining a __boundary__ around the match logic we are forcing ourselves to write all of the logic in one place.

Coming into a codebase with many long functions where permission and other match logic is often spread out,
condensing the logic into types like this is a very effective way to reduce the time required to understand the rules at play.
---
If you disagree or have any suggestions for extending this technique __please__ get in touch with me on twitter :>.
