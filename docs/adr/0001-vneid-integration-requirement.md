# ADR-0001: VNeID / National Digital Identity Integration

**Status:** Proposed
**Date:** 2026-07-16

## Context

NĐ 69/2024/NĐ-CP mandates VNeID (National Digital Identity by Ministry of Public Security) for all tax electronic transactions from 01/07/2025. Organizations must use VNeID accounts instead of old tax portal accounts. Legal representatives must delegate permissions to accountants through VNeID.

## Decision

Build an adapter layer to integrate with VNeID API (Bộ Công An) for:
1. Organization identity verification
2. Member management (add/remove accountants)
3. Tax permission delegation
4. Biometric verification (per Công văn 3078/CT-NVT)

## Alternatives Considered

1. **External library**: Not available — VNeID is government-operated
2. **Manual process**: Continue using old login — illegal after 01/07/2025
3. **Custom REST integration**: Chosen — most flexible, adapts to API changes

## Consequences

- Must implement VNeID OAuth 2.0 flow
- Must handle government API changes
- Requires MoPS (Bộ Công An) integration registration
- Old password-based tax account login deprecated

## Risk

- Government API SLA unknown — need fallback mechanism
- Response times may vary — async design recommended
- Schema changes without notice — versioned adapter
