---
title: "Workflow Template Repository"
author: Venkat Malladi
date:   2024-04-26 10:02:15 -0600
categories: wdl bioinformatics workflows ci cd testing
---

# A Comprehensive Guide to Utilizing Workflow Templates in WDL Development

Are you a developer looking to streamline your workflow in WDL (Workflow Description Language) development? Look no further than the [Workflow Template WDL repository](https://github.com/openwdl/workflow-template-wdl). This comprehensive guide will walk you through the repository's features, from setting up a new project to running tests and ensuring seamless integration with essential tools like MiniWDL, Cromwell, and more.

## Understanding Repository Templates

Before delving into the specifics of the Workflow Template WDL repository, let's understand what sets it apart from a traditional fork. When you create a repository from a template, you're not simply copying the codebase. Instead, you're initiating a new project with a clean slate. This means:

1. **Single Commit History**: Unlike forks that inherit the entire commit history of the parent repository, projects created from a template start with a single commit. This ensures a fresh start for your project.

2. **Contributions Graph**: Commits made to a repository created from a template will reflect in your contributions graph, offering clear visibility of your project contributions.

3. **New Project Initiation**: Utilizing a repository template is ideal for starting a new project swiftly, without the baggage of unnecessary commit history.

## Devcontainer Configuration for Seamless Development

One of the standout features of the repository is its Devcontainer configuration. This configuration sets up a GitHub Codespace tailored for WDL development. The Devcontainer includes essential tools such as VScode, Docker, MiniWDL, Cromwell, WOMTool, Sprocket, and more, ensuring a seamless development experience.

## Dockstore Template for Automated Workflow Registration

Managing workflows becomes hassle-free with the included [Dockstore](https://dockstore.org/) template. Automatic registration of your workflow using the [Dockstore GitHub App](https://docs.dockstore.org/en/stable/getting-started/github-apps/github-apps-landing-page.html) simplifies the process, allowing you to focus on your project's core functionality.

```
# Dockstore config version, not pipeline version
# Visit for full list of fields: https://docs.dockstore.org/en/stable/assets/templates/workflows/workflows.html#full-template-with-explanation-of-all-available-fields
version: 1.2
workflows:
  - subclass: WDL
    publish: True
    primaryDescriptorPath: /hello.wdl # Change to point to your pipeline wdl
    testParameterFiles:
    authors:
      - orcid: <String> # Add authors
    name: hello
```

## Unit and Integration Testing Made Eas

Testing is a crucial aspect of any development workflow, and the  repository makes it a breeze. With [pytest-workflow](https://pytest-workflow.readthedocs.io/) for unit and integration tests, you can ensure the reliability and functionality of your WDL code. Examples for unit and integration tests are provided within the repository, guiding you through the testing process effortlessly.

```
version 1.0

task hello {
  input {
    String name
  }

  command {
    echo 'hello ${name}!'
  }

  output {
    File response = stdout()
  }

  runtime {
   docker: 'ubuntu:22.04'
  }

  parameter_meta {
    name: {
      help: "String to echo for task"
    }
  }
}

workflow example {
  call hello
}
```


Unit test of Hello Task

```
- name: test-hello
  command: miniwdl run -i tests/inputs/hello.inputs.json -d test-output/ --task hello hello.wdl
  files:
    - path: test-output/_LAST/stdout.txt
      contains:                        
        - 'hello Test!'
```

## Verification and Setup

The repository offers clear instructions for verifying and setting up your development environment. From testing MiniWDL and Cromwell installations to ensuring correct setup of tools like sprocket, every step is meticulously outlined, guaranteeing a smooth start to your project.

## Conclusion

In conclusion, the Workflow Template WDL repository provides a robust foundation for WDL development projects. Whether you're a seasoned developer or just starting with WDL, this repository offers the tools and guidance needed to kickstart your projects efficiently. By leveraging the Devcontainer configuration, Dockstore template, and comprehensive testing suite, you can streamline your development workflow and focus on building innovative solutions.

With clear documentation, easy setup instructions, and a supportive community of contributors, embarking on your next WDL project has never been easier. So why wait? Dive into the Workflow Template WDL repository and unleash the full potential of your WDL development endeavors.

