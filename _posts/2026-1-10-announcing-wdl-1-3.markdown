---
title: "Announcing WDL v1.3"
author: Clay McLeod
date:   2026-1-10 12:00:00 -0600
categories: wdl bioinformatics workflows
---

It's been a while since our last release! WDL v1.2 introduced features like the `Directory` type, multi-line strings, and the `requirements`/`hints` sections, but that was several years ago. Since then, execution engines have been steadily improving, and [Sprocket](https://github.com/stjude-rust-labs/sprocket) recently became the first engine to fully support the 1.2 spec. With a complete implementation now available, we have the foundation to confidently move forward. Throughout this period, the community has continued to file issues, propose enhancements, and—reasonably—wonder what's next for WDL.

Today, we're happy to announce the answer to that question—WDL v1.3. This release focuses on quality-of-life improvements: features that reduce friction in everyday workflow development and clarifications that make WDL's behavior more predictable across execution engines. There are no breaking changes, just refinements that address long-standing requests.

We'll cover the main additions below: `else` and `else if` clauses for conditional statements, enumeration types, dynamic resource allocation for retrying tasks, and a handful of smaller improvements.

## Language Ergonomics

### Conditional Statements with `else`

WDL has always supported conditional blocks via `if`, but until now there was no `else` clause. To express mutually exclusive branches, you had to write two separate `if` statements with negated conditions. WDL v1.3 introduces `else` and `else if` clauses, as discussed in [#268](https://github.com/openwdl/wdl/issues/268) and [#697](https://github.com/openwdl/wdl/issues/697) and implemented in [#699](https://github.com/openwdl/wdl/pull/699).

For example, now you can express cascading conditional clauses like so:

```wdl
version 1.3

workflow spellcaster {
  input {
    String element  # "Fire", "Ice", or "Lightning"
  }

  if (element == "Fire") {
    String incantation = "fireball"
    Int power = 10
  } else if (element == "Ice") {
    String incantation = "frost nova"
    Int power = 8
  } else if (element == "Lightning") {
    String incantation = "lightning bolt"
    Int power = 12
  }

  # The user may not have provided one of the three choices above,
  # so we have to check if these are defined here.
  if (defined(incantation) && defined(power)) {
    call cast {
      # Now that we know they're defined, `select_first` won't fail.
      words = select_first([incantation]),
      strength = select_first([power])
    }
  }

  output {
    Float? damage = cast.damage
  }
}

task cast {
  input {
    String words
    Int strength
  }

  command <<<
    echo "Casting '~{words}' with power ~{strength}!" >&2
    awk "BEGIN { printf \"%.2f\", rand() * ~{strength} }"
  >>>

  output {
    Float damage = read_float(stdout())
  }
}
```

### The `split` Function

Before WDL v1.3, splitting a string on a delimiter required writing a task that shells out to `awk` or a similar tool—overhead that's hard to justify for something so simple. As requested in [#553](https://github.com/openwdl/wdl/issues/553), WDL v1.3 adds a `split` standard library function in [#729](https://github.com/openwdl/wdl/pull/729).

```wdl
version 1.3

task parse_spell {
  input {
    String incantation  # e.g., "fireball-big-fast"
  }

  Array[String] words = split(incantation, "-")
  String base_spell = words[0]

  command <<<
    echo "Casting ~{base_spell} with ~{length(words)} modifiers"
  >>>

  output {
    String spell = base_spell
    Int power = length(words)
  }
}
```

### Version Compatibility

Previously, WDL enforced strict version matching on imports—a WDL v1.3 workflow couldn't import a WDL v1.2 task, even though minor versions are backward compatible. This created a problem when contemplating package management extensions to the language. For example, if another organization published a shared task library at v1.2 and you wanted to use it from a v1.3 workflow, you couldn't. The only workarounds were to fork the library or wait for it to be updated.

In anticipation of package management features coming in a future version of WDL, v1.3 relaxes this requirement in [#698](https://github.com/openwdl/wdl/pull/698). Documents can now import any document with the same major version and a minor version less than or equal to their own. A v1.3 workflow can import v1.2 tasks; a v1.2 workflow cannot import v1.3 tasks.

## Type Safety

### Enumeration Types

Something's been bothering me about our spell-casting example. The workflow accepts a `String` for the element, but spells aren't arbitrary strings—they're a fixed set. What if someone passes `"fire"` instead of `"Fire"`? Or `"Frie"` by mistake? None of the conditions match, so nothing gets called. The workflow silently does nothing. And that `defined()` check with `select_first()` to unwrap the optionals—it works, but it's not pretty.

Since we have a fixed set of valid options, we can better express this as an enum, which is simply a closed set of choices. WDL v1.3 introduces enumeration types in [#695](https://github.com/openwdl/wdl/pull/695), allowing you to do the following:

```wdl
version 1.3

enum Element {
  Fire,
  Ice,
  Lightning
}

workflow spellcaster {
  input {
    Element element
  }

  if (element == Element.Fire) {
    String incantation = "fireball"
    Int power = 10
  } else if (element == Element.Ice) {
    String incantation = "frost nova"
    Int power = 8
  } else if (element == Element.Lightning) {
    String incantation = "lightning bolt"
    Int power = 12
  }

  call cast {
    # We know that the `element` _must_ match one of the enum choices,
    # meaning that these `select_first`s will never fail and we can omit
    # the `defined` checks.
    words = select_first([incantation]),
    strength = select_first([power])
  }

  output {
    Float damage = cast.damage
  }
}

task cast {
  input {
    String words
    Int strength
  }

  command <<<
    echo "Casting '~{words}' with power ~{strength}!" >&2
    awk "BEGIN { printf \"%.2f\", rand() * ~{strength} }"
  >>>

  output {
    Float damage = read_float(stdout())
  }
}
```

Now the input is constrained—only `Fire`, `Ice`, or `Lightning` are valid. Typos fail loudly at validation time or input parsing time, not silently at runtime. For example, Sprocket complains if you try to provide a choice that is not one of these at validation time:

```bash
$ sprocket run enum.wdl -e spellcaster element="Water"
# error: type mismatch: expected type `Element`, but found
# type `String`: cannot coerce type `String` to type
# `Element`: variant `Water` not found in enum `Element`
# (variants: `Fire`, `Ice`, `Lightning`)
```

We can improve this example further. Both the incantation and power of each spell are fixed, so why define them separately? Enums in WDL are *valued*—each choice can carry an associated value of any WDL type, including structs. We can store both properties directly in the enum and extract them with the `value()` standard library function:

```wdl
version 1.3

struct Spell {
  String incantation
  Int power
}

enum Element {
  Fire = Spell { incantation: "fireball", power: 10 },
  Ice = Spell { incantation: "frost nova", power: 8 },
  Lightning = Spell { incantation: "lightning bolt", power: 12 }
}

workflow spellcaster {
  input {
    Element element
  }

  Spell spell = value(element)

  call cast { spell = spell }

  output {
    Float damage = cast.damage
  }
}

task cast {
  input {
    Spell spell
  }

  command <<<
    echo "Casting '~{spell.incantation}' with power ~{spell.power}!" >&2
    awk "BEGIN { printf \"%.2f\", rand() * ~{spell.power} }"
  >>>

  output {
    Float damage = read_float(stdout())
  }
}
```

This pattern is common—a fixed set of choices where each maps to specific values. Valued enums express it concisely and let execution engines provide better validation and error messages.

## Resilient Workflows

### Dynamic Resource Allocation

Some tasks fail not because of bugs, but because they need more resources than initially allocated. The fix is often simple: retry with more memory or disk. Before WDL v1.3, the `task` variable was only accessible in `command` and `output` sections. You couldn't use it in `requirements`, `hints`, or `runtime` sections where resource allocation actually happens. Further, even where it was accessible, you only had access to a limited set of information about the current task (such as the task attempt number in `task.attempt`).

As discussed in [#696](https://github.com/openwdl/wdl/issues/696), WDL v1.3 expands the `task` variable to be available in these sections and adds `task.previous` in [#734](https://github.com/openwdl/wdl/pull/734), which provides direct access to the previous attempt's computed requirements, allowing you to express a wide array of dynamic retry logic. Last, `task.max_retries` appears to have been accidentally omitted from the `task` type in WDL v1.2, so it was added in WDL v1.3 (see [#732](https://github.com/openwdl/wdl/issues/732) and [#733](https://github.com/openwdl/wdl/pull/733)).

```wdl
version 1.3

task count_primes {
  input {
    Int max_number
  }

  command <<<
    # Simulate failure on the first two attempts
    if [ ~{task.attempt} -lt 2 ]; then
      echo "Attempt ~{task.attempt}: not enough resources, failing..." >&2
      exit 1
    fi

    # On the third attempt, do the real work
    awk 'BEGIN {
      count = 0
      for (n = 2; n <= ~{max_number}; n++) {
        is_prime = 1
        for (i = 2; i * i <= n; i++) {
          if (n % i == 0) { is_prime = 0; break }
        }
        if (is_prime) count++
      }
      print count
    }'
  >>>

  requirements {
    cpu: task.attempt + 1
    memory: "~{2 ** task.attempt} GB"
    max_retries: 3
  }

  output {
    Int prime_count = read_int(stdout())
  }
}
```

On the first attempt, the task requests 1 CPU and 1 GB of memory. If it fails and retries, it increments CPUs and doubles memory—2 CPUs and 2 GB on the second attempt, 3 CPUs and 4 GB on the third attempt, and so on. In this way, the task adapts to what is needed dynamically. 

For more complex logic, `task.previous` provides direct access to the previous attempt's computed requirements. Each field (e.g., `task.previous.cpu`, `task.previous.memory`) is optional since there's no previous attempt on the first try. This is useful when your retry logic depends on the actual values from the previous attempt—for example, doubling memory when it's small but capping it once it exceeds a threshold:

```wdl
version 1.3

task count_primes {
  input {
    Int max_number
    String starting_memory = "1 GB"
  }

  command <<<
    # Simulate failure on the first two attempts
    if [ ~{task.attempt} -lt 2 ]; then
      echo "Attempt ~{task.attempt}: not enough resources, failing..." >&2
      exit 1
    fi

    # On the third attempt, do the real work
    awk 'BEGIN {
      count = 0
      for (n = 2; n <= ~{max_number}; n++) {
        is_prime = 1
        for (i = 2; i * i <= n; i++) {
          if (n % i == 0) { is_prime = 0; break }
        }
        if (is_prime) count++
      }
      print count
    }'
  >>>

  requirements {
    cpu: task.attempt + 1
    memory: (
      # First attempt: use `starting_memory` parameter
      if !defined(task.previous.memory) then starting_memory
      # Under `8 GB`: double it
      else if select_first([task.previous.memory]) < 8000000000
        then "~{floor(select_first([task.previous.memory]) / 500000000)} GB"
      # At `8 GB` or above: cap at `16 GB`
      else "16 GB"
    )
    max_retries: 3
  }

  output {
    Int prime_count = read_int(stdout())
  }
}
```

## Stability

Beyond new features, WDL v1.3 includes clarifications that make the language more predictable across implementations.

### Path Resolution and File Existence

Prior to WDL v1.3, the specification was ambiguous about how `File` and `Directory` declarations behave. As reported in [#673](https://github.com/openwdl/wdl/issues/673) and [#676](https://github.com/openwdl/wdl/issues/676), identical code could produce different results depending on where it appeared: a declaration like `Array[File?] files = ["example.txt"]` would behave differently in private declarations versus output sections.

The clarifications in [#735](https://github.com/openwdl/wdl/pull/735) resolve this by explicitly defining:

- **What relative paths are relative to**: Outside the `output` section, relative paths resolve relative to the WDL document's parent directory. Inside the `output` section, they resolve relative to the task's execution directory.

- **When files must exist**: Files and directories must exist at declaration evaluation time, not access time. If the specified path does not exist, it is an error—unless the declaration is optional.

- **Optional file semantics**: `File?` and `Directory?` declarations evaluate to `None` when the referenced path doesn't exist. This behavior is now consistent across all declaration contexts.

These clarifications ensure that workflows behave the same regardless of which compliant engine runs them.

## Looking Forward

We've enjoyed getting back to improving the language, and there's more to come. We expect one more minor release—WDL 1.4—to continue addressing community requests before turning our attention to WDL 2.0, where larger changes to the language will be proposed.

If you want to try these features today, Sprocket already supports WDL v1.3 in full—you can learn how to install it at [sprocket.bio](https://sprocket.bio/installation.html). If you have ideas for future versions, run into issues, or just want to follow along with development, join the [OpenWDL Slack](https://openwdl.slack.com) or open an issue on the [specification repository](https://github.com/openwdl/wdl).
