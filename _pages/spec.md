---
permalink: /spec/
title: "Specifications"
toc: true
---

## Language Specifications

The WDL specification contains all relevant information for users and developers, including those wanting to implement an execution engine.
The WDL GitHub project uses the branch for the current version of the specification as its primary branch, so you will always see the current version of the specification so long as you visit[WDL root URL](https://github.com/openwdl/wdl).
Users are strongly encouraged to use the current version of the specification unless absolutely necessary.

The most recent released version, **1.1** of the [WDL language specification](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md).

Previous versions of the spec can be found here:

- [1.0](https://github.com/openwdl/wdl/blob/main/versions/1.0/SPEC.md)

There are a number of draft versions that correspond to initial efforts at creating WDL.
While these are functional specifications, they should not be considered feature complete, and they contain many bugs and irregularities.

- [draft-3](https://github.com/openwdl/wdl/blob/main/versions/draft-3/SPEC.md)
- [draft-2](https://github.com/openwdl/wdl/blob/main/versions/draft-2/SPEC.md)
- [draft-1](https://github.com/openwdl/wdl/blob/main/versions/draft-1/SPEC.md)

The next *minor* version of the specification is [1.2](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md).
All development of new *non-breaking* features should be done against that branch.

The next *major* version of the specification is [2.0](https://github.com/openwdl/wdl/blob/wdl-2.0/SPEC.md).
All development of new *breaking* features should be done against that branch.

## Versioning

WDL versioning follows [semantic versioning](https://semver.org) conventions.

The WDL *language* has a two-number version (e.g., `1.1`).
An increase in the minor (second) version number (e.g., `1.0` to `1.1`) indicates the addition of, or non-breaking changes to, the language or standard library functions.
An increase in the major (first) version number (e.g., `1.0` to `2.0`) indicates that breaking changes have been made.

The WDL *specification* has a three-number version (e.g., `1.1.1`).
The specification version tracks the language version, but there may also be patch releases (indicated by a change to the patch, or third, version number) that include fixes for typos, additional examples, or non-breaking clarifications of ambiguous language.