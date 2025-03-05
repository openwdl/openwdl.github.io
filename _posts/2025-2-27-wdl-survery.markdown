---
title: "WDL Survey Report"
author: Venkat Malladi
date:   2025-02-27 15:24:15 -0600
categories: wdl bioinformatics workflows 
---

## Introduction  

In January 2024, we sent our first WDL Usage and Adoption Survey aimed to gather insights and feedback from the [WDL](https://openwdl.org/) user community. The survey received responses from professionals working in academia and the biotech/pharma industries. By sharing these findings and trends, we aim to drive evolution of the [WDL spec](https://github.com/openwdl/wdl), enable the community of researchers and developers to build new innovations and collaborations around WDL best practices. This report summarizes the key findings and trends observed from the survey responses.

## Key Findings  

### Community  

The WDL community is growing. Our community primarily considers themselves either a **bioinformatician (47%) or software engineer (37%)** (Fig 1). Of these users, 77% identify as from academia (Fig 2). While the WDL spec has been around for nearly a decade, it is clear that our community is growing. We see that **31% of users have picked it up in the last 1-3 years** (Fig 3).  

![Fig 1](/assets/images/survery_jan2024/demographics.png)

![Fig 2](/assets/images/survery_jan2024/industry.png)

![Fig 3](/assets/images/survery_jan2024/wdl_familarity.png)

To build and foster a sense of community, we wanted to know how our users interact with each other. Engagement with the WDL community is occasional at best (Fig 4), with the majority of users using platforms like GitHub Discussions or WDL Slack (Fig 5). Users expressed a desire for more opportunities to connect and share knowledge with fellow WDL users.  

![Fig 4](/assets/images/survery_jan2024/engagement.png)

![Fig 5](/assets/images/survery_jan2024/wdl_formums.png)

### Workflow Deployment and Usage  

As important as a sense of community, it is important to highlight how and where our users run their workflows. The majority of participants identified **Cromwell (62%) as the leading WDL engine**, followed by MiniWDL (27%) and a variety of other engines (Fig 6). Over 76% of respondents indicated that they primarily run their workflows in the cloud natively or through platforms such as Terra, DNANexus, and Seven Bridges, which run on multiple cloud infrastructures (Fig 7). If they use the cloud natively, users overwhelmingly choose GCP (**61%**) over the other cloud providers (Fig 8).  

![Fig 6](/assets/images/survery_jan2024/engines.png)

![Fig 7](/assets/images/survery_jan2024/platforms.png)

![Fig 8](/assets/images/survery_jan2024/clouds.png)

### Workflow Development and Validation

Most users write their own WDL workflows. However, with a growing community, we find that many users look for examples or already developed workflows. Users tend to find workflows on **GitHub (48%)**, BioWDL or WARP, or on Dockstore (40%) (Fig 9). When developing workflows, **validation and linting tools are widely used, 80% of users rely on tools like MiniWDL and Womtool** (Fig 10). As with any developer, WDL users have a wide range of languages they prefer to write in for calling their tools. The most commonly used programming languages with WDL are **Python (36%), Bash (31%), and R (16%)** (Fig 11).  

![Fig 9](/assets/images/survery_jan2024/workflow_finding.png)

![Fig 10](/assets/images/survery_jan2024/lint.png)

![Fig 11](/assets/images/survery_jan2024/programming.png)

## Future of WDL  

The future of WDL is seen with mixed opinions. While **50%** of users expect their usage of WDL to stay the same, **19%** foresee increasing usage, and another **22%** foresee switching to another workflow language (Fig 12).  


![Fig 12](/assets/images/survery_jan2024/wdl_evolution.png)

Desired features for future versions include:  

- Better support for scattering with dynamic load balancing  
- Improved linters and real-time debuggers for IDEs  
- More comprehensive conditional support  

Additionally, users would like to see an increase in tutorials, best practice guides, and example workflows.  

## Conclusion  

The WDL Usage and Adoption Survey provides valuable insights into the current state of WDL usage and adoption. The findings highlight the strengths and areas for improvement, offering guidance for future development and support. By addressing the community's needs and preferences, WDL can continue to evolve and support the bioinformatics community effectively. We acknowledge that this survery doesn't capture the full community perceptives. As a result, over the the next couple of months we plan on reaching more out to the community and then conducting another survery in the later half of the year.

## Future of WDL
The [WDL Governance Committee](https://github.com/openwdl/governance/blob/main/README.md) is considering this feedback. As
part of our discussions we are aiming to increase community engagement over the next few months through [Slack](https://join.slack.com/t/openwdl/shared_invite/zt-ctmj4mhf-cFBNxIiZYs6SY9HgM9UAVw) and [WDL git repo](https://github.com/openwdl/).
