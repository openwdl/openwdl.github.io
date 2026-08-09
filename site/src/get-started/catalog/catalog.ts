import type { SetupCatalog } from "./types";

/**
 * The vetted production setup catalog for the OpenWDL get-started wizard.
 *
 * Contains all eligible WDL engines, cloud services, and editor integrations,
 * along with their per-OS installation instructions and verification commands.
 * Ineligible entries (e.g. Planetary) are present but must not be surfaced
 * as selectable options until their required fields are complete.
 */
export const SETUP_CATALOG: SetupCatalog = {
  engines: {
    sprocket: {
      id: "sprocket",
      label: "Sprocket",
      eligible: true,
      rationale:
        "Sprocket is the recommended local WDL engine. It provides fast validation, " +
        "formatting, and execution with first-class WDL 1.x support.",
      owner: "St. Jude Rust Labs",
      docsUrl: "https://stjude-rust-labs.github.io/sprocket/",
      upstreamUrl: "https://github.com/stjude-rust-labs/sprocket",
      install: [
        {
          os: "macos",
          prerequisites: ["Homebrew (https://brew.sh)"],
          commands: [
            {
              shell: "bash",
              command: "brew install sprocket",
              explanation: "Installs Sprocket via Homebrew.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command: "sprocket --version",
              explanation: "Confirms Sprocket is installed and on PATH.",
            },
          ],
          upstreamUrl: "https://github.com/stjude-rust-labs/sprocket",
        },
        {
          os: "macos",
          prerequisites: ["Rust toolchain — install via https://rustup.rs"],
          commands: [
            {
              shell: "bash",
              command: "cargo install sprocket --locked",
              explanation:
                "Builds and installs Sprocket from crates.io with locked dependency versions.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command: "sprocket --version",
              explanation: "Confirms Sprocket is installed and on PATH.",
            },
          ],
          upstreamUrl: "https://github.com/stjude-rust-labs/sprocket",
        },
        {
          os: "linux",
          prerequisites: ["Rust toolchain — install via https://rustup.rs"],
          commands: [
            {
              shell: "bash",
              command: "cargo install sprocket --locked",
              explanation:
                "Builds and installs Sprocket from crates.io with locked dependency versions.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command: "sprocket --version",
              explanation: "Confirms Sprocket is installed and on PATH.",
            },
          ],
          upstreamUrl: "https://github.com/stjude-rust-labs/sprocket",
        },
        {
          os: "windows-wsl",
          prerequisites: [
            "Windows Subsystem for Linux 2 (WSL 2)",
            "Rust toolchain — install via https://rustup.rs inside WSL",
          ],
          commands: [
            {
              shell: "bash",
              command: "cargo install sprocket --locked",
              explanation:
                "Builds and installs Sprocket inside your WSL environment with locked dependency versions.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command: "sprocket --version",
              explanation: "Confirms Sprocket is installed and on PATH inside WSL.",
            },
          ],
          upstreamUrl: "https://github.com/stjude-rust-labs/sprocket",
        },
      ],
    },

    cromwell: {
      id: "cromwell",
      label: "Cromwell",
      eligible: false,
      rationale:
        "Cromwell is provided as a managed service through Terra. " +
        "Use the Terra service entry for Cromwell-based cloud workflows; " +
        "a standalone local Cromwell install is not part of the wizard flow.",
      owner: "Broad Institute",
      docsUrl: "https://cromwell.readthedocs.io/",
      upstreamUrl: "https://github.com/broadinstitute/cromwell",
      install: [],
    },

    miniwdl: {
      id: "miniwdl",
      label: "miniwdl",
      eligible: true,
      rationale:
        "miniwdl with the AWS Batch integration is the recommended engine for " +
        "running WDL workflows at scale on AWS infrastructure.",
      owner: "Chan Zuckerberg Initiative",
      docsUrl: "https://miniwdl.readthedocs.io/",
      upstreamUrl: "https://github.com/chanzuckerberg/miniwdl",
      install: [
        {
          os: "macos",
          prerequisites: [
            "Python 3.8 or later",
            "pip3",
            "AWS CLI configured with appropriate IAM permissions",
          ],
          commands: [
            {
              shell: "bash",
              command: "pip3 install miniwdl-aws",
              explanation:
                "Installs miniwdl together with the AWS Batch integration package.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command:
                "miniwdl-aws-submit --self-test --follow --workflow-queue YOUR_QUEUE_NAME",
              explanation:
                "Runs the built-in self-test to confirm your AWS Batch environment " +
                "is properly configured and reachable. " +
                "Replace YOUR_QUEUE_NAME with your actual AWS Batch job queue name.",
            },
          ],
          upstreamUrl: "https://github.com/miniwdl-ext/miniwdl-aws",
        },
        {
          os: "linux",
          prerequisites: [
            "Python 3.8 or later",
            "pip3",
            "AWS CLI configured with appropriate IAM permissions",
          ],
          commands: [
            {
              shell: "bash",
              command: "pip3 install miniwdl-aws",
              explanation:
                "Installs miniwdl together with the AWS Batch integration package.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command:
                "miniwdl-aws-submit --self-test --follow --workflow-queue YOUR_QUEUE_NAME",
              explanation:
                "Runs the built-in self-test to confirm your AWS Batch environment " +
                "is properly configured and reachable. " +
                "Replace YOUR_QUEUE_NAME with your actual AWS Batch job queue name.",
            },
          ],
          upstreamUrl: "https://github.com/miniwdl-ext/miniwdl-aws",
        },
        {
          os: "windows-wsl",
          prerequisites: [
            "Windows Subsystem for Linux 2 (WSL 2)",
            "Python 3.8 or later inside WSL",
            "pip3 inside WSL",
            "AWS CLI configured inside WSL",
          ],
          commands: [
            {
              shell: "bash",
              command: "pip3 install miniwdl-aws",
              explanation:
                "Installs miniwdl together with the AWS Batch integration inside your WSL environment.",
            },
          ],
          verification: [
            {
              shell: "bash",
              command:
                "miniwdl-aws-submit --self-test --follow --workflow-queue YOUR_QUEUE_NAME",
              explanation:
                "Runs the built-in self-test to confirm your AWS Batch environment " +
                "is properly configured and reachable inside WSL. " +
                "Replace YOUR_QUEUE_NAME with your actual AWS Batch job queue name.",
            },
          ],
          upstreamUrl: "https://github.com/miniwdl-ext/miniwdl-aws",
        },
      ],
    },
  },

  services: {
    terra: {
      id: "terra",
      role: "managed-service",
      label: "Terra",
      eligible: true,
      engine: "cromwell",
      owner: "Broad Institute",
      docsUrl: "https://support.terra.bio/",
      upstreamUrl: "https://terra.bio/",
      supportedClouds: ["gcp"],
      securityPrerequisites: [
        "A Google account linked to a Terra account",
        "A Terra billing project with active cloud credits",
      ],
      // Terra is a browser-based managed service with no CLI to install.
      // Verification is performed by signing in at the verificationUrl below.
      verification: [],
      verificationUrl: "https://app.terra.bio",
    },

    "aws-batch": {
      id: "aws-batch",
      role: "execution-service",
      label: "AWS Batch (miniwdl)",
      eligible: true,
      engine: "miniwdl",
      owner: "Amazon Web Services",
      docsUrl: "https://github.com/miniwdl-ext/miniwdl-aws",
      upstreamUrl: "https://github.com/miniwdl-ext/miniwdl-aws",
      supportedClouds: ["aws"],
      securityPrerequisites: [
        "An AWS account with IAM permissions for Batch, S3, and ECR",
        "AWS credentials configured in your environment (aws configure or instance profile)",
      ],
      verification: [
        {
          shell: "bash",
          command:
            "miniwdl-aws-submit --self-test --follow --workflow-queue YOUR_QUEUE_NAME",
          explanation:
            "Runs the miniwdl-aws self-test to confirm the AWS Batch environment is configured correctly. " +
            "Replace YOUR_QUEUE_NAME with your actual AWS Batch job queue name.",
        },
      ],
    },

    planetary: {
      id: "planetary",
      role: "execution-service",
      label: "Planetary",
      eligible: false,
      engine: "sprocket",
      owner: "",
      docsUrl: "",
      upstreamUrl: "",
      supportedClouds: [],
      securityPrerequisites: [],
      verification: [],
    },
  },

  editors: {
    vscode: {
      id: "vscode",
      label: "VS Code",
      eligible: true,
      supportedOs: ["macos", "linux", "windows-wsl"],
      installUrl:
        "https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode",
      verification:
        "Open a .wdl file in VS Code and confirm that syntax highlighting and " +
        "inline diagnostics from the Sprocket extension are active.",
    },

    neovim: {
      id: "neovim",
      label: "Neovim",
      eligible: true,
      supportedOs: ["macos", "linux", "windows-wsl"],
      installUrl: "https://github.com/stjude-rust-labs/sprocket.nvim",
      verification:
        "Open a .wdl file in Neovim and run :LspInfo to confirm the Sprocket language server is attached.",
    },

    "generic-lsp": {
      id: "generic-lsp",
      label: "Generic LSP client",
      eligible: true,
      supportedOs: ["macos", "linux", "windows-wsl"],
      installUrl: "https://github.com/stjude-rust-labs/sprocket",
      verification:
        "Point your editor's LSP client at the sprocket analyzer binary and confirm " +
        "that WDL diagnostics appear when a .wdl file is opened.",
    },

    jetbrains: {
      id: "jetbrains",
      label: "JetBrains IDEs (Winstanley WDL)",
      eligible: true,
      supportedOs: ["macos", "linux", "windows-wsl"],
      installUrl: "https://plugins.jetbrains.com/plugin/8154-winstanley-wdl",
      verification:
        "Open a .wdl file in your JetBrains IDE and confirm that the Winstanley WDL plugin " +
        "provides syntax highlighting and error markers.",
    },

    vim: {
      id: "vim",
      label: "Vim",
      eligible: false,
      supportedOs: ["macos", "linux"],
      installUrl: "https://github.com/broadinstitute/vim-wdl",
      verification:
        "Run sprocket check <file>.wdl in your terminal to validate WDL files from the command line.",
      fallbackCommand: "sprocket check",
    },

    emacs: {
      id: "emacs",
      label: "Emacs",
      eligible: false,
      supportedOs: ["macos", "linux"],
      installUrl: "https://github.com/zhanxw/wdl-mode",
      verification:
        "Run sprocket check <file>.wdl in your terminal to validate WDL files from the command line.",
      fallbackCommand: "sprocket check",
    },

    sublime: {
      id: "sublime",
      label: "Sublime Text",
      eligible: false,
      supportedOs: ["macos", "linux"],
      // The brief contained a typographic error ("broadinstitutewdl-sublime").
      // The correct upstream is broadinstitute/wdl-sublime-syntax-highlighter,
      // verified via `gh api repos/broadinstitute/wdl-sublime-syntax-highlighter`.
      installUrl: "https://github.com/broadinstitute/wdl-sublime-syntax-highlighter",
      verification:
        "Run sprocket check <file>.wdl in your terminal to validate WDL files from the command line.",
      fallbackCommand: "sprocket check",
    },

    "cli-only": {
      id: "cli-only",
      label: "CLI only (no editor integration)",
      eligible: true,
      supportedOs: ["macos", "linux", "windows-wsl"],
      installUrl: "https://github.com/stjude-rust-labs/sprocket",
      verification:
        "Run sprocket check, sprocket format, and sprocket lint against your .wdl files " +
        "to confirm the Sprocket toolchain is functional.",
    },
  },
};
