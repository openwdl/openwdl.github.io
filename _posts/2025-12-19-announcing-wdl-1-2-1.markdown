---
title: "Announcing WDL 1.2.1"
author: Venkat Malladi
date:   2025-12-19 12:00:00 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.2.1

The [OpenWDL](https://openwdl.org/) community is pleased to announce the
release of [Workflow Description Language (WDL)
1.2.1](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md)!

This release includes clarifications, deprecations, bug fixes to examples, and improvements to the testing infrastructure:

* Clarified that disk mount points are ephemeral and should not already exist.

* Deprecated the use of relative path literals in input and private variable declarations.

* Included fixes to examples introduced in v1.1.3.

* Fixed issues with examples that don't compile in wdl-tests thanks to Thanks to [@adamnovak](https://github.com/adamnovak), [@stxue1](https://github.com/stxue1), [@claymcleod](https://github.com/claymcleod) and [@vsmalladi](https://github.com/vsmalladi):
  * HISAT2 example uses unsupported `--sra-acc` option - fixed by updating to valid options.
  * GATK example has mismatched chromosome indexing - fixed by correcting indexing.
  * Various examples with parsing issues, invalid inputs/outputs, or runtime failures - fixed by correcting syntax and logic.
  * Large external files in examples (3-4GB references and 25GB BAM) made testing impractical - fixed by removing advanced examples.
  * Incorrect type comparison between `String` and `File` in test workflows - fixed by correcting comparison logic.
  * Incorrect expected output JSON keys preventing proper parsing - fixed by updating key names.
  * Task output omitted from expected outputs section - fixed by adding the expected output.
  * WDL float substituted into Bash integer comparison causing shell error - fixed by changing field to integer type.

* Added CI/CD pipelines for MiniWDL, Sprocket, Toil, and Cromwell to ensure spec compliance.

* Removed Advanced Task Examples to clearly distinguish what is in scope for testing.

If you find other areas of the specification that you think need improvement, we welcome
[issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).