---
title: "Announcing WDL 1.2.1"
author: Venkat Malladi
date:   2026-02-15 12:00:00 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.2.1

The [OpenWDL](https://openwdl.org/) community is pleased to announce the
release of [Workflow Description Language (WDL)
1.2.1](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md)! The full list of issues and PR's can be found in [1.2.1 milestone](https://github.com/openwdl/wdl/milestone/6?closed=1)

## What's new?

[Workflow Description Language (WDL)
1.2.1](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md) is a patch release that primarily brings forward specification clarifications, test corrections, and infrastructure improvements that were first introduced in [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md). Additionally, this patch addresses many issues with the clarity of the specification around `Directory` and `join_paths`.

### Testing Infrastructure and Improvements

The biggest improvement brought into this release from [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md) is that we have switched our compliance suite to use [spectool](https://github.com/openwdl/spectool). This new tool allows you to parse the examples in a [standardized format](https://github.com/openwdl/spectool/blob/main/docs/SPEC.md) and test cases in the spec into discrete testable WDL files that can be verified by your engine of choice. 

#### Engine compatibility

The improved testing infrastructure allows anyone in the community to make a change and have [Github Actions](https://github.com/openwdl/wdl/tree/wdl-1.2/.github/workflows) that run for the current major engines:

* [Cromwell](https://cromwell.readthedocs.io/en/latest/)
* [miniwdl](https://miniwdl.readthedocs.io/en/latest/)
* [Toil](https://toil.ucsc-cgl.org/)
* [Sprocket](https://sprocket.bio/)

We have created [badges](https://github.com/openwdl/wdl/blob/wdl-1.2/README.md#workflow-description-language-wdl) that highlight how many of the tests pass for each engine. Full compliance will be at 100% pass rate.

### Test Case Bug Fixes and Corrections

Additionally, as we implemented our new Continuous Integration (CI) testing pipeline, we discovered many test cases needed to be fixed or clarified in order to just be executed. Many of these fixes were implemented in [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md) and ported over to this release thanks to [@stxue1](https://github.com/stxue1) and [@vsmalladi](https://github.com/vsmalladi), with contributions from [@jdidion](https://github.com/jdidion) and reviews from [@adamnovak](https://github.com/adamnovak) and [@claymcleod](https://github.com/claymcleod). Below is a summary of some of the big fixes and clarifications.

  * Fixed examples that didn't compile in `wdl-tests` included once that were fixed in [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md) ([#702](https://github.com/openwdl/wdl/pull/702)).
  * Removed Advanced Task Examples to clearly distinguish what is in scope for testing ([#730](https://github.com/openwdl/wdl/issues/730)).
  * Fixed `change_extension_task.wdl` example to use string interpolation when passing `File` to `sub()` function ([#747](https://github.com/openwdl/wdl/issues/747)).


### Specification Clarifications

While this release does not introduce new language features, it significantly improves clarity in several areas of the specification. These changes help ensure consistent behavior across engines and remove ambiguities that had led to confusion or inconsistent implementations.

#### Task and Type Semantics

We clarified several aspects of task evaluation and type behavior. Most notably, `task.return_code` is now explicitly defined as being available only within the `output` section, where it has type `Int` (not `Int?`). This removes ambiguity about when it can be accessed and whether it may be undefined ([#742](https://github.com/openwdl/wdl/pull/742)).

We also clarified that multi-level optionals are not allowed. Optional types must resolve to a concrete underlying type, preventing constructions that were previously underspecified and difficult for engines to handle consistently. For example, `Int??` is not a valid type. However, nested optionals within compound types are allowed, such as `Array[String?]?`, where each `?` applies to a different structural level of the type ([#743](https://github.com/openwdl/wdl/pull/743)).

Together, these updates tighten type semantics and make task evaluation rules more predictable.

##### File, Directory, and Path Behavior

A substantial portion of this release focused on clarifying the behavior of `File` and `Directory` values.

We explicitled state that `File` values cannot refer to directories and `Directory` values cannot refer to files—assigning the wrong kind of path is an error. Paths are not required to exist until they are accessed, but when they are accessed, clear rules apply - clarrified in ([#748](https://github.com/openwdl/wdl/pull/748)) and ([#745](https://github.com/openwdl/wdl/pull/745)):

- Reading requires the path to exist with appropriate permissions.
- Writing requires the appropriate directory to be writable.
- Remote paths must be treated as read-only and only need to be valid at localization time.

We also clarified how paths behave when compared or converted:

- When comparing a `File` or `Directory` to a `String`, the string is first coerced and canonicalized.
- Converting a `Directory` to a `String` does not append a trailing slash.
- The `join_paths` function now returns a `String` (rather than `File`) and expects a `Directory` as its first argument in the relevant overloads.

Relative path resolution is now more precisely defined as well. Outside the `output` section, relative paths resolve relative to the WDL document’s parent directory; inside `output`, they resolve relative to the task’s execution directory. Optional files evaluate to `None` if the referenced path does not exist. We also deprecated relative path literals in input and private variable declarations to reduce ambiguity ([#735](https://github.com/openwdl/wdl/pull/735)).

Finally, we clarified that `disk` mount points are ephemeral: they should not pre-exist in the host environment, or must be empty and have sufficient available space if they do ([#670](https://github.com/openwdl/wdl/pull/670)).

#### Function and Runtime Behavior

Function behavior was clarified in a few important places.

The `sub()` function now has formally defined replacement string syntax. Backreferences `\1` through `\9` are supported, matching the limits of POSIX extended regular expressions. Named capture groups are not currently supported. This removes ambiguity around how replacement strings should be interpreted.

We also clarified `glob()` behavior with respect to symlinks ([#744](https://github.com/openwdl/wdl/pull/744)):

- Symlinks to files are included in results.
- Symlinks to directories are excluded.
- Broken symlinks are included.

These updates help ensure that filesystem-related behavior is consistent and predictable across engines.

### Conclusion

WDL 1.2.1 is a stabilization release for the 1.2.x line. By incorporating the clarifications and test fixes from v1.1.3 and strengthening the compliance infrastructure, this patch improves consistency across engines and reduces ambiguity in key areas of the specification—particularly around `Directory`, path resolution, and `join_paths`.

No new language features were introduced, and no existing functionality was changed. Instead, this release focuses on making the specification clearer, the test suite more reliable, and engine behavior more predictable. These improvements help ensure that WDL workflows behave consistently across implementations and are easier to validate and maintain.

Thank you to everyone who contributed to this milestone, including:

- [@stxue1](https://github.com/stxue1)  
- [@vsmalladi](https://github.com/vsmalladi)  
- [@jdidion](https://github.com/jdidion)  
- [@adamnovak](https://github.com/adamnovak)  
- [@claymcleod](https://github.com/claymcleod)  
- [@peterhuene](https://github.com/peterhuene)  
- [@a-frantz](https://github.com/a-frantz)  
- [@markjschreiber](https://github.com/markjschreiber)

and others who participated in discussion, review, and testing.

As always, we welcome community feedback. If you find areas of the specification that could be improved, please open an [issue](https://github.com/openwdl/wdl/issues) or submit a [pull request](https://github.com/openwdl/wdl/pulls).
