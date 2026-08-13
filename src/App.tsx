import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  STUDIONET_EXPLORER,
  clearPendingWrite,
  getPendingWrite,
  loadProfile,
  reconcilePendingWrite,
  submitWrite,
  verifyPendingPostcondition,
} from "./contract";
import { errorMessage } from "./receipt";
import type { EvidenceKind, EvidenceRecord, HexAddress, PendingPostcondition, PendingWrite, Profile, TransactionPhase } from "./types";
import { connectWallet, discoverWallets, type Eip1193Provider, type WalletOption } from "./wallet";

const phaseCopy: Record<TransactionPhase, string> = {
  idle: "Ready",
  signature: "Awaiting wallet signature",
  submitted: "Submitted to Studionet",
  consensus: "Validators are reaching consensus",
  readback: "Verifying authoritative contract state",
  complete: "Finalized, successful, and verified",
  error: "Action needs attention",
};

const evidenceLabels: Record<EvidenceKind, string> = {
  acr_html: "HTML ACR",
  openacr_json: "OpenACR JSON",
  version_page: "Version page",
  accessibility_statement: "Accessibility statement",
  critical_journey: "Critical journey",
};

function short(value: string, left = 7, right = 5): string {
  return value.length <= left + right + 1 ? value : `${value.slice(0, left)}…${value.slice(-right)}`;
}

