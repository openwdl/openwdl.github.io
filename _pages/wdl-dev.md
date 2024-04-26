---
permalink: /wdl-dev/
title: "WDL Development"
toc: true
---

## Execution Engines and Platforms

WDL does not have an official implementation.
Third parties are relied upon to provide installable software or hosted platforms that interpret and execute WDL workflows and tasks.
Although WDL does not yet have an official compliance program or certification process, implementers are expected to design their tools according to the specification so as to maximize the portability of workflows across implementations.
Nonetheless, implementers may provide additional optional features specific.
Please see the documentation associated with each tool/platform for information on available execution options and support.

| Implementation                                                                 | Requires Installation | Local Execution | HPC   | Cloud                 |
| ------------------------------------------------------------------------------ | --------------------- | --------------- | ----- | --------------------- |
| [AWS HealthOmics](https://docs.aws.amazon.com/omics/latest/dev/workflows.html) | No                   | No              | No    | AWS                   |
| [Cromwell](https://github.com/broadinstitute/cromwell) *                       | Yes                   | Yes             | Many  | AWS Batch, Azure, GCP |
| [dxCompiler](https://github.com/dnanexus/dxCompiler)                           | Yes                   | No              | No    | DNAnexus              |
| [MiniWDL](https://github.com/chanzuckerberg/miniwdl)                           | Yes                   | Yes             | SLURM | AWS Batch             |
| [Terra](https://terra.bio/)                                                    | No                    | No              | No    | Azure, GCP            |

\* Also see [WDL Runner](https://github.com/broadinstitute/wdl-runner), a script for launch WDL workflows on GCP using Cromwell

## Grammars, Parsers, and Language Support

- The WDL [parsers repository](https://github.com/openwdl/wdl-parsers/) provides grammar definitions in various formats and generated parsers for various languages.
- [MiniWDL](https://github.com/chanzuckerberg/miniwdl) provides python bindings for WDL as well as commandline tools for validation, linting, and generating workflow input templates.
- [WOMTool](https://cromwell.readthedocs.io/en/stable/WOMtool/) is a standalone Java tool for WDL parsing, validating, linting, and diagramming.
- [wdlTools](https://github.com/dnanexus/wdlTools) - provides 1) a parser Java/Scala library, based on the  [ANTLR4 grammars](https://github.com/openwdl/wdl-parsers) grammars, for WDL draft-2, 1.0, 1.1, and 2.0; and 2) command-line tools for sytanx checking, type-checking, linting, code formatting (including upgrading from older to newer WDL versions), generating documentation, and executing WDL tasks locally.
- [sprocket](https://github.com/stjude-rust-labs/sprocket) a package manager and linter for WDL files.

## IDE Support

| IDE                | Tool                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Emacs              | [poly-wdl](https://github.com/jmonlong/poly-wdl)                                                 |
| Emacs              | [wdl-mode](https://github.com/zhanxw/wdl-mode)                                                   |
| JetBrains          | [Winstanly](https://plugins.jetbrains.com/plugin/8154-winstanley-wdl)                            |
| Sublime            | [WDL Syntax Highlighter](https://github.com/broadinstitute/wdl-sublime-syntax-highlighter)       |
| Vim                | [vim-wdl](https://github.com/broadinstitute/vim-wdl)                                             |
| Visual Studio Code | [WDL Syntax Highlighter](https://marketplace.visualstudio.com/items?itemName=broadinstitute.wdl) |

## Documentation

- [wdl-aid](https://github.com/biowdl/wdl-aid) generates documentation for the inputs of WDL workflows, based on the parameter_meta information defined in the WDL file.	
- [wdldoc](https://github.com/stjudecloud/wdldoc)

## Testing

- [wdl-tests](https://github.com/openwdl/wdl-tests) is a collection of test cases for WDL implementations. A specification is provided for writing new tests that are compatible with automated testing frameworks.
- [Pytest-workflow](https://github.com/LUMC/pytest-workflow) is a implementation-agnostic workflow tester. It can be used with both Cromwell and MiniWDL. Uses pytest as the underlying test framework. Tests can be specified in either YAML format or python code.
- [Pytest-wdl](https://github.com/EliLillyCo/pytest-wdl) is a plugin for the pytest unit testing framework that enables testing of WDL tasks and workflows. Tests can be specified in either YAML format or python code.

## Packaging

- [miniwdl zip](https://miniwdl.readthedocs.io/en/latest/zip.html) generates a ZIP file including a given WDL source code file and any other WDL files it imports. The ZIP file can be supplied directly to miniwdl run, which can extract it automatically.
- [wdl-packager](https://github.com/biowdl/wdl-packager) packages a workflow and all of its imports into a zip file. The zip can be used as an imports zip package for cromwell. The utility can add non-WDL files (such as the license) to the zip package and provides options to package the zip in a binary reproducible way.
