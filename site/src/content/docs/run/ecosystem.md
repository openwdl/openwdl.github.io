---
title: "Ecosystem"
description: "WDL execution engines, IDE extensions, development tools, and community workflow repositories."
slug: /docs/start/ecosystem/
section: learn
group: "Overview"
order: 35
kind: reference
legacy:
  - /getting-started/ecosystem
  - /getting-started/ecosystem.html
  - /getting-started/ecosystem/
---

# Ecosystem

WDL has a rich, distributed ecosystem of interconnected developer tools and execution
engines to ensure (a) users can quickly write high-quality, idiomatic workflows, and (b)
scaling the execution of those workflows within any computation environment is a breeze.

:::tip

The WDL ecosystem is rapidly evolving, and, while we're always looking to expand
the list of known ecosystem tools, sometimes tools get missed. If you know of a tool
that needs to be listed here but isn't, we encourage you to [create a pull request] and
let us know!

:::

## Execution Engines

The following list contains the known execution engines listed alphabetically.

| Engine | Type | Version | Local | Slurm | IBM LSF | Amazon AWS | Microsoft Azure | Google Cloud |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| [AWS HealthOmics][aws-healthomics] | Hosted | v1.1 | — | — | — | ✓ | — | — |
| [Cromwell][cromwell] | Binary | v1.0 | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| [dxCompiler][dxcompiler] | Binary | v1.1 | — | — | — | ✓ (DNAnexus) | ✓ (DNAnexus) | — |
| [miniwdl][miniwdl-engine] | Binary | v1.2 | ✓ | ✓ ([plugin][miniwdl-slurm]) | ✓ ([plugin][miniwdl-lsf]) | ✓ ([plugin][miniwdl-aws]) | — | — |
| [Sprocket][sprocket] | Binary | v1.3 | ✓ | ✓ | ✓ | ✓ (TES) | ✓ (TES) | ✓ (TES) |
| [Terra][terra] | Hosted | v1.0 | — | — | — | — | — | ✓ |
| [Toil][toil] | Binary | v1.1 | ✓ | ✓ | ✓ | ✓ | — | ✓ |


## IDE Support

Extensions and other IDE support tools listed sorted by the editor.

| Name | Active\* | Editor | Supports |
| :--- | :---: | :--- | :--- |
| [Sprocket][sprocket] (LSP) | ★ | Editors with LSP | Formatting, linting, snippets, syntax highlighting, and validation. |
| [wdl-mode] | ☆ | Emacs | Syntax highlighting. |
| [poly-wdl] | ☆ | Emacs | Integration with [polymode]. |
| [Sprocket for IntelliJ][sprocket-intellij] | ★ | JetBrains IDEs | Formatting, completions, diagnostics, navigation, and syntax highlighting. |
| [Winstanly WDL] | ☆ | JetBrains IDEs | Linting and syntax highlighting. |
| [wdl-sublime] | ☆ | Sublime Text | Syntax highlighting. |
| [sprocket.nvim] | ★ | Neovim | Formatting, linting, snippets, syntax highlighting, and validation. |
| [wdl-vim] | ☆ | Vim | Syntax highlighting. |
| [Sprocket][sprocket-vscode] (extension) | ★ | Visual Studio Code | Formatting, linting, snippets, syntax highlighting, and validation. |
| [Syntax Highlighter] | ☆ | Visual Studio Code | Syntax highlighting. |
| [Sprocket for Zed][sprocket-zed] | ★ | Zed | Completions, diagnostics, navigation, and syntax highlighting. |

\* **Active:** A filled star (★) marks a project with a commit or release within the
past 12 months; an unfilled star (☆) marks one without qualifying activity. Archived
and deprecated projects receive an unfilled star.

## Development Tools

The following are tools to enhance the experience of working with WDL sorted by
the category.

| Name | Active\* | Category | Description |
| :--- | :---: | :--- | :--- |
| [wdl-tests] | ☆ | Conformance testing | Conformance tests for WDL execution engines. (**Deprecated**) |
| [wdl-aid] | ☆ | Documentation generation | _"Automatic input generation for WDL worflows."_ |
| [pytest-workflow] | ☆ | Testing | Testing framework for workflow languages (including WDL). |
| [wdl-atlas] | ★ | Documentation generation | Generate interactive HTML and workflow diagrams. |
| [wdldoc] | ☆ | Documentation generation | _"Create WDL documentation using Markdown."_ |
| [wdl-packager] | ☆ | Package management | _"Package a WDL and imports into a zip file."_ |
| [pytest-wdl] | ☆ | Testing | _"WDL plugin for pytest."_ |
| [spectool] | ★ | Conformance testing | _"A conformance testing tool for WDL."_ |

\* **Active:** A filled star (★) marks a project with a commit or release within the
past 12 months; an unfilled star (☆) marks one without qualifying activity. Archived
and deprecated projects receive an unfilled star.

## Community Workflows

The following is an incomplete list of large WDL workflow repositories sorted by name.

