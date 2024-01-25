---
title: "Announcing WDL 1.1.1"
author: John Didion
date:   2023-12-16 11:02:15 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.1.1 Release

The [OpenWDL](https://openwdl.org/) community is pleased to announce the release of [Workflow Description Language (WDL) 1.1.1](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md)! This post highlights the most important changes in this release.

## About WDL

If you're new to WDL, it is an open standard for describing data processing workflows with a human-readable and writable syntax. It is designed for accessibility, portability, and efficiency. There are several [implementations](https://github.com/openwdl/wdl/tree/wdl-1.1#execution-engines-and-platforms) to choose from that run in a variety of environments, including HPC systems and cloud platforms.

## What's new?

This patch release addresses many issues with the clarity of the specification that have been raised by the community and also adds some improvements to its readability and utility. Note that this release does not introduce any new features or change any existing functionality.

### Example or Test Case? Why Not Both?

The biggest improvement introduced in this release is to the examples. Every example has been reviewed (and updated if necessary) to ensure that it is valid, executable WDL. In addition, nearly every example has been converted to a [standardized format](https://github.com/openwdl/wdl-tests/blob/main/docs/MarkdownTests.md) that enables it to be used as a test case. If you see an arrow (►) next to the title of an example, you can click it to view inputs that can be used to run the example, as well as the expected outputs.

![unit-test](/assets/images/unit-test.png)

**An example that is also a test case**

We invite the community to contribute additional test cases to the [WDL Tests](https://github.com/openwdl/wdl-tests) repository. Our eventual goal is to curate the specification-derived and the contributed tests into a compliance suite that can be used to validate implementations.

### Hidden Types

WDL is a strongly typed language - every variable, function parameter, and return value has a [type](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#types), and implementations perform static analysis to ensure that assigned values are of the correct type. However, the WDL type system has some [quirks and inconsistencies](https://github.com/openwdl/wdl/issues/373) that the community has been working to address.

[Hidden Types(https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#hidden-types)] are a new concept added in this release to better explain some existing behavior that many users have found confusing. A hidden type is one that may only be instantiated by the execution engine and cannot be used in a declaration within a WDL file.

Currently, there is only one hidden type, Union, that represents a value that may have any one of several concrete types. A Union value must always be coerced to a concrete type. There are two places where the Union type is used:

1. It is the type of the special [`None`](https://dev.to/openwdl/announcing-wdl-111-ccj#:~:text=of%20the%20special-,None,-value%2C%20which%20can) value, which can be assigned to an Optional of any type.
2. It is the return type of the [`read_json`](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#read_json) standard library function, which returns a different type of value depending on the contents of the JSON file.

In the next major version of WDL (2.0), the `Object` type will also become hidden. Previously, the `Object` type - as well as all functions that took an `Object` parameter and/or had an `Object` return type - were marked as deprecated. Since an `Object`'s contents are determined at runtime, it is opaque to static analysis. It is better to instead use [structs](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#custom-types-structs) in which the names and types of members are declared explicitly. However, we came to recognize that `Object` and the related standard library functions still offer utility. Thus, in WDL 1.1.1, those standard library functions have been "un-deprecated" and will remain in the standard library going forward.

### A More Organized Standard Library

WDL has a [standard library](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#standard-library) of nearly 50 functions to perform some of the most commonly needed operations in data processing workflows. Previously, the specification simply presented all of these functions in a big list without much rhyme or reason to its organization, and it was difficult to find the right function if you didn't already know its name. In WDL 1.1.1, the functions have been ordered by argument type to make it easier to find what you need.

### A Branch for Every Version

In addition to specification changes, the organization of the GitHub repository is also changing. The current version of the repository (the `main` branch, also tagged as [`legacy`](https://github.com/openwdl/wdl/tree/legacy)) is now read-only. Going forward, each version of the specification will have its own permanent branch (beginning with [`wdl-1.1`](https://github.com/openwdl/wdl/tree/wdl-1.1)). On GitHub, the default branch (the one you see when you go to [https://github.com/openwdl/wdl](https://github.com/openwdl/wdl)) will always be set to the branch for the current version of the specification.

If you compare the legacy and current branches, you'll notice that the organization of files and directories has also changed. Some folders (`highlighters`, `runners`, `scripts`) were largely vestigial and have been removed completely, with any still-relevant content moved to the [`README`](https://github.com/openwdl/wdl/blob/wdl-1.1/README.md). The grammars and parsers now have [their own repository](https://github.com/openwdl/wdl-parsers). And there is no longer a `versions` directory; instead, each branch is specific to a single version of the specification, which lives in the root directory (older versions of the specification are preserved in the `main` branch).

These changes to the repository have implications for linking and for submitting pull requests.

## What's Next?

The WDL community is already hard at work on [WDL 1.2](https://github.com/openwdl/wdl/discussions/473), which is planned for release in 2024. Importantly, this release includes all non-breaking changes from the development version of the specification. Stay tuned for another post highlighting those upcoming changes.

The community is also working on WDL 2.0 (also called development). This is the next major version of the specification and will introduce some breaking changes intended to improve the language for the long-term.

## Reach out!

The WDL community depends on your involvement to thrive. You are encouraged to ask questions, help other users, and make contributions where you can. Interactions occur primarily on [GitHub](https://github.com/openwdl/wdl) and [Slack](https://join.slack.com/t/openwdl/shared_invite/zt-ctmj4mhf-cFBNxIiZYs6SY9HgM9UAVw). Please see the [README](https://github.com/openwdl/wdl/tree/wdl-1.1#community-and-support) for the full list of community resources.