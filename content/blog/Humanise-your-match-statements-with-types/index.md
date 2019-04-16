---
title: Humanise your match statements with types in fsharp
date: "2019-04-16T10:00:00+1000"
author: Zaymon Foulds-Cook
description: Something something
---

### The Problem
I've been programming in fsharp for a little over 3 months.  I've noticed a repeating pattern when it comes to using booleans in match statements.

```fsharp
let deleteUser
  (user: User)
  (isAdmin: bool)
  (canDeleteUser: bool)
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit) =

  match isAdmin canDeleteUser with
  | true, true -> deleteUser user
  | false, true -> deleteUserWithLogging user
  | _, _ -> ()
```

You're probably thinking _"This is perfectly readable I don't see any problem here."_ Let's dial up the complexity a little bit.

```fsharp
let deleteUser
  (user: User)
  (currentUser: User)
  (permissions: Permission list)
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit) =

  let canDeleteUsers = permissions |> List.contains CanDeleteUser

  match currentUserType canDeleteUsers user.Type with
  | Admin, true, _ -> deleteUser user
  | User, true, User -> deleteUserWithLogging user
  | User, true, Admin -> failwith "Cannot delete admin user"
  | _, _, _ -> failwith "You do not have the required permissions"
```

Very quickly the mental overhead 🤯 required to parse match statements gets in the way of code readability.

Some Problems:
- Code is hard to scan at a glance
- Logic for branching is hard to maintain because there is no name given to cases

### Introducing - single use types
Creating a private single use type serves two purposes:
- Modularize match logic
- Create human readable control flow

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
  (user: User)
  (currentUser: User)
  (permissions: Permission list)
  (deleteUser: User -> unit)
  (deleteUserWithLogging: User -> unit) =

  let action = DeletionActions.OfConditions currentUserType permissions user

  match action with
  | Permitted -> deleteUser user
  | PermittedWithLogging -> deleteUserWithLogging user
  | CannotDeleteAdminAsUser -> failwith "Cannot delete admin user"
  | NotPermitted -> failwith "You do not have the required permissions"
```