---
title: "Task aliasing"
description: "Call the same task multiple times under unique names within a workflow."
slug: /docs/start/patterns/task-aliasing/
section: learn
group: "Design patterns"
order: 40
kind: pattern
legacy:
  - /design-patterns/task-aliasing
  - /design-patterns/task-aliasing.html
  - /design-patterns/task-aliasing/
---

# Task aliasing

Occasionally, you will need to call the same task multiple times within the same
workflow. For example, you might need to run the same variant caller between two samples
to determine the variants that are unique to one. Another interesting use case might be
to run the same variant caller on the same sample with different parameters to examine
the differences. In these cases, you'll want to reach for **task aliasing** to ensure
that the names for each `call` remain unique.

![A diagram showing three steps: `stepA`, `stepB`, and `stepC`. `stepA` is run twice
with aliases `first` and `second`: both of these instances take one input from
(`sampleA` and `sampleB` respectively) and produce a single output (`out`). `stepB`
takes one input (`value`) that is connected to `out` from `first`. `stepC`
takes one input (`value`) that is connected to `out` from `second`. Both `stepB` and
`stepC` produce a single output (`out`). In this way, the utility of aliasing multiple
`call`s of the same task is demonstrated.](/docs/patterns/task-aliasing/header.png)

This often takes a form similar to the following example.

```wdl
# ... task definitions ...

workflow run {
    # `taskA` is run twice—this is enabled using task aliasing.
    call stepA as first {}
    call stepA as second {}

    # `stepB` takes in the output from the `first` task.
    call stepB { value = first.out }

    # `stepC` takes in the output from the `second` task.
    call stepC { value = second.out }
}
```

[gVCFs]:
    https://gatk.broadinstitute.org/hc/en-us/articles/360035531812-GVCF-Genomic-Variant-Call-Format
[joint genotyping step]:
    https://gatk.broadinstitute.org/hc/en-us/articles/360037057852-GenotypeGVCFs
