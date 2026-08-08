FAILURE_RULES = FAILURE_RULES = [
    {
        "category": "SSH",
        "patterns": [
            "permission denied (publickey)",
            "host key verification failed",
            "connection timed out"
        ],
        "cause": "SSH connection or authentication failed.",
        "fix": "Check the SSH username, private key, key permissions, and server connectivity."
    },

    {
        "category": "Docker",
        "patterns": [
            "cannot connect to the docker daemon",
            "no space left on device",
            "manifest unknown",
            "failed to solve"
        ],
        "cause": "Docker build or runtime operation failed.",
        "fix": "Check the Docker daemon, Dockerfile, available disk space, and image/tag."
    },

    {
        "category": "Terraform",
        "patterns": [
            "error acquiring the state lock",
            "reference to undeclared resource",
            "unsupported argument",
            "terraform init failed"
        ],
        "cause": "Terraform configuration or state operation failed.",
        "fix": "Check the Terraform configuration, resource references, provider configuration, and backend state."
    },

    {
        "category": "Ansible",
        "patterns": [
            "unreachable!",
            "missing sudo password",
            "module failure",
            "ansible_facts"
        ],
        "cause": "Ansible could not successfully execute a task.",
        "fix": "Check SSH connectivity, inventory, privileges, and the failed Ansible task."
    },

    {
        "category": "Dependency",
        "patterns": [
            "module not found",
            "could not find a version",
            "dependency conflict",
            "npm err!"
        ],
        "cause": "A required package or dependency is missing or incompatible.",
        "fix": "Check dependency versions and reinstall the required packages."
    },

    {
        "category": "Permissions",
        "patterns": [
            "permission denied",
            "operation not permitted",
            "access denied"
        ],
        "cause": "The process does not have the required permissions.",
        "fix": "Check file ownership, permissions, execution privileges, or IAM permissions."
    },

    {
        "category": "Networking",
        "patterns": [
            "connection refused",
            "network is unreachable",
            "could not resolve host",
            "temporary failure in name resolution"
        ],
        "cause": "The application could not reach the required network service.",
        "fix": "Check the service status, DNS, firewall, security groups, routing, and required ports."
    }
]