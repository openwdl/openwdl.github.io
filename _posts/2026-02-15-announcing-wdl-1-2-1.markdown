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

The improved testing infrastructure alows anyone in the community can make a change and have [Github Actions](https://github.com/openwdl/wdl/tree/wdl-1.2/.github/workflows) that run for the current major engines:

* [Cromwell](https://cromwell.readthedocs.io/en/latest/)
* [miniwdl](https://miniwdl.readthedocs.io/en/latest/)
* [Toil](https://toil.ucsc-cgl.org/)
* [Sprocket](https://sprocket.bio/)

We have created [badges](https://github.com/openwdl/wdl/blob/wdl-1.2/README.md#workflow-description-language-wdl) that highlight how many of the tests pass for each engine. Full compliance will be at 100% pass rate.

#### Test Case Bug Fixes and Corrections

Additionally, as we implemented our new Continuous Integration (CI) testing pipeline, we discovered many test cases needed to be fixed or clarified in order to just be executed. Many of these fixes were implemented in [Workflow Description Language (WDL) [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md) and ported over to this release thanks to [@stxue1](https://github.com/stxue1) and [@vsmalladi](https://github.com/vsmalladi), with contributions from [@jdidion](https://github.com/jdidion) and reviews from [@adamnovak](https://github.com/adamnovak) and [@claymcleod](https://github.com/claymcleod). Below is a summary of some of the big fixes and clarifications.


##### Example and Test Fixes

  * Include fixes to examples that don't complie in `wdl-tests` and fixed in [v1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md)  ([#702](https://github.com/openwdl/wdl/pull/702)).
  * Removed Advanced Task Examples to clearly distinguish what is in scope for testing ([#730](https://github.com/openwdl/wdl/issues/730)).
  * Fix `change_extension_task.wdl` example to use string interpolation when passing `File` to `sub()` function ([#747](https://github.com/openwdl/wdl/issues/747)).


##### Specification Clarifications

##### Task Semantics

  *  Clarified that `task.return_code` is only available in the `output` section, where it has type `Int` rather than `Int?` ([#742](https://github.com/openwdl/wdl/pull/742)).

##### String and `sub()` Function Behavior
  
  *  Formalize replacement string syntax for `sub()` function to specify backreference support (`\1` through `\9`) matching the limit of POSIX ERE. Named capture groups are not currently supported ([#749](https://github.com/openwdl/wdl/pull/749)).


##### Optional Types

  * Clarified multi-level optionals are not allowed in the "Optional Types" section ([#743](https://github.com/openwdl/wdl/pull/743)).

##### `File` and `Directory` Semantics

  * Clarification around `File` and `Directory` - part of ([#748](https://github.com/openwdl/wdl/pull/748)).
    * `File` values cannot refer to directories and `Directory` values cannot refer to files; attempting to assign the wrong type of path is an error.
    * The path assigned to a `File` and `Directory` is not required to be valid unless and until it is accessed.
      * To read from a `File` or `Directory`, it must exist and be assigned appropriate permissions.
      * To write to a file, the path's parent directory must be accessible for writing.
      * To write to a directory, it must exist and be accessible for writing.
    * Remote files or directories must be treated as read-only.
    * A remote file is only required to be valid at the time that the execution engine needs to localize it.
    * When comparing a `File` or `Directory` to a `String`, the `String` is first coerced to `File` or `Directory` (and thus canonicalized) before the comparison is performed.
    *  Update `join_paths` function: change return type from `File` to `String` (since the result can be either a file or directory path), and change first argument from `File` to `Directory` for the first two overloads.
  * Clarified that when a `Directory` is converted to a `String`, the resulting string does not have a trailing slash ([#745](https://github.com/openwdl/wdl/pull/745)).
  
##### `glob()` Behavior

  * Clarified symlink handling behavior in the `glob` function. Symlinks that point to files are included in the results, while symlinks that point to directories are excluded. Broken symlinks (those that point to non-existent targets) are included ([#744](https://github.com/openwdl/wdl/pull/744)).

##### Relative Path Resolution

  * Clarified that relative paths in `File` and `Directory` declarations are resolved relative to the WDL document's parent directory outside the `output` section, and relative to the task's execution directory inside the `output` section. Also clarified that optional files evaluate to `None` in both contexts if the path does not exist ([#735](https://github.com/openwdl/wdl/pull/735)).

##### Disk Mount Semantics

  * Clarified that `disk` mount points are ephemeral and should not already exist in the host environment, or it must be empty and have at least the requested amount of space available ([#670](https://github.com/openwdl/wdl/pull/670)).


If you find other areas of the specification that you think need improvement, we welcome
[issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).
