# Security Review

This document outlines the security architecture and mitigations applied within the QRaksha framework to ensure safe performance.

## Threats Considered & Mitigations Applied

- **Secret Exposure Mitigation:** All sensitive cryptographic tokens and API references are strictly decoupled from the source tree. Local environments utilize detached config variables, while the remote environment resolves configurations dynamically at runtime via strict environment controls. `.gitignore` explicitly prevents tracking local assets.
- **XSS & Content Sanitization:** Decoded payloads and AI responses are treated as untrusted strings. The DOM manipulation pipeline utilizes centralized escaping via `document.createElement` and text content node bindings rather than raw rendering.
- **Prompt Injection Defense:** Input pipelines encapsulate untrusted data buffers with structural boundary barriers and strict instructions restricting output targets exclusively to structured JSON parameters.
- **Resource Constraints:** Input thresholds are strictly validated server-side to enforce character limitations and file size parameters, preventing vector exhaustion.
- **Origin Controls:** Execution endpoints restrict cross-origin traffic explicitly to the designated platform domains.
- **Error Transparency:** Operational anomalies decouple technical error logs from client communication pipelines, transmitting only standardized generic responses to the user interface.
