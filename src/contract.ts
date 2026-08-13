import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

import { assertFinalizedSuccess } from "./receipt";
import type { Eip1193Provider } from "./wallet";
import type { Assessment, EvidenceRecord, HexAddress, PendingBaseline, PendingPostcondition, PendingWrite, Profile, TransactionPhase } from "./types";

export const STUDIONET_RPC = "https://studio.genlayer.com/api";
export const STUDIONET_EXPLORER = "https://explorer-studio.genlayer.com";
const PENDING_KEY = "asc:pending-write:v3";

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

async function readProfile(profileId: number): Promise<Profile> {
  const raw = await readClient.readContract({ address: contractAddress(), functionName: "get_profile", args: [idArgument(profileId)] });
  if (raw === "") throw new Error("Profile does not exist");
  return parseProfile(raw);
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
  const profile = await readProfile(profileId);
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

async function lookupProfileId(owner: HexAddress, clientRef: string): Promise<number> {
  const value = await readClient.readContract({
    address: contractAddress(),
    functionName: "get_profile_by_client_ref",
    args: [owner, clientRef],
  });
  const id = typeof value === "bigint" ? Number(value) : typeof value === "number" ? value : Number.NaN;
  if (!Number.isSafeInteger(id) || id < 0) throw new Error("Authoritative profile lookup was invalid");
  return id;
}

export async function findProfileId(owner: HexAddress, clientRef: string): Promise<number> {
  const id = await lookupProfileId(owner, clientRef);
  if (id <= 0) throw new Error("Authoritative profile readback was not available");
  return id;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function parsePostcondition(value: unknown): PendingPostcondition | undefined {
  if (!isRecord(value) || typeof value.kind !== "string") return undefined;
  switch (value.kind) {
    case "create_profile":
      if (!isHexAddress(value.owner) || typeof value.clientRef !== "string" || typeof value.productName !== "string"
        || typeof value.version !== "string" || typeof value.claimText !== "string" || typeof value.claimUrl !== "string") return undefined;
      return { kind: value.kind, owner: value.owner, clientRef: value.clientRef, productName: value.productName, version: value.version, claimText: value.claimText, claimUrl: value.claimUrl };
    case "add_evidence":
      if (!positiveInteger(value.profileId) || !isRecord(value.evidence)
        || typeof value.evidence.kind !== "string" || typeof value.evidence.url !== "string") return undefined;
      try {
        return { kind: value.kind, profileId: value.profileId, evidence: { kind: evidenceKind(value.evidence.kind), url: value.evidence.url } };
      } catch {
        return undefined;
      }
    case "freeze_profile":
      return positiveInteger(value.profileId) ? { kind: value.kind, profileId: value.profileId } : undefined;
    case "assess_scope":
      return positiveInteger(value.profileId) && typeof value.previousAttempts === "number" && Number.isSafeInteger(value.previousAttempts) && value.previousAttempts >= 0
        ? { kind: value.kind, profileId: value.profileId, previousAttempts: value.previousAttempts }
        : undefined;
    case "supersede_profile":
      return positiveInteger(value.oldProfileId) && positiveInteger(value.newProfileId)
        ? { kind: value.kind, oldProfileId: value.oldProfileId, newProfileId: value.newProfileId }
        : undefined;
    default:
      return undefined;
  }
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parseBaseline(value: unknown, expected: PendingPostcondition): PendingBaseline | undefined {
  if (!isRecord(value) || value.kind !== expected.kind) return undefined;
  switch (expected.kind) {
    case "create_profile":
      return nonNegativeInteger(value.profileId) ? { kind: expected.kind, profileId: value.profileId } : undefined;
    case "add_evidence":
      return nonNegativeInteger(value.evidenceCount) && typeof value.exactExists === "boolean"
        ? { kind: expected.kind, evidenceCount: value.evidenceCount, exactExists: value.exactExists }
        : undefined;
    case "freeze_profile":
      try {
        return typeof value.state === "string" ? { kind: expected.kind, state: profileState(value.state) } : undefined;
      } catch {
        return undefined;
      }
    case "assess_scope":
      return nonNegativeInteger(value.attempts) ? { kind: expected.kind, attempts: value.attempts } : undefined;
    case "supersede_profile":
      if (typeof value.oldState !== "string" || !nonNegativeInteger(value.oldSupersededBy) || !nonNegativeInteger(value.newSupersedes)) return undefined;
      try {
        return { kind: expected.kind, oldState: profileState(value.oldState), oldSupersededBy: value.oldSupersededBy, newSupersedes: value.newSupersedes };
      } catch {
        return undefined;
      }
  }
}

export function getPendingWrite(): PendingWrite | undefined {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !isHexAddress(value.actor) || (value.hash !== undefined && !isTransactionHash(value.hash))) return undefined;
    const postcondition = parsePostcondition(value.postcondition);
    const baseline = postcondition ? parseBaseline(value.baseline, postcondition) : undefined;
    if (typeof value.label !== "string" || typeof value.submittedAt !== "string" || !postcondition || !baseline) return undefined;
    return { hash: value.hash, actor: value.actor, label: value.label, postcondition, baseline, submittedAt: value.submittedAt };
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
  for (let attempt = 0; ; attempt += 1) {
    try {
      const receipt = await readClient.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.FINALIZED,
        interval: 6_000,
        retries: 60,
      });
      assertFinalizedSuccess(receipt);
      return;
    } catch (error) {
      const delay = transientRpcRetryDelay(error, attempt);
      if (delay === undefined) throw error;
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
  }
}

export function transientRpcRetryDelay(error: unknown, attempt: number): number | undefined {
  if (attempt >= 4) return undefined;
  const cause = isRecord(error) && isRecord(error.cause) ? error.cause : undefined;
  const data = cause && isRecord(cause.data) ? cause.data : undefined;
  const retryAfter = data?.retry_after_seconds;
  const message = [error instanceof Error ? error.message : "", cause?.message, cause?.details]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  if (/rate limit/i.test(message)) {
    return (typeof retryAfter === "number" && retryAfter >= 0 ? retryAfter + 1 : 61) * 1_000;
  }
  return /failed to fetch|network|timed? out|temporarily unavailable/i.test(message)
    ? [2_000, 4_000, 8_000, 16_000][attempt]
    : undefined;
}

type LoadedProfile = Awaited<ReturnType<typeof loadProfile>>;
type ReadbackDependencies = {
  load: typeof loadProfile;
  find: typeof findProfileId;
};

async function capturePendingBaseline(postcondition: PendingPostcondition, actor: HexAddress): Promise<PendingBaseline> {
  if (postcondition.kind === "create_profile") {
    if (postcondition.owner.toLowerCase() !== actor.toLowerCase()) throw new Error("Connected wallet does not match the profile owner");
    return { kind: postcondition.kind, profileId: await lookupProfileId(actor, postcondition.clientRef) };
  }
  const profileId = postcondition.kind === "supersede_profile" ? postcondition.oldProfileId : postcondition.profileId;
  const currentProfile = await readProfile(profileId);
  if (currentProfile.owner.toLowerCase() !== actor.toLowerCase()) throw new Error("Connected wallet does not own this covenant");
  switch (postcondition.kind) {
    case "add_evidence": {
      const current = await loadProfile(postcondition.profileId);
      return {
        kind: postcondition.kind,
        evidenceCount: current.evidence.length,
        exactExists: current.evidence.some((item) => item.kind === postcondition.evidence.kind && item.url === postcondition.evidence.url),
      };
    }
    case "freeze_profile":
      return { kind: postcondition.kind, state: currentProfile.state };
    case "assess_scope":
      return { kind: postcondition.kind, attempts: currentProfile.attempts };
    case "supersede_profile": {
      const successor = await readProfile(postcondition.newProfileId);
      if (successor.owner.toLowerCase() !== actor.toLowerCase()) throw new Error("Connected wallet does not own the successor covenant");
      return {
        kind: postcondition.kind,
        oldState: currentProfile.state,
        oldSupersededBy: currentProfile.superseded_by,
        newSupersedes: successor.supersedes,
      };
    }
  }
}

export async function verifyPendingPostcondition(
  intent: PendingWrite,
  dependencies: ReadbackDependencies = { load: loadProfile, find: findProfileId },
): Promise<{ profileId: number; result: LoadedProfile }> {
  const expected = intent.postcondition;
  let profileId: number;
  if (expected.kind === "create_profile") {
    profileId = await dependencies.find(expected.owner, expected.clientRef);
  } else if (expected.kind === "supersede_profile") {
    profileId = expected.oldProfileId;
  } else {
    profileId = expected.profileId;
  }
  const result = await dependencies.load(profileId);
  let verified = false;
  switch (expected.kind) {
    case "create_profile":
      verified = result.profile.client_ref === expected.clientRef
        && result.profile.owner.toLowerCase() === expected.owner.toLowerCase()
        && result.profile.product_name === expected.productName
        && result.profile.version === expected.version
        && result.profile.claim_text === expected.claimText
        && result.profile.claim_url === expected.claimUrl;
      break;
    case "add_evidence":
      verified = result.evidence.some((item) => item.kind === expected.evidence.kind && item.url === expected.evidence.url);
      break;
    case "freeze_profile":
      verified = result.profile.state !== "DRAFT";
      break;
    case "assess_scope":
      verified = result.profile.attempts >= expected.previousAttempts + 1 && Boolean(result.assessment);
      break;
    case "supersede_profile": {
      const successor = await dependencies.load(expected.newProfileId);
      verified = result.profile.state === "SUPERSEDED" && result.profile.superseded_by === expected.newProfileId
        && successor.profile.supersedes === expected.oldProfileId;
      break;
    }
  }
  if (!verified) throw new Error("Authoritative readback did not satisfy the pending write postcondition");
  return { profileId, result };
}

export async function reconcilePendingWrite(
  intent: PendingWrite,
  onPhase: (phase: TransactionPhase) => void,
  dependencies: ReadbackDependencies & { wait: typeof waitForFinalized } = { load: loadProfile, find: findProfileId, wait: waitForFinalized },
): Promise<{ profileId: number; result: LoadedProfile }> {
  if (intent.hash) {
    await dependencies.wait(intent.hash, onPhase);
  }
  onPhase("readback");
  const readback = await verifyPendingPostcondition(intent, dependencies);
  if (readback.result.profile.owner.toLowerCase() !== intent.actor.toLowerCase()) {
    throw new Error("Authoritative readback owner does not match the pending actor");
  }
  if (!intent.hash) {
    const baseline = intent.baseline;
    const expected = intent.postcondition;
    let transitioned = false;
    switch (expected.kind) {
      case "create_profile":
        transitioned = baseline.kind === expected.kind && baseline.profileId === 0;
        break;
      case "add_evidence":
        transitioned = baseline.kind === expected.kind && !baseline.exactExists && readback.result.evidence.length > baseline.evidenceCount;
        break;
      case "freeze_profile":
        transitioned = baseline.kind === expected.kind && baseline.state === "DRAFT" && readback.result.profile.state !== "DRAFT";
        break;
      case "assess_scope":
        transitioned = baseline.kind === expected.kind && readback.result.profile.attempts > baseline.attempts;
        break;
      case "supersede_profile": {
        const successor = await dependencies.load(expected.newProfileId);
        transitioned = baseline.kind === expected.kind
          && baseline.oldState !== "SUPERSEDED" && baseline.oldSupersededBy === 0 && baseline.newSupersedes === 0
          && successor.profile.owner.toLowerCase() === intent.actor.toLowerCase();
        break;
      }
    }
    if (!transitioned) throw new Error("Hashless recovery did not prove a new transition from the pre-write baseline");
  }
  return readback;
}

export async function submitWrite(args: {
  account: HexAddress;
  provider: Eip1193Provider;
  functionName: string;
  callArgs: Array<string | bigint>;
  label: string;
  postcondition: PendingPostcondition;
  onPhase: (phase: TransactionPhase) => void;
}): Promise<`0x${string}`> {
  const baseline = await capturePendingBaseline(args.postcondition, args.account);
  args.onPhase("signature");
  const journal = { actor: args.account, label: args.label, postcondition: args.postcondition, baseline, submittedAt: new Date().toISOString() };
  localStorage.setItem(PENDING_KEY, JSON.stringify(journal));
  const client = createClient({ chain: studionet, endpoint: STUDIONET_RPC, account: args.account, provider: args.provider });
  let value: unknown;
  try {
    value = await client.writeContract({
      address: contractAddress(),
      functionName: args.functionName,
      args: args.callArgs,
      value: 0n,
    });
  } catch (error) {
    const code = isRecord(error) ? error.code : undefined;
    const message = error instanceof Error ? error.message : "";
    if (code === 4001 || /user rejected|user denied/i.test(message)) clearPendingWrite();
    throw error;
  }
  if (!isTransactionHash(value)) throw new Error("SDK returned an invalid transaction hash");
  const hash = value;
  localStorage.setItem(PENDING_KEY, JSON.stringify({ ...journal, hash }));
  args.onPhase("submitted");
  await waitForFinalized(hash, args.onPhase);
  args.onPhase("readback");
  return hash;
}
