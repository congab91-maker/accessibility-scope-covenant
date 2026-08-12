import { describe, expect, it } from "vitest";

import { parseAssessment, parseEvidence, parseProfile } from "./contract";

const profile = {
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
