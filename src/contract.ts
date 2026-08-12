import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

import { assertFinalizedSuccess } from "./receipt";
import type { Eip1193Provider } from "./wallet";
import type { Assessment, EvidenceRecord, HexAddress, PendingWrite, Profile, TransactionPhase } from "./types";

export const STUDIONET_RPC = "https://studio.genlayer.com/api";
export const STUDIONET_EXPLORER = "https://explorer-studio.genlayer.com";
const PENDING_KEY = "asc:pending-write:v1";

export const readClient = createClient({ chain: studionet, endpoint: STUDIONET_RPC });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`Contract response has invalid ${key}`);
  return value;
}

function requiredBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") throw new Error(`Contract response has invalid ${key}`);
  return value;
}

type TransactionHash = `0x${string}` & { length: 66 };

function isHexAddress(value: unknown): value is HexAddress {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

function isTransactionHash(value: unknown): value is TransactionHash {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}

function safeInteger(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Contract response has unsafe ${key}`);
  }
  return value;
}

function profileState(value: string): Profile["state"] {
  switch (value) {
    case "DRAFT": case "FROZEN": case "ALIGNED": case "REVIEW_REQUIRED": case "UNRESOLVED": case "SUPERSEDED": return value;
    default: throw new Error("Contract response contained an unsupported profile state");
  }
}

function profileVerdict(value: string): Profile["verdict"] {
  switch (value) {
    case "": case "SCOPE_ALIGNED": case "LIMITATION_UNDISCLOSED": case "VERSION_MISMATCH": case "EVIDENCE_INCOMPLETE": case "UNRESOLVED": return value;
    default: throw new Error("Contract response contained an unsupported verdict");
  }
}

function consequence(value: string): Profile["consequence"] {
  switch (value) {
    case "": case "PROCUREMENT_REVIEW_READY": case "HUMAN_REVIEW_REQUIRED": return value;
    default: throw new Error("Contract response contained an unsupported consequence");
  }
}

function evidenceKind(value: string): EvidenceRecord["kind"] {
  switch (value) {
    case "acr_html": case "openacr_json": case "version_page": case "accessibility_statement": case "critical_journey": return value;
    default: throw new Error("Contract response contained an unsupported evidence kind");
  }
}

function parseObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "string") throw new Error(`${label} response was not a string`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${label} response was not valid JSON`);
  }
  if (!isRecord(parsed)) throw new Error(`${label} response was not an object`);
  return parsed;
}

export function parseProfile(value: unknown): Profile {
  const record = parseObject(value, "Profile");
  const profile: Profile = {
    id: safeInteger(record, "id"),
    client_ref: requiredString(record, "client_ref"),
    product_name: requiredString(record, "product_name"),
    version: requiredString(record, "version"),
    claim_text: requiredString(record, "claim_text"),
    claim_url: requiredString(record, "claim_url"),
    owner: requiredString(record, "owner"),
    state: profileState(requiredString(record, "state")),
    verdict: profileVerdict(requiredString(record, "verdict")),
    consequence: consequence(requiredString(record, "consequence")),
    attempts: safeInteger(record, "attempts"),
    supersedes: safeInteger(record, "supersedes"),
    superseded_by: safeInteger(record, "superseded_by"),
    created_at: requiredString(record, "created_at"),
    frozen_at: requiredString(record, "frozen_at"),
    assessed_at: requiredString(record, "assessed_at"),
  };
  return profile;
}

export function parseEvidence(value: unknown): EvidenceRecord {
  const record = parseObject(value, "Evidence");
  return { kind: evidenceKind(requiredString(record, "kind")), url: requiredString(record, "url") };
}

export function parseAssessment(value: unknown): Assessment | undefined {
  if (value === "") return undefined;
  const record = parseObject(value, "Assessment");
  const limitations = record.material_limitation_ids;
  const digests = record.source_digest_set;
  if (!Array.isArray(limitations) || !limitations.every((item) => typeof item === "string")) {
    throw new Error("Assessment response contained invalid limitation identifiers");
  }
  if (!Array.isArray(digests) || !digests.every((item) => typeof item === "string")) {
    throw new Error("Assessment response contained invalid source digests");
  }
  return {
    verdict: (() => {
      const value = profileVerdict(requiredString(record, "verdict"));
      if (!value) throw new Error("Assessment response omitted its verdict");
      return value;
    })(),
    product_match: requiredBoolean(record, "product_match"),
    version_match: requiredBoolean(record, "version_match"),
    evidence_complete: requiredBoolean(record, "evidence_complete"),
    limitation_disclosed: requiredBoolean(record, "limitation_disclosed"),
    material_limitation_ids: limitations,
    reason: requiredString(record, "reason"),
    source_digest_set: digests,
  };
}

