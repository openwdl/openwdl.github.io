---
title: "Structs"
description: "Custom types that package complex data as a named unit."
slug: /docs/start/language/structs/
section: learn
group: "Language guide"
order: 20
kind: guide
legacy:
  - /docs/write/structs/
  - /language-guide/structs
  - /language-guide/structs.html
  - /language-guide/structs/
---

# Structs

**Structs** ([spec link][spec-structs]) represent custom types that you can define and
pass around within WDL. Structs are comprised of _member_ fields that have a name and an
associated type. The use of these custom types in more complex situations allows the
execution engine to do validation on your behalf, ensuring that your task or workflow
has all the information it needs in a packaged unit to run smoothly.

For example, consider a situation where you need to model an `Address` and some broader
`ContactInformation`.

```wdl
# Create a custom type named `Address`.
struct Address {
  Int street_number
  String street_address
  Array[Int] zip_code
  String city
  String state
  Array[Int]+? gate_code
}

# Create a custom type named `ContactInformation`. It can contain
# other structs, like it does here with the `address` field.
struct ContactInformation {
  String first_name
  String last_name
  Address address
  String? email_address
}

# An example workflow using these structs.
workflow run {
  output {
    ContactInformation john = ContactInformation {
      first_name: "John",
      last_name: "Smith",
      address: Address {
        street_number: 123,
        street_address: "Main Street",
        zip_code: [0, 1, 2, 3, 4 ],
        city: "Somewhere",
        state: "Foobar",
        gate_code: None,
      },
    }

    Boolean has_email = defined(john.email_address)
  }
}
```

To conclude, structs are an idiomatic mechanism for packaging up complex pieces of data
that need to be passed around as a unit: we highly recommend you use them when you can.

[spec-structs]: https://github.com/openwdl/wdl/blob/wdl-1.3/SPEC.md#custom-types-structs