| Name | Description |
| :--- | :--- |
| [BioWDL] — _LUMC_ | _"Bioinformatics workflows and tasks, written in WDL."_ BioWDL is a large GitHub organization that contains the WDL workflows developed at LUMC ([link](https://lumc.nl)). |
| [Chan Zuckerberg] — _Chan Zuckerberg Initiative_ | Official repository for the WDL workflows developed at the Chan Zuckerberg Initiative for the CZID platform ([link](https://czid.org)). |
| [Dockstore] — _Multiple_ | Dockstore describes itself as "an app store for bioinformatics"—it's an open source platform for sharing analytical tools and workflows. WDL is one of the supported languages. |
| [ENCODE] — _ENCODE Consortium_ | Official repository of the ENCODE Data Coordinating Center's Uniform Processing Pipelines. These pipelines are designed to "create high-quality, consistent, and reproducible data" for the ENCODE project. |
| [GATK] — _Broad Institute_ | Official GATK best practices workflows developed at and published by the Broad Institute's Data Sciences Platform. |
| [PacBio] — _Pacific Biosciences_ | Official repository for the best practices workflows for PacBio data. |
| [St. Jude Cloud] — _St. Jude Children's Research Hospital_ | Official repository for data processing pipelines used on St. Jude Cloud ([link](https://platform.stjude.cloud)). |
| [Thiagen] — _Theiagen Genomics_ | Official repository of Thiagen's WDL workflows. |
| [WARP] — _Broad Institute_ | WARP stands for "WDL Research Analysis Pipelines" and contains cloud-optimized pipelines for processing biological data from the Broad Institute Data Sciences Platform. |
| [WILDS WDL Library] — _Fred Hutch Cancer Center_ | A centralized collection of reusable WDL modules and pipelines for bioinformatics research, featuring tested components for tools like STAR, BWA, GATK, and more. See [documentation](https://getwilds.org/wilds-wdl-library/) for guides and usage examples. |

[aws-healthomics]: https://docs.aws.amazon.com/omics/latest/dev/what-is-healthomics.html
[cromwell]: https://github.com/broadinstitute/cromwell
[dxcompiler]: https://github.com/dnanexus/dxCompiler
[miniwdl-engine]: https://github.com/chanzuckerberg/miniwdl
[miniwdl-slurm]: https://github.com/miniwdl-ext/miniwdl-slurm
[miniwdl-lsf]: https://github.com/adthrasher/miniwdl-lsf
[miniwdl-aws]: https://github.com/miniwdl-ext/miniwdl-aws
[terra]: https://terra.bio/
[toil]: https://toil.ucsc-cgl.org
[create a pull request]: https://github.com/openwdl/docs/pulls
[BioWDL]: https://github.com/biowdl
[Chan Zuckerberg]: https://github.com/chanzuckerberg/czid-workflows
[Dockstore]:
    https://dockstore.org/search?descriptorType=WDL&entryType=workflows&searchMode=files
[ENCODE]: https://www.encodeproject.org/pages/pipelines
[GATK]: https://github.com/gatk-workflows/
[PacBio]: https://github.com/orgs/PacificBiosciences/repositories?q=lang%3Awdl&type=all
[poly-wdl]: https://github.com/jmonlong/poly-wdl
[polymode]: https://github.com/polymode/polymode
[pytest-wdl]: https://github.com/EliLillyCo/pytest-wdl
[pytest-workflow]: https://github.com/LUMC/pytest-workflow
[spectool]: https://github.com/openwdl/spectool
[sprocket-intellij]: https://github.com/stjude-rust-labs/sprocket-intellij
[sprocket-vscode]:
    https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode
[sprocket-zed]: https://github.com/stjude-rust-labs/sprocket-zed
[sprocket.nvim]: https://github.com/stjude-rust-labs/sprocket.nvim
[sprocket]: https://github.com/stjude-rust-labs/sprocket
[St. Jude Cloud]: https://github.com/stjudecloud/workflows
[Syntax Highlighter]:
    https://marketplace.visualstudio.com/items?itemName=broadinstitute.wdl
[Thiagen]: https://github.com/theiagen/public_health_bioinformatics
[WARP]: https://broadinstitute.github.io/warp/docs/get-started/
[wdl-aid]: https://github.com/biowdl/wdl-aid
[wdl-atlas]: https://github.com/lmtani/wdl-atlas
[wdl-mode]: https://github.com/zhanxw/wdl-mode
[wdl-packager]: https://github.com/biowdl/wdl-packager
[wdl-sublime]: https://github.com/broadinstitutewdl-sublime/
[wdl-tests]: https://github.com/openwdl/wdl-tests
[wdl-vim]: https://github.com/broadinstitute/vim-wdl
[wdldoc]: https://github.com/stjudecloud/wdldoc
[WILDS WDL Library]: https://github.com/getwilds/wilds-wdl-library
[Winstanly WDL]: https://plugins.jetbrains.com/plugin/8154-winstanley-wdl
