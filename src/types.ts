export type HexAddress = `0x${string}`;

export type EvidenceKind =
  | "acr_html"
  | "openacr_json"
  | "version_page"
  | "accessibility_statement"
  | "critical_journey";

export interface EvidenceRecord {
  kind: EvidenceKind;
  url: string;
}

export interface Profile {
  id: number;
  client_ref: string;
  product_name: string;
  version: string;
  claim_text: string;
  claim_url: string;
  owner: string;
  state: "DRAFT" | "FROZEN" | "ALIGNED" | "REVIEW_REQUIRED" | "UNRESOLVED" | "SUPERSEDED";
  verdict: "" | "SCOPE_ALIGNED" | "LIMITATION_UNDISCLOSED" | "VERSION_MISMATCH" | "EVIDENCE_INCOMPLETE" | "UNRESOLVED";
  consequence: "" | "PROCUREMENT_REVIEW_READY" | "HUMAN_REVIEW_REQUIRED";
  attempts: number;
  supersedes: number;
  superseded_by: number;
  created_at: string;
  frozen_at: string;
  assessed_at: string;
}

export interface Assessment {
  verdict: Exclude<Profile["verdict"], "">;
  product_match: boolean;
  version_match: boolean;
  evidence_complete: boolean;
  limitation_disclosed: boolean;
  material_limitation_ids: string[];
  reason: string;
  source_digest_set: string[];
}

export type PendingPostcondition =
  | { kind: "create_profile"; owner: HexAddress; clientRef: string; productName: string; version: string; claimText: string; claimUrl: string }
  | { kind: "add_evidence"; profileId: number; evidence: EvidenceRecord }
  | { kind: "freeze_profile"; profileId: number }
  | { kind: "assess_scope"; profileId: number; previousAttempts: number }
  | { kind: "supersede_profile"; oldProfileId: number; newProfileId: number };

export type PendingBaseline =
  | { kind: "create_profile"; profileId: number }
  | { kind: "add_evidence"; evidenceCount: number; exactExists: boolean }
  | { kind: "freeze_profile"; state: Profile["state"] }
  | { kind: "assess_scope"; attempts: number }
  | { kind: "supersede_profile"; oldState: Profile["state"]; oldSupersededBy: number; newSupersedes: number };

export interface PendingWrite {
  hash?: `0x${string}` & { length: 66 };
  actor: HexAddress;
  label: string;
  postcondition: PendingPostcondition;
  baseline: PendingBaseline;
  submittedAt: string;
}

export type TransactionPhase = "idle" | "signature" | "submitted" | "consensus" | "readback" | "complete" | "error";
