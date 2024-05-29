---
title: "Announcing WDL 1.2.0"
author: Venkat Malladi
date:   2024-5-29 11:02:15 -0600
categories: wdl bioinformatics workflows
---

### Announcing WDL 1.2.0 Release


The [OpenWDL](https://openwdl.org/) community is pleased to announce the release of [Workflow Description Language (WDL) 1.2.0](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md)! This update introduces several new features and enhancements aimed at improving workflow definition and execution.

**Key Enhancements and Features**

**Scoped Types and Task Enhancements**
- **Scoped Types**: New scoped types support the use of object-like values within the hints section, while maintaining the Object type as deprecated.
- **New Task Requirements and Hints**: Introduced (#540 and #541), replacing the deprecated runtime section.
- **Workflow Hints**: Added a new workflow hints section (#543) and moved `allowNestedInputs` from workflow meta to hints.
- **Default Input Handling**: Deprecated the previous behavior where required task/subworkflow inputs could be left unsatisfied if `allowNestedInputs` was true. Now, all inputs must have a default value or be specified in the call inputs. Optional inputs not explicitly set may be set at runtime if the `allow_nested_inputs` hint is true.
- **Runtime Metadata Access**: You can now access the actual values of requirements, meta, and parameter_meta during runtime.

**Resource Management and Functions**
- **FPGA Resources**: Added `fpga` requirement and reserved hint for requesting FPGA resources.
- **Disk and GPU Resources**: Introduced `disks` and `gpu` reserved hints for specifying resource needs.
- **New Functions**: Added several new functions to the standard library:
  - `contains_key` for checking the existence of a key.
  - `exponentiation operator (**)`.
  - `find` and `matches` for pattern matching.
  - `chunk` for splitting arrays into sub-arrays.
  - `join_paths` for path concatenation.
  - `contains` for checking array contents.
  - Generalized `size` and `length` functions to accept various compound types.
  - `select_first` now includes an optional default parameter.
  - `keys(Struct|Object)` variant for getting member names.
  - `values` function for extracting values from a map.

**Data Handling and Struct Improvements**
- **Parameter Meta in Structs**: Added `parameter_meta` section to struct definitions.
- **Flexible Struct Coercion**: Relaxed rules for coercing object/map to struct, allowing extra keys to be ignored. This change might break existing workflows that rely on strict key matching.
- **Multi-line Strings**: Introduced support for multi-line strings (PR 602).
- **TSV Reading Enhancements**: `read_tsv` can now read field names from a header row or an Array[String], returning an Array[Object] (PR 627).

**Input/Output Handling and Clarifications**
- **Directory Type**: Added a new `Directory` type (PR 641).
- **Read-Only Inputs**: Clarified that input files and directories should be treated as read-only (PR 642).
- **JSON Extended Format**: Added support for JSON extended file/directory input/output format (PR 643).
- **Local Path Evaluation**: Confirmed that local paths are used for evaluating input/private/command expressions.
- **Remote Folder Localization**: Clarified the meaning of a remote parent folder in localization.
- **Error Handling**: Accessing a non-existent member of an object, struct, or call is now explicitly defined as an error.

**Optional Inputs and Quality of Life Improvements**
- **Implicitly Optional Inputs**: Clarified that inputs with defaults are implicitly optional (PR 464 by @mlin).
- **Optional Call Inputs**: Made `input:` optional in call bodies (PR 524 by @mlin).

These updates not only enhance the functionality of WDL but also improve its robustness and usability, making it easier to write, maintain, and run complex workflows. We encourage the community to explore these new features and provide feedback.

For detailed documentation and examples, visit the [OpenWDL GitHub repository](https://github.com/openwdl/wdl).

If you find other areas of the specification that you think need improvement, we welcome issues and pull requests. Stay tuned for more updates and happy coding!