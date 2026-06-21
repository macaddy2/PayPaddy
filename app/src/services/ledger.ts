/**
 * Per-deal append-only event log with a hash chain.
 *
 * This is the "off-chain smart contract" provenance layer: every state
 * transition on a Deal (or one of its milestones) is recorded as a
 * `LedgerEntry`, and each entry carries the hash of the previous one so
 * the chain is tamper-evident — flip a byte anywhere mid-history and every
 * subsequent `hash` field is wrong.
 *
 * The hash function is intentionally tiny and dependency-free (FNV-1a
 * folded to 64 hex chars) so it works identically on web, iOS, and
 * Android without any platform crypto imports. It is NOT cryptographically
 * secure; when wiring a real backend, swap `ledgerHash` for SHA-256 via
 * `expo-crypto`'s `digestStringAsync`. The chain shape and `appendEntry`
 * contract stay the same.
 */

import type { Deal, LedgerEntry, LedgerEntryKind } from '@/domain/schema';

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(input: string, seed: number): string {
  let hash = seed;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Deterministic 64-hex-char digest of an arbitrary string. Composed of 8
 * independent FNV-1a runs with different seeds so the output spans 32 bytes
 * and small input changes diffuse across the whole digest.
 */
export function ledgerHash(payload: string): string {
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += fnv1a(payload, FNV_OFFSET ^ (i * 0x9e3779b1));
  }
  return out;
}

export function appendEntry(
  deal: Deal,
  kind: LedgerEntryKind,
  actor: LedgerEntry['actor'],
  opts: { milestoneId?: string; amountKobo?: number; note?: string; at?: string } = {},
): LedgerEntry {
  if (!deal.ledger) deal.ledger = [];
  const ledger = deal.ledger;
  const prev = ledger.at(-1);
  const prevHash = prev?.hash ?? 'genesis';
  const at = opts.at ?? new Date().toISOString();
  const amountKobo = opts.amountKobo ?? 0;
  const index = ledger.length;
  const payload = [
    index,
    at,
    kind,
    actor,
    opts.milestoneId ?? '',
    amountKobo,
    prevHash,
  ].join('|');
  const entry: LedgerEntry = {
    index,
    at,
    kind,
    actor,
    milestoneId: opts.milestoneId,
    amountKobo,
    note: opts.note,
    hash: ledgerHash(payload),
    prevHash,
  };
  ledger.push(entry);
  return entry;
}

/**
 * Walk the chain and confirm each entry's hash matches a fresh recomputation
 * over its payload + the previous entry's hash. Returns the index of the first
 * broken link, or -1 if the whole chain is intact.
 */
export function verifyLedger(ledger: readonly LedgerEntry[] | undefined): number {
  if (!ledger || ledger.length === 0) return -1;
  let expectedPrev = 'genesis';
  for (let i = 0; i < ledger.length; i++) {
    const e = ledger[i];
    if (!e) return i;
    if (e.index !== i || e.prevHash !== expectedPrev) return i;
    const payload = [e.index, e.at, e.kind, e.actor, e.milestoneId ?? '', e.amountKobo, e.prevHash].join('|');
    if (ledgerHash(payload) !== e.hash) return i;
    expectedPrev = e.hash;
  }
  return -1;
}