function contractAddress(): HexAddress {
  const value = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!isHexAddress(value)) throw new Error("Contract is not deployed/configured yet");
  return value;
}

function idArgument(profileId: number): bigint {
  if (!Number.isSafeInteger(profileId) || profileId <= 0) throw new Error("Profile ID must be a positive safe integer");
  return BigInt(profileId);
}

export async function loadProfile(profileId: number): Promise<{ profile: Profile; evidence: EvidenceRecord[]; assessment?: Assessment }> {
  const address = contractAddress();
  const rawProfile = await readClient.readContract({ address, functionName: "get_profile", args: [idArgument(profileId)] });
  if (rawProfile === "") throw new Error("Profile does not exist");
  const profile = parseProfile(rawProfile);
  const countValue = await readClient.readContract({ address, functionName: "get_evidence_count", args: [idArgument(profileId)] });
  const count = typeof countValue === "bigint" ? Number(countValue) : typeof countValue === "number" ? countValue : Number.NaN;
  if (!Number.isSafeInteger(count) || count < 0 || count > 8) throw new Error("Contract returned an invalid evidence count");
  const rawEvidence = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      readClient.readContract({ address, functionName: "get_evidence", args: [idArgument(profileId), BigInt(index)] }),
    ),
  );
  const rawAssessment = await readClient.readContract({ address, functionName: "get_assessment", args: [idArgument(profileId)] });
  return { profile, evidence: rawEvidence.map(parseEvidence), assessment: parseAssessment(rawAssessment) };
}

export async function findProfileId(owner: HexAddress, clientRef: string): Promise<number> {
  const value = await readClient.readContract({
    address: contractAddress(),
    functionName: "get_profile_by_client_ref",
    args: [owner, clientRef],
  });
  const id = typeof value === "bigint" ? Number(value) : typeof value === "number" ? value : Number.NaN;
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Authoritative profile readback was not available");
  return id;
}

export function getPendingWrite(): PendingWrite | undefined {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !isTransactionHash(value.hash)) return undefined;
    if (typeof value.label !== "string" || typeof value.submittedAt !== "string") return undefined;
    const result: PendingWrite = { hash: value.hash, label: value.label, submittedAt: value.submittedAt };
    if (typeof value.profileId === "number" && Number.isSafeInteger(value.profileId)) result.profileId = value.profileId;
    if (typeof value.clientRef === "string") result.clientRef = value.clientRef;
    return result;
  } catch {
    return undefined;
  }
}

export function clearPendingWrite(): void {
  localStorage.removeItem(PENDING_KEY);
}

export async function waitForFinalized(
  hash: TransactionHash,
  onPhase: (phase: TransactionPhase) => void,
): Promise<void> {
  onPhase("consensus");
  const receipt = await readClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 2_000,
    retries: 180,
  });
  assertFinalizedSuccess(receipt);
}

export async function submitWrite(args: {
  account: HexAddress;
  provider: Eip1193Provider;
  functionName: string;
  callArgs: Array<string | bigint>;
  label: string;
  profileId?: number;
  clientRef?: string;
  onPhase: (phase: TransactionPhase) => void;
}): Promise<`0x${string}`> {
  args.onPhase("signature");
  const client = createClient({ chain: studionet, endpoint: STUDIONET_RPC, account: args.account, provider: args.provider });
  const value = await client.writeContract({
    address: contractAddress(),
    functionName: args.functionName,
    args: args.callArgs,
    value: 0n,
  });
  if (!isTransactionHash(value)) throw new Error("SDK returned an invalid transaction hash");
  const hash = value;
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ hash, label: args.label, profileId: args.profileId, clientRef: args.clientRef, submittedAt: new Date().toISOString() }),
  );
  args.onPhase("submitted");
  await waitForFinalized(hash, args.onPhase);
  args.onPhase("readback");
  return hash;
}