function StatusRail({ phase }: { phase: TransactionPhase }) {
  const steps: TransactionPhase[] = ["signature", "submitted", "consensus", "readback", "complete"];
  const active = phase === "idle" ? -1 : phase === "error" ? -2 : steps.indexOf(phase);
  return (
    <div className="status-rail" aria-label="Transaction progress">
      {steps.map((step, index) => (
        <div className={`rail-step ${index <= active ? "is-done" : ""}`} key={step}>
          <span>{index + 1}</span>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}

function WalletDialog({ options, busy, onChoose, onClose }: {
  options: WalletOption[];
  busy: boolean;
  onChoose: (option: WalletOption) => void;
  onClose: () => void;
}) {
  const nameCounts = options.reduce((counts, option) => {
    const name = option.name.trim().toLowerCase();
    counts.set(name, (counts.get(name) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onClose]);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
        <p className="eyebrow">Provider selector</p>
        <h2 id="wallet-title">Choose a wallet</h2>
        <p>Only detected EIP-1193 providers are shown. Closing this dialog sends no connection request.</p>
        <div className="wallet-options">
          {options.length ? options.map((option, index) => (
            <button autoFocus={index === 0} className="wallet-option" disabled={busy} key={option.id} onClick={() => onChoose(option)}>
              {option.icon ? <img src={option.icon} alt="" /> : <span className="wallet-mark">W</span>}
              <span className="wallet-label">
                <span>{option.name}</span>
                {(nameCounts.get(option.name.trim().toLowerCase()) ?? 0) > 1 && option.rdns ? <small className="wallet-rdns">{option.rdns}</small> : null}
              </span>
              <small>Detected</small>
            </button>
          )) : <div className="empty-state">{busy ? "Detecting compatible providers…" : "No compatible browser wallet was detected."}</div>}
        </div>
        <button autoFocus={!busy && options.length === 0} className="button ghost" onClick={onClose} disabled={busy}>Cancel</button>
      </section>
    </div>
  );
}

export default function App() {
  const [account, setAccount] = useState<HexAddress>();
  const [provider, setProvider] = useState<Eip1193Provider>();
  const [walletName, setWalletName] = useState("");
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [walletDialog, setWalletDialog] = useState(false);
  const [profileId, setProfileId] = useState(1);
  const [profile, setProfile] = useState<Profile>();
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [assessment, setAssessment] = useState<Awaited<ReturnType<typeof loadProfile>>["assessment"]>();
  const [phase, setPhase] = useState<TransactionPhase>("idle");
  const [notice, setNotice] = useState("Load a covenant or connect a wallet to register one.");
  const [pending, setPending] = useState<PendingWrite>();
  const [busy, setBusy] = useState(false);

  const journeyCount = useMemo(() => evidence.filter((item) => item.kind === "critical_journey").length, [evidence]);
  const configured = Boolean(import.meta.env.VITE_CONTRACT_ADDRESS);

  async function refresh(id = profileId) {
    const result = await loadProfile(id);
    setProfileId(id);
    setProfile(result.profile);
    setEvidence(result.evidence);
    setAssessment(result.assessment);
    return result;
  }

  async function reconcile(intent: PendingWrite) {
    setBusy(true);
    setPhase("consensus");
    setNotice(`Reconciling ${intent.label} after reload…`);
    try {
      const readback = await reconcilePendingWrite(intent, setPhase);
      setProfileId(readback.profileId);
      setProfile(readback.result.profile);
      setEvidence(readback.result.evidence);
      setAssessment(readback.result.assessment);
      clearPendingWrite();
      setPending(undefined);
      setPhase("complete");
      setNotice("Recovered transaction is FINALIZED, successful, and confirmed by contract readback.");
    } catch (error) {
      setPhase("error");
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setPending(getPendingWrite());
  }, []);

  async function openWalletSelector() {
    setBusy(true);
    setWalletDialog(true);
    try {
      setWallets(await discoverWallets());
    } finally {
      setBusy(false);
    }
  }

  async function chooseWallet(option: WalletOption) {
    setBusy(true);
    try {
      const address = await connectWallet(option);
      setAccount(address);
      setProvider(option.provider);
      setWalletName(option.name);
      setWalletDialog(false);
      setNotice(`Connected ${option.name} on Studionet.`);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function execute(input: {
    functionName: string;
    callArgs: Array<string | bigint>;
    label: string;
    postcondition: PendingPostcondition;
  }) {
    if (!account || !provider) {
      setPhase("error");
      setNotice("Connect a wallet through the provider selector first");
      return;
    }
    setBusy(true);
    setNotice(`${input.label}: preparing transaction…`);
    try {
      const hash = await submitWrite({
        account,
        provider,
        functionName: input.functionName,
        callArgs: input.callArgs,
        label: input.label,
        postcondition: input.postcondition,
        onPhase: setPhase,
      });
      const intent = getPendingWrite();
      if (!intent) throw new Error("The finalized write has no recoverable pending intent");
      setPending(intent);
      const readback = await verifyPendingPostcondition(intent);
      setProfileId(readback.profileId);
      setProfile(readback.result.profile);
      setEvidence(readback.result.evidence);
      setAssessment(readback.result.assessment);
      clearPendingWrite();
      setPending(undefined);
      setPhase("complete");
      setNotice(`${input.label} is FINALIZED, successful, and confirmed by contract readback. ${short(hash)}`);
    } catch (error) {
      const intent = getPendingWrite();
      setPending(intent);
      if (intent) {
        try {
          setPhase("readback");
          setNotice(`${input.label}: wallet result was ambiguous; checking contract state…`);
          const readback = await verifyPendingPostcondition(intent);
          setProfileId(readback.profileId);
          setProfile(readback.result.profile);
          setEvidence(readback.result.evidence);
          setAssessment(readback.result.assessment);
          clearPendingWrite();
          setPending(undefined);
          setPhase("complete");
          setNotice(`${input.label} was recovered and confirmed by authoritative contract readback.`);
          return;
        } catch {
          // Preserve the journal for explicit receipt reconciliation when authoritative state is not visible yet.
        }
      }
      setPhase("error");
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) {
      setPhase("error");
      setNotice("Connect a wallet through the provider selector first");
      return;
    }
    const data = new FormData(event.currentTarget);
    const clientRef = String(data.get("client_ref")).trim();
    const productName = String(data.get("product_name")).trim();
    const version = String(data.get("version")).trim();
    const claimText = String(data.get("claim_text")).trim();
    const claimUrl = new URL(String(data.get("claim_url")));
    claimUrl.hash = "";
    await execute({
      functionName: "create_profile",
      callArgs: [clientRef, productName, version, claimText, claimUrl.href],
      label: "Register covenant",
      postcondition: { kind: "create_profile", owner: account, clientRef, productName, version, claimText, claimUrl: claimUrl.href },
    });
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const data = new FormData(event.currentTarget);
    const kind = String(data.get("kind"));
    const evidenceUrl = new URL(String(data.get("url")));
    evidenceUrl.hash = "";
    await execute({
      functionName: "add_evidence",
      callArgs: [BigInt(profile.id), kind, evidenceUrl.href],
      label: "Add frozen-scope evidence",
      postcondition: { kind: "add_evidence", profileId: profile.id, evidence: { kind: kind as EvidenceKind, url: evidenceUrl.href } },
    });
    event.currentTarget.reset();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Accessibility Scope Covenant home"><span>ASC</span><strong>Accessibility Scope Covenant</strong></a>
        <div className="network-pill"><i />Studionet · 61999</div>
        {account ? (
          <div className="wallet-connected"><span>{walletName}</span><strong>{short(account)}</strong><button onClick={openWalletSelector}>Switch</button><button onClick={() => { setAccount(undefined); setProvider(undefined); setWalletName(""); }}>Disconnect</button></div>
        ) : <button className="button primary" onClick={openWalletSelector}>Connect wallet</button>}
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Procurement evidence workbench</p>
            <h1>Does the accessibility claim fit its documented scope?</h1>
            <p className="lede">Freeze an exact product, version, public claim, ACR and critical journeys. GenLayer validators independently re-fetch the evidence and agree on the consequential verdict.</p>
          </div>
          <div className="decision-key">
            <p>Consensus consequence</p>
            <strong>SCOPE_ALIGNED</strong><span>→ Procurement review ready</span>
            <strong>Any other verdict</strong><span>→ Human review required</span>
          </div>
        </section>

        {!configured && <div className="deployment-banner" role="status"><strong>Pre-deployment build</strong><span>The Studionet contract address will be injected only after the approved deployment.</span></div>}
        {pending && <div className="recovery-banner"><div><strong>Pending transaction found</strong><span>{pending.label}{pending.hash ? ` · ${short(pending.hash)}` : " · awaiting contract readback"}</span></div><button className="button secondary" disabled={busy} onClick={() => reconcile(pending)}>Reconcile</button></div>}

        <section className="workbench">
          <aside className="sidebar" aria-label="Covenant navigation">
            <p className="section-label">Workspace</p>
            <button className={!profile ? "nav-item active" : "nav-item"} onClick={() => setProfile(undefined)}><span>01</span>New covenant</button>
            <form className="lookup" onSubmit={async (event) => { event.preventDefault(); setBusy(true); try { await refresh(profileId); setNotice(`Loaded covenant #${profileId}.`); } catch (error) { setNotice(errorMessage(error)); } finally { setBusy(false); } }}>
              <label htmlFor="profile-lookup">Covenant ID</label>
              <div><input id="profile-lookup" type="number" min="1" value={profileId} onChange={(event) => setProfileId(Number(event.target.value))} /><button disabled={busy || !configured}>Load</button></div>
            </form>
            <a className="nav-link" href={STUDIONET_EXPLORER} target="_blank" rel="noreferrer">Studionet Explorer ↗</a>
            <div className="scope-note"><strong>Scope, not certification</strong><p>The verdict checks claim-to-document alignment. It does not replace manual WCAG testing or legal review.</p></div>
          </aside>

          <div className="canvas">
            <div className="canvas-head">
              <div><p className="section-label">{profile ? `Covenant #${profile.id}` : "Registration"}</p><h2>{profile ? profile.product_name : "Create a version-bound record"}</h2></div>
              {profile && <span className={`state-tag state-${profile.state.toLowerCase()}`}>{profile.state.replaceAll("_", " ")}</span>}
            </div>

            {!profile ? (
              <form className="form-grid" onSubmit={createProfile}>
                <label>Client reference<input name="client_ref" required minLength={8} maxLength={80} placeholder="procurement-2026-041" /></label>
                <label>Product name<input name="product_name" required minLength={2} maxLength={120} placeholder="Civic Access Portal" /></label>
                <label>Exact version<input name="version" required maxLength={80} placeholder="2.4.1" /></label>
                <label>Public claim URL<input name="claim_url" required type="url" pattern="https://.*" placeholder="https://vendor.example/accessibility" /></label>
                <label className="span-2">Exact accessibility claim<textarea name="claim_text" required minLength={10} maxLength={1000} rows={4} placeholder="Paste the exact public claim being evaluated." /></label>
                <div className="form-actions span-2"><p>Creates a DRAFT. Evidence remains editable until freeze.</p><button className="button primary" disabled={busy || !configured || !account}>Register covenant</button></div>
              </form>
            ) : (
              <div className="profile-grid">
                <section className="panel claim-panel">
                  <p className="section-label">Frozen subject</p>
                  <dl><div><dt>Product</dt><dd>{profile.product_name}</dd></div><div><dt>Version</dt><dd>{profile.version}</dd></div><div><dt>Owner</dt><dd className="mono">{short(profile.owner, 10, 8)}</dd></div><div><dt>Attempts</dt><dd>{profile.attempts} / 3</dd></div></dl>
                  <blockquote>{profile.claim_text}</blockquote>
                  <a href={profile.claim_url} target="_blank" rel="noreferrer">Open public claim ↗</a>
                </section>

                <section className="panel evidence-panel">
                  <div className="panel-title"><div><p className="section-label">Evidence boundary</p><h3>{evidence.length} sources · {journeyCount} journeys</h3></div>{profile.state === "DRAFT" && <span>Editable</span>}</div>
                  <ol className="evidence-list">{evidence.map((item, index) => <li key={`${item.kind}-${item.url}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{evidenceLabels[item.kind]}</strong><a href={item.url} target="_blank" rel="noreferrer">{short(item.url, 34, 14)}</a></div></li>)}</ol>
                  {profile.state === "DRAFT" && <form className="evidence-form" onSubmit={addEvidence}><select name="kind" aria-label="Evidence kind" defaultValue="critical_journey"><option value="acr_html">HTML ACR</option><option value="openacr_json">OpenACR JSON</option><option value="version_page">Version page</option><option value="accessibility_statement">Accessibility statement</option><option value="critical_journey">Critical journey</option></select><input name="url" type="url" pattern="https://.*" required placeholder="https://…" aria-label="Evidence URL" /><button disabled={busy || !account}>Add</button></form>}
                </section>

                <section className="panel action-panel">
                  <p className="section-label">State action</p>
                  {profile.state === "DRAFT" && <><h3>Freeze the evidence set</h3><p>Requires exactly one HTML/OpenACR source, one version page and 3–5 public journey pages.</p><button className="button primary" disabled={busy || !account} onClick={() => execute({ functionName: "freeze_profile", callArgs: [BigInt(profile.id)], label: "Freeze covenant", postcondition: { kind: "freeze_profile", profileId: profile.id } })}>Freeze covenant</button></>}
                  {(profile.state === "FROZEN" || profile.state === "UNRESOLVED") && <><h3>{profile.state === "UNRESOLVED" ? "Retry bounded assessment" : "Run consensus assessment"}</h3><p>Validators independently retrieve the same frozen sources and compare stable decision fields.</p><button className="button primary" disabled={busy || !account || profile.attempts >= 3} onClick={() => execute({ functionName: "assess_scope", callArgs: [BigInt(profile.id)], label: "Assess accessibility scope", postcondition: { kind: "assess_scope", profileId: profile.id, previousAttempts: profile.attempts } })}>{profile.state === "UNRESOLVED" ? "Retry assessment" : "Assess scope"}</button></>}
                  {["ALIGNED", "REVIEW_REQUIRED", "SUPERSEDED"].includes(profile.state) && <><h3>Assessment is immutable</h3><p>Create a new version-bound covenant and link it through supersession when the public claim or product version changes.</p></>}
                </section>

                <section className="panel result-panel">
                  <p className="section-label">Consensus result</p>
                  {assessment ? <><div className={`verdict verdict-${assessment.verdict.toLowerCase()}`}>{assessment.verdict.replaceAll("_", " ")}</div><h3>{profile.consequence.replaceAll("_", " ")}</h3><p>{assessment.reason}</p><div className="checks"><span className={assessment.product_match ? "yes" : "no"}>Product {assessment.product_match ? "matches" : "mismatch"}</span><span className={assessment.version_match ? "yes" : "no"}>Version {assessment.version_match ? "matches" : "mismatch"}</span><span className={assessment.evidence_complete ? "yes" : "no"}>Evidence {assessment.evidence_complete ? "complete" : "incomplete"}</span><span className={assessment.limitation_disclosed ? "yes" : "no"}>Limitations {assessment.limitation_disclosed ? "disclosed" : "undisclosed"}</span></div></> : <div className="empty-state">No consensus assessment recorded yet.</div>}
                </section>

                <section className="panel supersede-panel">
                  <p className="section-label">Version lineage</p><h3>Supersede this covenant</h3><p>Both records must share the same product identity and already be frozen or assessed.</p>
                  <form onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const newId = Number(data.get("new_id")); await execute({ functionName: "supersede_profile", callArgs: [BigInt(profile.id), BigInt(newId)], label: "Link superseding covenant", postcondition: { kind: "supersede_profile", oldProfileId: profile.id, newProfileId: newId } }); }}><input name="new_id" type="number" min="1" required placeholder="New covenant ID" aria-label="New covenant ID" /><button disabled={busy || !account}>Link</button></form>
                </section>
              </div>
            )}
          </div>

          <aside className="activity" aria-live="polite">
            <p className="section-label">Transaction monitor</p><h3>{phaseCopy[phase]}</h3><StatusRail phase={phase} /><div className={`notice notice-${phase}`}><span />{notice}</div>
            <div className="network-facts"><div><span>RPC</span><strong>studio.genlayer.com/api</strong></div><div><span>Contract</span><strong>{import.meta.env.VITE_CONTRACT_ADDRESS ? short(import.meta.env.VITE_CONTRACT_ADDRESS) : "Not deployed"}</strong></div><div><span>Authority</span><strong>Contract readback</strong></div></div>
          </aside>
        </section>
      </main>

      <footer><span>Accessibility Scope Covenant</span><span>Non-economic · Studionet</span><span>Built for transparent procurement review</span></footer>
      {walletDialog && <WalletDialog options={wallets} busy={busy} onChoose={chooseWallet} onClose={() => !busy && setWalletDialog(false)} />}
    </div>
  );
}
