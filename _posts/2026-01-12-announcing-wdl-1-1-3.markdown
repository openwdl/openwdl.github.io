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

This release includes several bug fixes, clarifications, and improvements to the testing infrastructure:

* **Bug Fixes and Example Corrections**:
  * Fixed issues with testing examples thanks to [@stxue1](https://github.com/stxue1) and [@vsmalladi](https://github.com/vsmalladi):
    * GPU test example fails due to missing `lspci` command in default containers - fixed by specifying a container with `pciutils`.
    * WDL comment test incorrectly uses `cat` on numeric values - fixed by using `echo` instead.
    * Unit test expected outputs mismatch actual workflow outputs (e.g., struct keys, task output names).
    * Missing output sections in unit tests causing no outputs in runners.
    * Call statements missing required inputs or `input:` keyword, violating WDL syntax.
    * Python heredoc examples with indentation errors causing `IndentationError`.
    * `read_json()` fails on Python-stringified output due to single quotes - fixed by ensuring valid JSON format.
    * HISAT2 example uses unsupported `--sra-acc` option - fixed by updating to valid options.
    * GATK example has mismatched chromosome indexing - fixed by correcting indexing.
    * Various examples with parsing issues, invalid inputs/outputs, or runtime failures - fixed by correcting syntax and logic.
  * Fixed the unit test for `round()` to properly test for round-half-up behavior as described in the specification.

* **Specification Clarifications**:
  * Clarified that a file is not required to exist or be accessible until and unless it is accessed.

* **Testing Infrastructure Improvements**:
  * Added CI/CD pipelines for MiniWDL, Sprocket, Toil, and Cromwell to ensure spec compliance.
  * Removed Advanced Task Examples to clearly distinguish what is in scope for testing.
  * Updates the compliance suite to use [spectool](https://github.com/openwdl/spectool).

If you find other areas of the specification that you think need improvement, we welcome
[issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).
