import { describe, expect, it } from "vitest";

import { parseAssessment, parseEvidence, parseProfile, reconcilePendingWrite } from "./contract";
import type { Assessment, PendingWrite, Profile } from "./types";

const profile: Profile = {
  id: 1,
  client_ref: "intent-0001",
  product_name: "Civic Access Portal",
  version: "2.0",
  claim_text: "An exact accessibility claim.",
  claim_url: "https://vendor.example/claim",
  owner: "0x1111111111111111111111111111111111111111",
  state: "DRAFT",
  verdict: "",
  consequence: "",
  attempts: 0,
  supersedes: 0,
  superseded_by: 0,
  created_at: "2026-08-13T00:00:00Z",
  frozen_at: "",
  assessed_at: "",
};

const assessment: Assessment = {
  verdict: "SCOPE_ALIGNED",
  product_match: true,
  version_match: true,
  evidence_complete: true,
  limitation_disclosed: true,
  material_limitation_ids: [],
  reason: "Aligned.",
  source_digest_set: [],
};

const hash = `0x${"a".repeat(64)}` as PendingWrite["hash"];
const phases: string[] = [];
const wait = async (_hash: PendingWrite["hash"], onPhase: (phase: "idle" | "signature" | "submitted" | "consensus" | "readback" | "complete" | "error") => void) => onPhase("consensus");
const intent = (postcondition: PendingWrite["postcondition"]): PendingWrite => ({ hash, label: "test", postcondition, submittedAt: "2026-08-13T00:00:00Z" });
const loaded = (changes: Partial<Profile> = {}, evidence: Array<{ kind: "acr_html"; url: string }> = []) => ({ profile: { ...profile, ...changes }, evidence, assessment: undefined });

describe("contract response boundaries", () => {
  it("accepts a complete profile and rejects unsupported states", () => {
    expect(parseProfile(JSON.stringify(profile)).state).toBe("DRAFT");
    expect(() => parseProfile(JSON.stringify({ ...profile, state: "APPROVED" }))).toThrow(/unsupported profile state/);
  });

  it("rejects unsafe numeric identities", () => {
    expect(() => parseProfile(JSON.stringify({ ...profile, id: 9007199254740992 }))).toThrow(/unsafe id/);
  });

  it("allowlists evidence kinds", () => {
    expect(parseEvidence('{"kind":"acr_html","url":"https://vendor.example/acr"}').kind).toBe("acr_html");
    expect(() => parseEvidence('{"kind":"pdf","url":"https://vendor.example/acr.pdf"}')).toThrow(/unsupported evidence kind/);
  });

  it("allowlists assessment verdicts and decision flags", () => {
    const assessment = {
      verdict: "SCOPE_ALIGNED",
      product_match: true,
      version_match: true,
      evidence_complete: true,
      limitation_disclosed: true,
      material_limitation_ids: [],
      reason: "Aligned.",
      source_digest_set: [],
    };
    expect(parseAssessment(JSON.stringify(assessment))?.verdict).toBe("SCOPE_ALIGNED");
    expect(() => parseAssessment(JSON.stringify({ ...assessment, verdict: "CERTIFIED" }))).toThrow(/unsupported verdict/);
    expect(() => parseAssessment(JSON.stringify({ ...assessment, version_match: "yes" }))).toThrow(/invalid version_match/);
  });
});

describe("restart-safe method-specific reconciliation", () => {
  it("reconciles create_profile without a connected account and verifies the exact intent", async () => {
    const owner = "0x1111111111111111111111111111111111111111";
    const pending = intent({
      kind: "create_profile",
      owner,
      clientRef: profile.client_ref,
      productName: profile.product_name,
      version: profile.version,
      claimText: profile.claim_text,
      claimUrl: profile.claim_url,
    });
    const result = await reconcilePendingWrite(pending, (phase) => phases.push(phase), {
      wait,
      find: async (candidate, clientRef) => candidate === owner && clientRef === profile.client_ref ? 1 : 0,
      load: async () => loaded(),
    });
    expect(result.profileId).toBe(1);
  });

  it("reconciles add_evidence only when the exact evidence exists", async () => {
    const pending = intent({ kind: "add_evidence", profileId: 1, evidence: { kind: "acr_html", url: "https://vendor.example/acr" } });
    const dependencies = { wait, find: async () => 1, load: async () => loaded({}, [{ kind: "acr_html" as const, url: "https://vendor.example/acr" }]) };
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });
  });

  it("reconciles freeze_profile only after the profile left DRAFT", async () => {
    const pending = intent({ kind: "freeze_profile", profileId: 1 });
    const dependencies = { wait, find: async () => 1, load: async () => loaded({ state: "FROZEN" }) };
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });
  });

  it("reconciles assess_scope only after attempts and assessment advance", async () => {
    const pending = intent({ kind: "assess_scope", profileId: 1, previousAttempts: 0 });
    const dependencies = { wait, find: async () => 1, load: async () => ({ ...loaded({ state: "ALIGNED", attempts: 1 }), assessment }) };
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });
  });

  it("reconciles both sides of supersede_profile", async () => {
    const pending = intent({ kind: "supersede_profile", oldProfileId: 1, newProfileId: 2 });
    const dependencies = {
      wait,
      find: async () => 1,
      load: async (id: number) => id === 1 ? loaded({ state: "SUPERSEDED", superseded_by: 2 }) : loaded({ id: 2, supersedes: 1 }),
    };
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });
  });

  it("retains a recoverable failure on readback mismatch or delay and permits duplicate reconciliation", async () => {
    const pending = intent({ kind: "freeze_profile", profileId: 1 });
    let calls = 0;
    const dependencies = {
      wait,
      find: async () => 1,
      load: async () => {
        calls += 1;
        if (calls === 1) throw new Error("readback delayed");
        return loaded({ state: "FROZEN" });
      },
    };
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).rejects.toThrow(/delayed/);
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });
    await expect(reconcilePendingWrite(pending, () => undefined, dependencies)).resolves.toMatchObject({ profileId: 1 });

    const mismatch = { ...dependencies, load: async () => loaded({ state: "DRAFT" }) };
    await expect(reconcilePendingWrite(pending, () => undefined, mismatch)).rejects.toThrow(/postcondition/);
  });
});
