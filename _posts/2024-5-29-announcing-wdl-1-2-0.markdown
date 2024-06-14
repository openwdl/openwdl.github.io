---
title: "Announcing WDL 1.2.0"
author: Venkat Malladi, John Didion
date:   2024-5-29 11:02:15 -0600
categories: wdl bioinformatics workflows
---

# Announcing WDL 1.2.0 Release

The [OpenWDL](https://openwdl.org/) community is pleased to announce the release of [Workflow Description Language (WDL) 1.2.0](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md)! This update introduces several new features and enhancements aimed at improving workflow definition and execution.

## Support for Directory Inputs and Outputs

From the very beginning, WDL has had first-class support for files as inputs to, and outputs from, workflows and tasks. In WDL 1.2, the new [`Directory`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#files-and-directories) type brings first-class support for directories as well.

```wdl
version 1.2

# concatenate the contents of all files in a directory
task directory_example {
    input {
        Directory dir
    }

    command <<<
    for file in ~{dir}; do
      cat $file
    done
    >>>

    output {
        File concatenated = stdout()
    }
}
```

When a task has a `Directory`-typed input parameter, the directory that is passed as a value will be "staged in" to the task's execution environment in the same way that files are staged for `File`-typed input parameters. The execution engine determines how to make the contents of the directory available (e.g., symlinking or copying local files, or downloading remote files), and then it updates the value of the parameter to contain the path to where the directory was staged.

Similarly, when a task has a `Directory`-typed output parameter, the local directory path assigned to it will be "staged out" after the task has completed successfully.

```wdl
version 1.2

task directory_output {
    command <<<
    mkdir out
    for n in {1..10}; do
      echo $n > out/file.$n
    done
    >>>

    output {
        Directory dir = "out/"
    }
}
```

Just like a file, the contents of a directory can change in between executions of a workflow. However, unlike a file, it is not always easy (or even possible) for an execution engine to determine if the contents of a directory have changed. For example, cloud object storage services (such as AWS S3 or Azure Blob) do not provide a checksum for folders the same way they do for files. This means that the reproducibility of a workflow that takes a directory input cannot be guaranteed, which means that job caching cannot be used.

WDL 1.2 provides a solution to this reproducibility problem with the [Extended File/Directory Input/Output Format](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#extended-filedirectory-inputoutput-format). An execution engine that supports this format will accept a [JSON input file](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#json-input-format) in which a directory input is specified as a listing of the files within that directory. The execution engine will only localize the listed files, and it will fail with an error if any of the listed files do not exist.

```json
{
  "wf.indir": {
    "basename": "foo",
    "listing": [
      {
        "type": "File",
        "location": "/mnt/data/results/foo/bar.txt",
        "basename": "something_else.txt"
      },
      {
        "type": "Directory",
        "basename": "baz",
        "listing": [
          {
            "type": "File",
            "location": "/home/fred/qux.fa"
          }
        ]
      }
    ]
  }
}
```

This can even be used to construct a directory at runtime that consists of files from disparate sources.

## Requirements and Hints

Previously the `runtime` section of a WDL task has been used to declare the resources that the task requires at runtime, such as the number of CPUs or amount of memory. However, the `runtime` section has two major issues that have become clear over time:

1. It allows arbitrary attributes that may not be supported by all WDL execution engines.
2. It allows mixing of "requirements" - resources that the task must have in order to run - and "hints" - attributes that may be used by the execution engine to optimize the execution of the task, but which are not strictly required.

In WDL 1.2, both of these issues are addressed by the introduction of two new sections - [`requirements`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-requirements-section) and [`hints`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-hints-section) - that replace the `runtime` section. The `requirements` section contains a controlled set of attributes that are hard requirements of the task - if any of them cannot be satisfied, then the task fails. The `hints` section, on the other hand, specifies requested resources that the execution may or may not honor, depending on its capabilities. While there are some reserved hints, the user is free to specify additional arbitrary hints that may be specific to an execution engine, a cloud environment, or an HPC job scheduler. The task must be written such that it can complete successfully even if some of its hints are not satisfied.

```wdl
version 1.2

task dynamic_container {
  input {
    String image_tag = "latest"
    String ubuntu_release
  }

  command <<<
    cat /etc/*-release | grep DISTRIB_CODENAME | cut -f 2 -d '=' > ubuntu_release
    nvcc -V > cuda_version
  >>>
  
  output {
    String is_expected_release = ubuntu_release == read_string("ubuntu_release")
    String cuda_version = read_string("cuda_version")
  }

  requirements {
    container: "nvidia/cuda:~{image_tag}"
    gpu: true
  }

  hints {
    gpu: 2
  }
}
```

WDL 1.2 adds a new `fpga` requirement. Similar to `gpu`, the `fpga` requirement specifies whether the task requires at least one FPGA resource. This is important to support bioinformatics tools such as Illumina's DRAGEN, which uses FPGAs for accelerated alignment and variant calling. WDL 1.2 also adds the `disks`, `gpu`, `fpga` reserved hints, which enable workflow authors to provide more specific resource requests, such as a specific type of disk or model of GPU.

Requirements and hints represent resource requests to the execution engine, which has some flexibility in how it satisfies them. For example, a workflow author may specify a `memory: "6GiB"` requirement, but the execution engine running the workflow may only be able to provision memory amounts in powers-of-two, so the execution environment would actually have 8 GiB of memory. When writing a task, it can be useful (or even necessary) to know what resources are actually available at runtime. While it is possible to determine the available resources using tools such as `nproc` and `free`, such tools are sometimes specific to the operating system, and their output may require parsing. WDL 1.2 solves this issue with the new implicit [`task` object](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#runtime-access-to-requirements-hints-and-metadata) that is available within the `command` and `output` sections and provides the runtime values for all requirements, as well as access to the task's metadata.

Another new addition in WDL 1.2 is the [workflow `hints`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#workflow-hints) section, which is used to specify hints that apply to all tasks in a workflow or to the orchestration of the workflow itself. Workflow hints used to be specified in the `meta` section, but this behavior is now deprecated.

Currently, the only reserved workflow hint is `allow_nested_inputs`, which is a `boolean` value that, when set to `true`, allows the user to set or override at runtime the values of optional task and subworkflow inputs (assuming the execution engine supports this option).

Note that, previously, `allow_nested_inputs` also applied to required task/subworkflow inputs, but that behavior is now deprecated. Required inputs must always be set in the `call` inputs and/or have a default value.

## New and Improved Standard Library Functions

WDL 1.2 introduces several new functions to the standard library, as well as improvements to some existing functions.

The [`join_paths`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-join_paths) function is now the preferred way to concatenate paths (instead of using the `+` operator).

```wdl
version 1.2

task resolve_paths_task {
  input {
    File abs_file = "/usr"
    String abs_str = "/usr"
    String rel_dir_str = "bin"
    File rel_file = "echo"
    File rel_dir_file = "mydir"
    String rel_str = "mydata.txt"
  }

  # these are all equivalent to '/usr/bin/echo'
  File bin1 = join_paths(abs_file, [rel_str_dir, rel_file])
  File bin2 = join_paths(abs_str, [rel_str_dir, rel_file])
  File bin3 = join_paths([abs_str, rel_str_dir, rel_file])
  
  # the default behavior is that this resolves to 
  # '<working dir>/mydir/mydata.txt'
  File data = join_paths(rel_dir_file, rel_str)
  
  # this resolves to '<working dir>/bin/echo', which is non-existent
  File doesnt_exist = join_paths([rel_dir_str, rel_file])
  command <<<
    mkdir ~{rel_dir_file}
    ~{bin1} -n "hello" > ~{data}
  >>>

  output {
    Boolean bins_equal = (bin1 == bin2) && (bin1 == bin3)
    String result = read_string(data)
    File? missing_file = doesnt_exist
  }
  
  runtime {
    container: "ubuntu:latest"
  }
}
```

The new [`matches`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-matches) and [`find`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-find) functions perform pattern matching on a `String`. The difference between these functions is that `matches` will tell you if there is at least one pattern match in the string, while `find` will return the contents of the first match.

```wdl
version 1.2

workflow contains_string {
  input {
    File fastq = "HG002_R1.fq.gz"
  }

  output {
    String sample_id = find(basename(fastq), "[^_]+")
    Boolean is_compressed = matches(basename(fastq), "\\.(gz|zip|zstd)")
    Boolean is_read1 = matches(basename(fastq), "_R1")
  }
}
```

The [`contains`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-contains) function checks for the existence of a value in an array.

```wdl
version 1.2

task null_sample {
  command <<<
  echo "Sample array contains a null value!"
  >>>
}

task missing_sample {
  input {
    String name
  }

  command <<<
  echo "Sample ~{name} is missing!"
  >>>
}

workflow test_contains {
  input {
    Array[String?] samples
    String name
  }

  Boolean has_null = contains(samples, None)
  if (has_null) {
    call null_sample
  }
  
  Boolean has_missing = !contains(samples, name)
  if (has_missing) {
    call missing_sample { input: name }
  }

  output {
    Boolean samples_are_valid = !(has_null || has_missing)
  }
}
```

The [`chunk`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-chunk) function splits an array up into equal-sized chunks. This is useful for scattering over batches of inputs.

```wdl
version 1.2

workflow chunk_array {
  Array[String] s1 = ["a", "b", "c", "d", "e", "f"]
  Array[String] s2 = ["a", "b", "c", "d", "e"]
  Array[String] s3 = ["a", "b"]
  Array[String] s4 = []
  
  scatter (a in chunk(s1, 3)) {
    String concat = sep("", a)
  }

  output {
    Boolean is_reversible = s1 == flatten(chunk(s1, 3))
    Array[Array[String]] o1 = chunk(s1, 3)
    Array[Array[String]] o2 = chunk(s2, 3)
    Array[Array[String]] o3 = chunk(s3, 3)
    Array[Array[String]] o4 = chunk(s4, 3)
    Array[String] concats = concat
  }
}
```

The [`keys`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#keys) function can now be used to get the names of members in an `Object` or `Struct` in addition to the keys in a `Map`.

The [`contains_key`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#-contains_key) function is used to check for the existence of a key in a `Map` or a member in an `Object`, or `Struct`. This function has a variant that takes an `Array[String]` of key names and performs a recursive search on a nested compound type.

```wdl
version 1.2

struct Person {
  String name
  Map[String, String]? details
}

workflow test_contains_key {
  input {
    Person person
  }

  output {
    String? phone = p1.details["phone"] if contains_key(person, ["details", "phone"]) else None
  }
}
```

The [`select_first`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#select_first) function now accepts an optional section parameter, a default value to use if the array does not have any non-`None` values.

```wdl
version 1.2

workflow test_select_first {
  output {
    # both of these statements evaluate to 5
    Int fiveA = select_first([], 5)
    Int fiveB = select_first([None], 5)
  }
}
```

The [`size`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#size) function now accepts all compound value inputs (i.e., `Pair`, `Map`, `Struct`, and `Object`, in addition to `Array`) and computes the total size of all files contained within the value to any level of nesting.

```wdl
version 1.2

task file_sizes {
  command <<<
    printf "this file is 22 bytes\n" > created_file
  >>>

  File? missing_file = None

  output {
    File created_file = "created_file"
    Map[String, Pair[Int, File]] nested = {
      "a": (10, created_file),
      "b": (50, missing_file)
    }
    Float nested_bytes = size(nested)
  }
  
  requirements {
    container: "ubuntu:latest"
  }
}
```

The [`length`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#length) function also now accepts more types or arguments - `String`, `Map`, and `Object`, in addition to `Array`.

```wdl
version 1.2

workflow test_length {
  Map[String, Int] m = {"a": 1, "b", 2}
  String s = "ABCDE"

  output {
    Int mlen = length(m)
    Int slen = length(s)
  }
}
```

Finally, the [`read_tsv`](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#read_tsv) function now has a variant that reads field names either from a header row or an `Array[String]` and returns an `Array[Object]`.

```wdl
version 1.2

task read_tsv {
  command <<<
    {
      printf "row1\tvalue1\n"
      printf "row2\tvalue2\n"
      printf "row3\tvalue3\n"
    } >> data.no_headers.tsv

    {
      printf "header1\header2\n"
      printf "row1\tvalue1\n"
      printf "row2\tvalue2\n"
      printf "row3\tvalue3\n"
    } >> data.headers.tsv
  >>>

  output {
    Array[Array[String]] output_table = read_tsv("data.no_headers.tsv")
    Array[Object] output_objs1 = read_tsv("data.no_headers.tsv", false, ["name", "value"])
    Array[Object] output_objs2 = read_tsv("data.headers.tsv", true)
    Array[Object] output_objs3 = read_tsv("data.headers.tsv", true, ["name", "value"])
  }
}
```

## Multi-line Strings

Previously, wrapping a long string over multiple lines required breaking it into multiple strings and concatenating it.

WDL 1.2 introduces [multi-line strings](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#multi-line-strings), which have the same syntax and whitespace handling behavior as the task `command` section.

```wdl
version 1.2

workflow multiline_strings1 {
  output {
    String s = <<<
      This is a
      multi-line string!
    >>>
  }
}
```

## Struct Enhancements

Structs can now have their own `meta` and `parameter_meta` sections, just like tasks and workflows.

It is [now allowed](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#struct-to-struct-coercion) to coerce between types from a struct value that includes a superset of keys in the target type. **Note: This change might break existing workflows that rely on strict key matching.**

```wdl
version 1.2

struct A {
  String s
}

Struct B {
  A a_struct
  Int i
}

struct C {
  String s
}

struct D {
  C a_struct
  Int i
}

workflow struct_to_struct {
  B my_b = B {
    a_struct: A { s: 'hello' },
    i: 10
  }
  # We can coerce `my_b` from type `B` to type `D` because `B` and `D`
  # have members with the same names and compatible types. Type `A` can
  # be coerced to type `C` because they also have members with the same
  # names and compatible types.
  
  output {
    D my_d = my_b
  }
}
```

## The Call `input:` Clause is Optional

A minor but much-requested change in WDL 1.2 is to make the `input:` clause optional in `call`s.

```wdl
version 1.2

task repeat {
  input {
    Int i = 5
    String? value
  }
  
  command <<<
  for i in 1..~{i}; do
    printf ~{select_first([value, "default"])}
  done
  >>>

  output {
    Array[String] lines = read_lines(stdout())
  }
}

workflow call_example {
  input {
    Int i
  }

  # Calls repeat with one required input - it is okay to not
  # specify a value for repeat.value since it is optional.
  call repeat { i = i }

  # Since the workflow and task inputs have the same name, we
  # can make the call even simpler:
  call repeat as repeat2 { i }
}
```

## Clarifications

WDL 1.2 provides clarification of some parts of the spec that were previously confusing or under-specified:

* Input files and directories should be treated as read-only. Workflow engine implementers are encouraged to enforce this behavior.
* Local (i.e., post-localization) paths are always used when evaluating an expression for an input, private variable, or command section.
* Accessing a non-existent member of an object, struct, or call is now explicitly defined as an error.
- [Inputs with default expressions are implicitly optional](https://github.com/openwdl/wdl/blob/wdl-1.2/SPEC.md#optional-inputs-with-defaults).

## Conclusions

These updates not only enhance the functionality of WDL but also improve its robustness and usability, making it easier to write, maintain, and run complex workflows. We encourage the community to explore these new features and provide feedback.

For detailed documentation and examples, visit the [OpenWDL GitHub repository](https://github.com/openwdl/wdl).

If you find other areas of the specification that you think need improvement, we welcome issues and pull requests. Stay tuned for more updates and happy coding!