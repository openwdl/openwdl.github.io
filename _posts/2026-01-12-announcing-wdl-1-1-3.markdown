---
title: "Announcing WDL 1.1.3"
author: Venkat Malladi
date:   2026-01-12 12:00:00 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.1.3

The [OpenWDL](https://openwdl.org/) community is pleased to announce the
release of [Workflow Description Language (WDL)
1.1.3](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md)!


## What's new?

This patch release addresses many issues with the clarity of the specification that have been raised by the community and also adds some improvements to its testing infrastrucutre and some bug fixes. Note that this release does not introduce any new features or change any existing functionality.


### Testing Infrastrucutre and Improvements

The biggest improvement introduced in this release is that we have switched our compliance suite to use [spectool](https://github.com/openwdl/spectool). This new tools allows you to parse the examples in a [standardized format](https://github.com/openwdl/wdl-tests/blob/main/docs/MarkdownTests.md) and test cases in the spec into descrete testable WDL files that can be verified by your engine of choice. 

#### Engine compabitibilty

We have improved our testing infrastrucutre so that when anyone in the community wants to make a change we have automatic [Github Actions](https://github.com/openwdl/wdl/tree/wdl-1.1/.github/workflows) that run for the current major engines:

* [Cromwell](https://cromwell.readthedocs.io/en/latest/)
* [miniwdl](https://miniwdl.readthedocs.io/en/latest/)
* [Toil](https://toil.ucsc-cgl.org/)
* [Sprocket](https://sprocket.bio/)

We have created [badges](https://github.com/openwdl/wdl/blob/wdl-1.1/README.md#workflow-description-language-wdl) that hilight how many of thests pass for each engine. Full compliance will be at 100% pass rate.

#### Test Case Bug Fixes and Corrections

Additionally, as we implemented our new Continuous Integration (CI) testing pipeline, we discovered many test cases needed to be fixed or clarified in order to just be executed. Many of these fixes were implemented thanks to [@stxue1](https://github.com/stxue1) and [@vsmalladi](https://github.com/vsmalladi), with contributions from [@jdidion](https://github.com/jdidion) and reviews from [@adamnovak](https://github.com/adamnovak) and [@claymcleod](https://github.com/claymcleod). Below is a summary of some of the big fixes and clarrification 

##### Fixes

    * GPU test example fails due to missing `lspci` command in default containers - fixed by specifying a container with `pciutils` ([#659](https://github.com/openwdl/wdl/pull/659)).
    * WDL comment test incorrectly uses `cat` on numeric values - fixed by using `echo` instead ([#660](https://github.com/openwdl/wdl/pull/660)).
    * Unit test expected outputs mismatch actual workflow outputs (e.g., struct keys, task output names) ([#661](https://github.com/openwdl/wdl/issues/661), [#663](https://github.com/openwdl/wdl/issues/663)) - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * Missing output sections in unit tests causing no outputs in runners ([#662](https://github.com/openwdl/wdl/issues/662)) - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * Call statements missing required inputs or `input:` keyword, violating WDL syntax ([#664](https://github.com/openwdl/wdl/issues/664), [#665](https://github.com/openwdl/wdl/issues/665)) - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * Python heredoc examples with indentation errors causing `IndentationError` ([#668](https://github.com/openwdl/wdl/issues/668)) - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * `read_json()` fails on Python-stringified output due to single quotes - fixed by ensuring valid JSON format ([#671](https://github.com/openwdl/wdl/issues/671)) - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * Various examples with parsing issues, invalid inputs/outputs, or runtime failures - fixed by correcting syntax and logic ([#701](https://github.com/openwdl/wdl/issues/701)) - part of [#706](https://github.com/openwdl/wdl/pull/706).
    * Removed Advanced Task Examples to cleary identify the goals and scope of the testing.  - part of [#706](https://github.com/openwdl/wdl/pull/706).
    * Fixed the unit test for `round()` to properly test for round-half-up behavior as described in the specification - fixed by [#715](https://github.com/openwdl/wdl/pull/715).
    * Removed Advanced Task Examples to clearly distinguish what is in scope for testing ([#730](https://github.com/openwdl/wdl/issues/730)).

* **Specification Clarifications**:
  * Clarrification around `File` - part of [#669](https://github.com/openwdl/wdl/pull/669).
    * The path assigned to a `File` is not required to be valid unless and until it is accessed.
      * To read from a file, it must exist and be assigned appropriate permissions.
      * To write to a file, the parent directory must be assigned appropriate permissions.
    * Remote files must be treated as read-only.
    * A remote file is only required to be vaild at the time that the execution engine needs to localize it.

If you find other areas of the specification that you think need improvement, we welcome
[issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).
