---
title: "Announcing WDL 1.1.2"
author: John Didion
date:   2024-4-15 11:02:15 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.1.2 Release

The [OpenWDL](https://openwdl.org/) community is pleased to announce the release of [Workflow Description Language (WDL) 1.1.2](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md)!

This is a small release with only a few clarifications to the WDL 1.1 specification:

* It is now [explicitly stated](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#binary-operators-on-primitive-types) that boolean expressions have "short-circuiting" behavior, i.e.
  * For `A && B`, if `A` evalutes to `false` then `B` is not evaluated.
  * For `A || B`, if `A` evaluates to `true` then `B` is not evaluated.
* It is now [explicitly stated](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#read_boolean) that the `read_boolean` function is case-insensitive.
* It is now stated that the [Union type](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#union) that was [introduced in WDL 1.1.1](https://openwdl.org/wdl/bioinformatics/workflows/announcing-wdl-1-1-1/#hidden-types) is also the type of `runtime` attributes that accept multiple types of values (e.g. [`memory`](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#memory), which an accept an `Int` or `String`).
* Clay McLeod contributed a PR to improve the descriptions of [`task`](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#read_boolean)s and [`workflow`](https://github.com/openwdl/wdl/blob/wdl-1.1/SPEC.md#read_boolean)s to make it explicit the number of times each element is allowed.
* We added to the [RFC guidelines](https://github.com/openwdl/wdl/blob/wdl-1.1/RFC.md) that every signficant addition or change to the specification now requires [accompanying test cases](https://github.com/openwdl/wdl/blob/wdl-1.1/tests/README.md) to be accepted.

If you find other areas of the specification that you think need improvement, we welcome [issues](https://github.com/openwdl/wdl/issues) and [pull requests](https://github.com/openwdl/wdl/pulls).