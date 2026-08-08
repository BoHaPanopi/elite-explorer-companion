# Security Policy

Elite Explorer Companion is developed under a least-privilege security philosophy.

The project is intended to run with normal user rights, process local data locally where possible, reject actions that are not explicitly allowed, and avoid unnecessary external communication.

For the detailed trust and security model, see [docs/SECURITY_MODEL.md](./docs/SECURITY_MODEL.md).

## Supported Versions

This repository currently documents an alpha-stage product.

| Version line | Security support status |
| --- | --- |
| Current alpha branch / latest published alpha | Best-effort security fixes and documentation updates |
| Older alpha builds | May be outdated and should not be assumed to receive fixes |

Alpha versions are development software and may be incomplete. Security principles are already binding even where implementation is still evolving.

## Security Philosophy

- Least privilege by default.
- Normal user rights for normal operation.
- Local processing whenever possible.
- No hidden telemetry or undocumented background transfer.
- Integrations only through explicitly defined interfaces.
- No generic remote control of the computer.
- No arbitrary shell, script, PowerShell, or CMD execution from natural-language or external input.
- Fail closed when an action is not clearly allowed or validated.

## Reporting Security Problems

There is currently no dedicated private security reporting channel documented for this repository.

Until a secure reporting path is formally published:

- Do not post vulnerability details, exploit steps, secrets, tokens, keys, passwords, or private logs in a public issue.
- Do not publish a security bug publicly in this repository before a safe reporting route has been agreed.
- If you need to report a potential security issue now, first request a private reporting path without including sensitive details.

A dedicated reporting channel is still to be established.

## Handling Secrets

Never post any of the following in issues, discussions, pull requests, screenshots, or logs:

- Discord tokens
- API keys
- passwords
- private keys
- credentials
- personal authentication data
- any other secrets

Real secrets must stay out of the public repository. Local `.env` files with real credentials must remain ignored. `.env.example` files may contain placeholders only.
