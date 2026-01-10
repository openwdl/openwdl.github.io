---
title: "Announcing WDL 1.2.1"
author: Venkat Malladi
date:   2026-1-10 12:00:00 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.2.1

The [OpenWDL](https://openwdl.org/) community is pleased to announce the
release of [Workflow Description Language (WDL)
1.2.1](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md)!

This release includes clarifications, deprecations, bug fixes to examples, and improvements to the testing infrastructure:

* **File and Directory Semantics**:
  * Clarify `File` and `Directory` path canonicalization, validation, and equality semantics. Clarify when `File`s and `Directories` must exist (at declaration evaluation time, not access time). Add `Directory` comparison operators to binary operators table.
  * Clarify that `File` values cannot refer to directories and `Directory` values cannot refer to files; attempting to assign the wrong type of path is an error.
  * Update `join_paths` function: change return type from `File` to `String` (since the result can be either a file or directory path), and change first argument from `File` to `Directory` for the first two overloads.
  * Clarified that when a `Directory` is converted to a `String`, the resulting string does not have a trailing slash.
  * Clarified symlink handling behavior in the `glob` function.

* **Path Resolution and Deprecations**:
  * Clarified that relative paths in `File` and `Directory` declarations are resolved relative to the WDL document's parent directory outside the `output` section, and relative to the task's execution directory inside the `output` section. Also clarified that optional files evaluate to `None` in both contexts if the path does not exist.
  * Deprecated the use of relative path literals in input and private variable declarations.
  * Clarified that disk mount points are ephemeral and should not already exist.

* **Function and Type Clarifications**:
  * Clarified that `task.return_code` is only available in the `output` section, where it has type `Int` rather than `Int?`.
  * Formalize replacement string syntax for `sub()` function to specify backreference support (`\1` through `\9`).
  * Clarified the restriction on multi-level optionals in the "Optional Types" section.

* **Example Fixes**:
  * Included fixes to examples introduced in v1.1.3.
  * Fixed issues with examples that don't compile in wdl-tests thanks to [@adamnovak](https://github.com/adamnovak), [@stxue1](https://github.com/stxue1), [@claymcleod](https://github.com/claymcleod) and [@vsmalladi](https://github.com/vsmalladi):
    * HISAT2 example uses unsupported `--sra-acc` option - fixed by updating to valid options.
    * GATK example has mismatched chromosome indexing - fixed by correcting indexing.
    * Various examples with parsing issues, invalid inputs/outputs, or runtime failures - fixed by correcting syntax and logic.
    * Large external files in examples (3-4GB references and 25GB BAM) made testing impractical - fixed by removing advanced examples.
    * Incorrect type comparison between `String` and `File` in test workflows - fixed by correcting comparison logic.
    * Incorrect expected output JSON keys preventing proper parsing - fixed by updating key names.
    * Task output omitted from expected outputs section - fixed by adding the expected output.
    * WDL float substituted into Bash integer comparison causing shell error - fixed by changing field to integer type.
    * Fix `change_extension_task.wdl` example to use string interpolation when passing `File` to `sub()` function.

* **Testing Infrastructure Improvements**:
  * Added CI/CD pipelines for MiniWDL, Sprocket, Toil, and Cromwell to ensure spec compliance.
  * Updates the compliance suite to use [`spectool`](https://github.com/openwdl/spectool).
  * Removed Advanced Task Examples to clearly distinguish what is in scope for testing.

If you find other areas of the specification that you think need improvement, we welcome
[issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).
