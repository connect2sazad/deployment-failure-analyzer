FAILURE_RULES = [
    {
        "category": "SSH",
        "patterns": [
            {
                "regex": r"permission denied \(publickey(?:,[^)]+)?\)",
                "weight": 10,
                "description": "SSH public-key authentication was rejected"
            },
            {
                "regex": r"host key verification failed",
                "weight": 9,
                "description": "SSH host-key verification failed"
            },
            {
                "regex": r"ssh: connect to host .* port 22: connection timed out",
                "weight": 8,
                "description": "SSH connection timed out"
            },
            {
                "regex": r"identity file .* not accessible",
                "weight": 8,
                "description": "SSH private-key file could not be accessed"
            }
        ],
        "cause": "SSH connection or authentication failed.",
        "fix": "Check the SSH username, private key, key permissions, known_hosts, port 22 connectivity, and authorized_keys."
    },

    {
        "category": "Docker",
        "patterns": [
            {
                "regex": r"cannot connect to the docker daemon",
                "weight": 10,
                "description": "Docker daemon is unavailable"
            },
            {
                "regex": r"failed to solve",
                "weight": 8,
                "description": "Docker image build failed"
            },
            {
                "regex": r"manifest .* not found|manifest unknown",
                "weight": 9,
                "description": "Docker image or tag could not be found"
            },
            {
                "regex": r"no space left on device",
                "weight": 7,
                "description": "Host ran out of storage during Docker operation"
            }
        ],
        "cause": "A Docker build, image, storage, or daemon operation failed.",
        "fix": "Check the Docker daemon, Dockerfile, image/tag, registry access, and available disk space."
    },

    {
        "category": "Terraform",
        "patterns": [
            {
                "regex": r"error acquiring the state lock",
                "weight": 10,
                "description": "Terraform could not acquire the state lock"
            },
            {
                "regex": r"reference to undeclared resource",
                "weight": 10,
                "description": "Terraform references a resource that has not been declared"
            },
            {
                "regex": r"unsupported argument",
                "weight": 8,
                "description": "Terraform configuration contains an unsupported argument"
            },
            {
                "regex": r"conditionalcheckfailedexception",
                "weight": 8,
                "description": "Terraform backend locking operation failed"
            }
        ],
        "cause": "Terraform configuration, provider, or state handling failed.",
        "fix": "Check Terraform configuration, resource references, provider versions, backend configuration, and state locking."
    },

    {
        "category": "Ansible",
        "patterns": [
            {
                "regex": r"unreachable!",
                "weight": 10,
                "description": "Ansible could not reach the target host"
            },
            {
                "regex": r"missing sudo password",
                "weight": 9,
                "description": "Ansible requires privilege-escalation credentials"
            },
            {
                "regex": r"failed to connect to the host via ssh",
                "weight": 9,
                "description": "Ansible SSH connection failed"
            },
            {
                "regex": r"fatal: \[.*\]: failed!",
                "weight": 5,
                "description": "An Ansible task failed"
            }
        ],
        "cause": "Ansible failed while connecting to a host or executing a task.",
        "fix": "Check inventory, SSH connectivity, become privileges, variables, and the failed Ansible task."
    },

    {
        "category": "Dependency",
        "patterns": [
            {
                "regex": r"module(?:notfounderror)?:? no module named",
                "weight": 10,
                "description": "Required Python module is missing"
            },
            {
                "regex": r"module not found",
                "weight": 9,
                "description": "Required module could not be found"
            },
            {
                "regex": r"dependency conflict",
                "weight": 9,
                "description": "Installed dependencies have incompatible requirements"
            },
            {
                "regex": r"could not find a version that satisfies",
                "weight": 9,
                "description": "Requested package version is unavailable"
            },
            {
                "regex": r"npm err!",
                "weight": 5,
                "description": "npm reported a package-related failure"
            }
        ],
        "cause": "A required dependency is missing, unavailable, or incompatible.",
        "fix": "Check dependency versions, lock files, package repositories, and installation commands."
    },

    {
        "category": "Permissions",
        "patterns": [
            {
                "regex": r"permission denied",
                "weight": 3,
                "description": "An operation was denied because of insufficient permissions"
            },
            {
                "regex": r"operation not permitted",
                "weight": 4,
                "description": "The operating system rejected an operation"
            },
            {
                "regex": r"access denied",
                "weight": 3,
                "description": "Access to a required resource was denied"
            }
        ],
        "cause": "The process does not have sufficient permissions.",
        "fix": "Check file permissions, ownership, user privileges, execution rights, and cloud IAM policies."
    },

    {
        "category": "Networking",
        "patterns": [
            {
                "regex": r"connection refused",
                "weight": 8,
                "description": "Connection to the target service was refused"
            },
            {
                "regex": r"network is unreachable",
                "weight": 9,
                "description": "The destination network could not be reached"
            },
            {
                "regex": r"could not resolve host",
                "weight": 9,
                "description": "DNS resolution failed"
            },
            {
                "regex": r"temporary failure in name resolution",
                "weight": 9,
                "description": "Temporary DNS resolution failure"
            }
        ],
        "cause": "The application could not reach a required network service.",
        "fix": "Check DNS, routing, firewall rules, security groups, listening services, and required ports."
    }
]