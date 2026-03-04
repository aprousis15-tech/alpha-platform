import { useState, useRef, useEffect } from "react";

/* ── INVESTORS ── */
const INVESTORS = [
  { id: "druckenmiller", name: "Druckenmiller", title: "Macro + Asymmetry",     color: "#34D399", icon: "◈", field: "druckenmillerTake" },
  { id: "buffett",       name: "Buffett",       title: "Moat + Owner Earnings", color: "#FBBF24", icon: "◉", field: "buffettTake"       },
  { id: "marks",        name: "Howard Marks",  title: "Cycle + Risk",          color: "#C084FC", icon: "◎", field: "marksTake"         },
  { id: "andreessen",   name: "Andreessen",    title: "Platform Shifts + AI",  color: "#60A5FA", icon: "◆", field: "andreessenTake"    },
  { id: "sundheim",     name: "Dan Sundheim",  title: "Late Private → Public", color: "#F472B6", icon: "◐", field: "sundheimTake"      },
  { id: "coleman",      name: "Chase Coleman", title: "Software Durability",   color: "#2DD4BF", icon: "◑", field: "colemanTake"       },
];

const VERDICT = {
  BUY:   { color: "#34D399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)"  },
  HOLD:  { color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  },
  AVOID: { color: "#F87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
};

const TABS = [
  { id: "scorecard", label: "Scorecard",    sub: "6-Lens + Metrics"    },
  { id: "writeup",   label: "IC Write-Up",  sub: "Full Memorandum"     },
  { id: "intel",     label: "Intelligence", sub: "SEC · 13F · Signals" },
];

const EXAMPLES = ["WAY", "MSFT", "NVDA", "META", "SNOW", "AAPL", "TSLA", "PLTR"];

/* ── PROMPTS ── */
const SCORECARD_PROMPT = `You are an elite institutional equity analyst. Return ONLY valid JSON, no markdown, no preamble, no explanation.

RULES: Use actual reported figures. For WAY: NRR=112%, GRR=97%. EV/EBITDA must include period. Dollar figures required. If unsure, use "N/A".

Return exactly:
{"company":"string","ticker":"string","sector":"string","currentThesis":"string","bearCase":"string","moat":"string","catalysts":["s","s","s"],"risks":["s","s","s"],"ratioMetrics":{"nrr":"string","grossRetention":"string","ebitdaMargin":"string","fcfYield":"string","netLeverage":"string","evEbitda":"string","revenueGrowth":"string"},"dollarMetrics":{"ltmRevenue":"string","ltmEbitda":"string","fwdRevenueGuide":"string","fwdEbitdaGuide":"string","marketCap":"string","enterpriseValue":"string"},"druckenmillerTake":"string","buffettTake":"string","marksTake":"string","andreessenTake":"string","sundheimTake":"string","colemanTake":"string","verdict":"BUY","conviction":8,"priceTarget":"string","disclaimer":"string"}`;

const WRITEUP_PROMPT = `You are a senior hedge fund analyst writing an IC investment memorandum. Be specific, opinionated, and cite actual figures. For WAY: NRR=112%, GRR=97%.

Return ONLY valid JSON, no markdown, no preamble:

{"ticker":"string","company":"string","sector":"string","verdict":"BUY","conviction":8,"priceTarget":"string","thesisSummary":"3-4 sentence executive summary with highest conviction argument, mispricing reason, primary catalyst, risk/reward setup","keyHighlights":[{"title":"string","body":"string"},{"title":"string","body":"string"},{"title":"string","body":"string"},{"title":"string","body":"string"},{"title":"string","body":"string"}],"businessModel":{"whatItDoes":"3-4 sentences plain English","revenueStreams":"2-3 sentences on sub vs transaction vs other mix","marketPosition":"2-3 sentences on competitive position and key customers","nonDiscretionary":"2 sentences on why customers cannot churn"},"moatAnalysis":{"rating":"Wide","dataAdvantage":"2-3 sentences","switchingCosts":"2-3 sentences with specific examples","scaleBenefits":"2 sentences","replicationBarrier":"2 sentences"},"customerEconomics":{"nrr":"metric + explanation","grossRetention":"metric + explanation","expansionMechanism":"how revenue grows within existing customers"},"structuralCatalyst":{"name":"string","explanation":"3-4 sentences plain English why this matters and timing","quantifiedImpact":"best estimate of revenue/earnings impact","risk":"1-2 sentences what prevents this"},"aiAngle":{"coreTechAsset":"string","monetization":"string","defensibility":"string","stackPosition":"platform or application layer and why that matters"},"fcfProfile":{"ltmFcf":"string","fcfMargin":"string","capexCharacter":"maintenance vs growth and what it means for cash conversion","growthPath":"2-3 sentences on what drives FCF growth next 3-5 years"},"financials":{"ltmRevenue":"string","ltmEbitda":"string","grossMargin":"string","revenueGrowth":"string","fwdRevGuide":"string","fwdEbitdaGuide":"string","netLeverage":"string","evEbitda":"string with period"},"debtStructure":{"grossDebt":"string","debtType":"string","deleveragingPath":"string","interestSavings":"string"},"competitive":{"primaryThreat":"string","assessment":"3-4 sentences how serious the threat is with evidence","defense":"where most and least defensible","shareGain":"gaining or losing share and where"},"bearCase":{"primaryRisk":"single biggest thesis killer","risks":[{"risk":"string","detail":"2-3 sentences","mitigant":"1-2 sentences"},{"risk":"string","detail":"2-3 sentences","mitigant":"1-2 sentences"},{"risk":"string","detail":"2-3 sentences","mitigant":"1-2 sentences"},{"risk":"string","detail":"2-3 sentences","mitigant":"1-2 sentences"}]},"valuation":{"primaryMetric":"right metric and why","currentMultiple":"string with period","peerMultiples":"string","targetMultiple":"string","priceTargetBuild":"step by step logic","bull":"upside scenario","base":"base case","bear":"downside scenario"},"mgmtQuestions":["string","string","string","string","string"],"catalystTimeline":[{"period":"0-3 months","catalyst":"string"},{"period":"3-6 months","catalyst":"string"},{"period":"6-18 months","catalyst":"string"}],"conclusion":"3-4 sentence final verdict","disclaimer":"AI-generated for educational purposes only. Not investment advice. Verify against primary sources."}`;

const INTEL_SYSTEM = `You are a research analyst. The user will provide raw data fetched from SEC EDGAR, financial databases, and public sources about a stock. Your job is to synthesize this into actionable intelligence.

Return ONLY valid JSON, no markdown:

{"ticker":"string","fetchedAt":"string","secFindings":{"recentFilings":[{"type":"string","date":"string","keyTakeaway":"string"}],"insiderActivity":{"summary":"string","recentTransactions":[{"who":"string","type":"Buy/Sell","shares":"string","value":"string","date":"string","signal":"string"}]},"redFlags":["string"],"positiveSignals":["string"]},"institutionalOwnership":{"summary":"string","notableHolders":[{"fund":"string","position":"string","changeLastQ":"string","signal":"string"}],"smartMoneyTrend":"Accumulating / Distributing / Neutral","concentrationRisk":"string"},"shortInterest":{"shortFloat":"string","daysToCover":"string","trend":"Rising / Falling / Stable","interpretation":"string"},"earningsTranscript":{"lastEarningsDate":"string","managementTone":"Confident / Cautious / Mixed","keyQuotes":["string","string"],"guidanceVsConsensus":"string","languageShifts":"any notable changes in language vs prior quarter","redFlags":["string"],"bullishSignals":["string"]},"alternativeData":{"hiringSignals":"string","patentActivity":"string","regulatoryPipeline":"string","competitorMoves":"string"},"edgeAssessment":{"topInsight":"the single most non-consensus insight from all this data","whyItMatters":"string","actionableAngle":"string"},"disclaimer":"string"}`;

/* ── STYLES ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#0C0C14;}
::placeholder{color:rgba(255,255,255,0.2);}
input:focus{outline:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
.chip:hover{background:rgba(255,255,255,0.1)!important;color:rgba(255,255,255,0.7)!important;}
.run-btn:hover:not(:disabled){background:rgba(52,211,153,0.15)!important;}
.run-btn:active:not(:disabled){transform:scale(0.98);}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.fade-up{animation:fadeUp 0.45s ease forwards;}
`;

/* ── SHARED COMPONENTS ── */
function Label({ children, accent }) {
  return <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent || "rgba(255,255,255,0.38)", marginBottom: "5px", fontFamily: "var(--mono)" }}>{children}</div>;
}
function Card({ children, style }) {
  return <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "22px 24px", ...style }}>{children}</div>;
}
function SecHead({ children, accent }) {
  return <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: accent || "rgba(255,255,255,0.38)", fontFamily: "var(--mono)", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${accent ? accent + "22" : "rgba(255,255,255,0.07)"}` }}>{children}</div>;
}
function MetricCard({ label, value, accent }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "13px 15px" }}>
      <Label>{label}</Label>
      <div style={{ fontSize: "15px", fontWeight: 600, color: accent || "#fff", fontFamily: "var(--mono)" }}>{value || "—"}</div>
    </div>
  );
}
function Prose({ children, dim }) {
  return <p style={{ color: dim ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.82)", fontSize: "15px", lineHeight: 1.8, marginBottom: "8px" }}>{children}</p>;
}
function Sub({ children }) {
  return <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "var(--mono)", letterSpacing: "0.06em", marginBottom: "4px", marginTop: "14px" }}>{children}</div>;
}
function ConvictionBar({ value }) {
  const color = value >= 8 ? "#34D399" : value >= 5 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value * 10}%`, background: color, borderRadius: "3px", transition: "width 1.2s ease", boxShadow: `0 0 8px ${color}80` }} />
      </div>
      <span style={{ color, fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 700, minWidth: "40px" }}>{value}/10</span>
    </div>
  );
}
function Spinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "64px 0" }}>
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(255,255,255,0.06)", borderTopColor: "#34D399", borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
        <div style={{ position: "absolute", inset: "10px", border: "2px solid rgba(255,255,255,0.04)", borderTopColor: "rgba(52,211,153,0.4)", borderRadius: "50%", animation: "spin 1.4s linear infinite reverse" }} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "0.12em" }}>{label}</div>
    </div>
  );
}
function InvestorCard({ investor, take }) {
  const [open, setOpen] = useState(true);
  if (!take) return null;
  return (
    <div style={{ border: `1px solid ${investor.color}22`, borderLeft: `3px solid ${investor.color}`, borderRadius: "10px", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <span style={{ color: investor.color, fontSize: "14px" }}>{investor.icon}</span>
          <div>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{investor.name}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "var(--mono)" }}>{investor.title}</div>
          </div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "16px" }}>{open ? "−" : "+"}</span>
      </div>
      {open && <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${investor.color}15` }}><p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.75 }}>{take}</p></div>}
    </div>
  );
}

/* ── SCORECARD TAB ── */
function ScorecardTab({ data }) {
  const vc = VERDICT[data.verdict] || VERDICT.HOLD;
  const rm = data.ratioMetrics || {};
  const dm = data.dollarMetrics || {};
  return (
    <div className="fade-up">
      <Card style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "18px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "28px", fontWeight: 700 }}>{data.ticker}</span>
            <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", padding: "3px 10px", fontSize: "11px", fontFamily: "var(--mono)", color: "rgba(255,255,255,0.45)" }}>{data.sector}</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>{data.company}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", background: vc.bg, border: `1px solid ${vc.border}`, color: vc.color, padding: "9px 20px", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.14em", marginBottom: "7px" }}>{data.verdict}</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--mono)", fontSize: "12px" }}>{data.priceTarget}</div>
        </div>
      </Card>
      <Card style={{ marginBottom: "12px" }}><Label>Conviction</Label><ConvictionBar value={data.conviction} /></Card>
      <div style={{ marginBottom: "4px" }}>
        <Label>Key Ratios</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(128px,1fr))", gap: "8px", marginBottom: "8px" }}>
          <MetricCard label="NRR"             value={rm.nrr}           accent="#34D399" />
          <MetricCard label="Gross Retention" value={rm.grossRetention} accent="#34D399" />
          <MetricCard label="EBITDA Margin"   value={rm.ebitdaMargin}  />
          <MetricCard label="FCF Yield"       value={rm.fcfYield}      />
          <MetricCard label="Net Leverage"    value={rm.netLeverage}   />
          <MetricCard label="EV / EBITDA"     value={rm.evEbitda}      />
          <MetricCard label="Rev Growth"      value={rm.revenueGrowth} />
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <Label>Dollar Figures & Forward Guidance</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: "8px" }}>
          <MetricCard label="LTM Revenue"      value={dm.ltmRevenue}      />
          <MetricCard label="LTM EBITDA"       value={dm.ltmEbitda}       />
          <MetricCard label="Fwd Rev Guide"    value={dm.fwdRevenueGuide} accent="#60A5FA" />
          <MetricCard label="Fwd EBITDA Guide" value={dm.fwdEbitdaGuide}  accent="#60A5FA" />
          <MetricCard label="Market Cap"       value={dm.marketCap}       />
          <MetricCard label="Enterprise Value" value={dm.enterpriseValue} />
        </div>
      </div>
      <Card style={{ marginBottom: "12px" }}>
        <div style={{ marginBottom: "20px" }}><SecHead>Bull Thesis</SecHead><Prose>{data.currentThesis}</Prose></div>
        <div style={{ marginBottom: "20px" }}><SecHead>Bear Case</SecHead><Prose dim>{data.bearCase}</Prose></div>
        <div style={{ marginBottom: "20px" }}><SecHead>Economic Moat</SecHead><Prose dim>{data.moat}</Prose></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div><SecHead accent="#34D399">Catalysts</SecHead>{(data.catalysts||[]).map((c,i)=><div key={i} style={{display:"flex",gap:"10px",marginBottom:"9px"}}><span style={{color:"#34D399",fontSize:"12px",marginTop:"3px",flexShrink:0,fontFamily:"var(--mono)",fontWeight:700}}>↑</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:"14px",lineHeight:1.6}}>{c}</span></div>)}</div>
          <div><SecHead accent="#F87171">Key Risks</SecHead>{(data.risks||[]).map((r,i)=><div key={i} style={{display:"flex",gap:"10px",marginBottom:"9px"}}><span style={{color:"#F87171",fontSize:"12px",marginTop:"3px",flexShrink:0,fontFamily:"var(--mono)",fontWeight:700}}>↓</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:"14px",lineHeight:1.6}}>{r}</span></div>)}</div>
        </div>
      </Card>
      <div style={{ marginBottom: "12px" }}>
        <SecHead>Six Investor Lenses</SecHead>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {INVESTORS.map(inv => <InvestorCard key={inv.id} investor={inv} take={data[inv.field]} />)}
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px", fontFamily: "var(--mono)", textAlign: "center", lineHeight: 1.65 }}>{data.disclaimer}</p>
    </div>
  );
}

/* ── WRITEUP TAB ── */
function WriteupTab({ data }) {
  const vc = VERDICT[data.verdict] || VERDICT.HOLD;
  const fin = data.financials || {};
  const moat = data.moatAnalysis || {};
  const cust = data.customerEconomics || {};
  const cat = data.structuralCatalyst || {};
  const ai = data.aiAngle || {};
  const fcf = data.fcfProfile || {};
  const debt = data.debtStructure || {};
  const comp = data.competitive || {};
  const bear = data.bearCase || {};
  const val = data.valuation || {};

  return (
    <div className="fade-up">
      {/* IC Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "28px 30px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)", marginBottom: "8px" }}>Investment Memorandum</div>
            <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>{data.ticker} — {data.company}</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", fontFamily: "var(--mono)" }}>{data.sector}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-block", background: vc.bg, border: `1px solid ${vc.border}`, color: vc.color, padding: "10px 22px", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "17px", fontWeight: 700, letterSpacing: "0.14em", marginBottom: "8px" }}>{data.verdict}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--mono)", fontSize: "13px", marginBottom: "3px" }}>{data.priceTarget}</div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--mono)", fontSize: "11px" }}>Conviction {data.conviction}/10</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: "8px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[["LTM Revenue",fin.ltmRevenue],["LTM EBITDA",fin.ltmEbitda],["Gross Margin",fin.grossMargin],["Rev Growth",fin.revenueGrowth],["Net Leverage",fin.netLeverage],["EV/EBITDA",fin.evEbitda]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontFamily:"var(--mono)",marginBottom:"3px"}}>{l}</div><div style={{fontSize:"14px",fontWeight:600,color:"#fff",fontFamily:"var(--mono)"}}>{v||"—"}</div></div>
          ))}
        </div>
      </div>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Thesis Summary</SecHead>
        <Prose>{data.thesisSummary}</Prose>
        <div style={{ marginTop: "20px" }}><SecHead>Key Investment Highlights</SecHead>
          {(data.keyHighlights||[]).map((h,i)=>(
            <div key={i} style={{display:"flex",gap:"14px",marginBottom:"16px"}}>
              <div style={{width:"24px",height:"24px",borderRadius:"50%",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"2px"}}>
                <span style={{color:"#34D399",fontSize:"11px",fontWeight:700,fontFamily:"var(--mono)"}}>{i+1}</span>
              </div>
              <div><div style={{fontSize:"14px",fontWeight:700,color:"#fff",marginBottom:"4px"}}>{h.title}</div><Prose dim>{h.body}</Prose></div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Business Model</SecHead>
        <Sub>What It Does</Sub><Prose>{data.businessModel?.whatItDoes}</Prose>
        <Sub>Revenue Streams</Sub><Prose dim>{data.businessModel?.revenueStreams}</Prose>
        <Sub>Market Position</Sub><Prose dim>{data.businessModel?.marketPosition}</Prose>
        <Sub>Why It's Non-Discretionary</Sub><Prose dim>{data.businessModel?.nonDiscretionary}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>{`Economic Moat — ${moat.rating||""}`}</SecHead>
        <Sub>Data & Network Advantage</Sub><Prose>{moat.dataAdvantage}</Prose>
        <Sub>Switching Costs</Sub><Prose dim>{moat.switchingCosts}</Prose>
        <Sub>Scale Benefits</Sub><Prose dim>{moat.scaleBenefits}</Prose>
        <Sub>Replication Barrier</Sub><Prose dim>{moat.replicationBarrier}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Customer Economics</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {[["#34D399","NRR","Net Revenue Retention",cust.nrr],["#60A5FA","GRR","Gross Revenue Retention",cust.grossRetention]].map(([color,abbr,label,val])=>(
            <div key={abbr} style={{background:`rgba(${color==="#34D399"?"52,211,153":"96,165,250"},0.06)`,border:`1px solid rgba(${color==="#34D399"?"52,211,153":"96,165,250"},0.18)`,borderRadius:"8px",padding:"14px 16px"}}>
              <div style={{color,fontFamily:"var(--mono)",fontSize:"22px",fontWeight:700,marginBottom:"4px"}}>{typeof val==="string"?val.split(" ")[0]:abbr}</div>
              <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"var(--mono)",marginBottom:"6px"}}>{label}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px",lineHeight:1.6}}>{typeof val==="string"?val.replace(/^\S+\s*/,""):""}</div>
            </div>
          ))}
        </div>
        <Sub>Expansion Mechanism</Sub><Prose dim>{cust.expansionMechanism}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#FBBF24">{`Structural Catalyst — ${cat.name||""}`}</SecHead>
        <Prose>{cat.explanation}</Prose>
        {cat.quantifiedImpact && <><Sub>Quantified Impact</Sub><Prose dim>{cat.quantifiedImpact}</Prose></>}
        <Sub>Risk to Catalyst</Sub><Prose dim>{cat.risk}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#60A5FA">AI & Technology Edge</SecHead>
        <Sub>Core Tech Asset</Sub><Prose>{ai.coreTechAsset}</Prose>
        <Sub>Monetization</Sub><Prose dim>{ai.monetization}</Prose>
        <Sub>Defensibility</Sub><Prose dim>{ai.defensibility}</Prose>
        <Sub>Stack Position</Sub><Prose dim>{ai.stackPosition}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#C084FC">Free Cash Flow Profile</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <MetricCard label="LTM FCF" value={fcf.ltmFcf} accent="#C084FC" />
          <MetricCard label="FCF Margin" value={fcf.fcfMargin} accent="#C084FC" />
        </div>
        <Sub>Capex Character</Sub><Prose dim>{fcf.capexCharacter}</Prose>
        <Sub>FCF Growth Path</Sub><Prose>{fcf.growthPath}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Financial Snapshot</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "8px", marginBottom: "14px" }}>
          <MetricCard label="LTM Revenue"      value={fin.ltmRevenue}     />
          <MetricCard label="LTM EBITDA"       value={fin.ltmEbitda}      />
          <MetricCard label="Gross Margin"     value={fin.grossMargin}    />
          <MetricCard label="Rev Growth"       value={fin.revenueGrowth}  />
          <MetricCard label="Fwd Rev Guide"    value={fin.fwdRevGuide}    accent="#60A5FA" />
          <MetricCard label="Fwd EBITDA Guide" value={fin.fwdEbitdaGuide} accent="#60A5FA" />
        </div>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Debt & Capital Structure</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <MetricCard label="Gross Debt" value={debt.grossDebt} />
          <MetricCard label="Debt Type"  value={debt.debtType}  />
        </div>
        <Sub>Deleveraging Path</Sub><Prose>{debt.deleveragingPath}</Prose>
        <Sub>Interest Savings</Sub><Prose dim>{debt.interestSavings}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#F472B6">Competitive Landscape</SecHead>
        <Sub>Primary Threat</Sub><Prose>{comp.primaryThreat}</Prose>
        <Sub>Threat Assessment</Sub><Prose dim>{comp.assessment}</Prose>
        <Sub>Segment Defense</Sub><Prose dim>{comp.defense}</Prose>
        <Sub>Market Share Dynamics</Sub><Prose dim>{comp.shareGain}</Prose>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#F87171">Bear Case — Risks & Mitigants</SecHead>
        <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F87171", fontFamily: "var(--mono)", marginBottom: "5px" }}>Primary Risk</div>
          <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "14px" }}>{bear.primaryRisk}</div>
        </div>
        {(bear.risks||[]).map((r,i)=>(
          <div key={i} style={{marginBottom:"20px",paddingBottom:"20px",borderBottom:i<(bear.risks.length-1)?"1px solid rgba(255,255,255,0.06)":"none"}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#F87171",marginBottom:"6px"}}>{r.risk}</div>
            <Prose dim>{r.detail}</Prose>
            <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
              <span style={{color:"#34D399",fontSize:"11px",fontFamily:"var(--mono)",fontWeight:700,flexShrink:0,marginTop:"2px"}}>↳</span>
              <span style={{color:"rgba(255,255,255,0.55)",fontSize:"13px",lineHeight:1.65,fontStyle:"italic"}}>{r.mitigant}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead accent="#FBBF24">Valuation</SecHead>
        <Sub>Primary Metric & Rationale</Sub><Prose>{val.primaryMetric}</Prose>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", margin: "14px 0" }}>
          <MetricCard label="Current Multiple" value={val.currentMultiple} />
          <MetricCard label="Peer Multiples"   value={val.peerMultiples}   />
          <MetricCard label="Target Multiple"  value={val.targetMultiple}  accent="#FBBF24" />
        </div>
        <Sub>Price Target Build</Sub><Prose dim>{val.priceTargetBuild}</Prose>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "14px" }}>
          {[["#34D399","Bull Case",val.bull],["#FBBF24","Base Case",val.base],["#F87171","Bear Case",val.bear]].map(([color,label,text])=>(
            <div key={label} style={{background:`rgba(${color==="#34D399"?"52,211,153":color==="#FBBF24"?"251,191,36":"248,113,113"},0.06)`,border:`1px solid rgba(${color==="#34D399"?"52,211,153":color==="#FBBF24"?"251,191,36":"248,113,113"},0.18)`,borderRadius:"8px",padding:"12px 14px"}}>
              <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color,fontFamily:"var(--mono)",marginBottom:"6px"}}>{label}</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:"13px",lineHeight:1.6}}>{text}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Key Questions for Management</SecHead>
        {(data.mgmtQuestions||[]).map((q,i)=>(
          <div key={i} style={{display:"flex",gap:"12px",marginBottom:"10px"}}>
            <span style={{color:"rgba(255,255,255,0.25)",fontFamily:"var(--mono)",fontSize:"12px",fontWeight:700,flexShrink:0,marginTop:"2px"}}>Q{i+1}</span>
            <span style={{color:"rgba(255,255,255,0.75)",fontSize:"14px",lineHeight:1.65}}>{q}</span>
          </div>
        ))}
        <div style={{ marginTop: "20px" }}><SecHead>Catalyst Timeline</SecHead>
          {(data.catalystTimeline||[]).map((c,i)=>(
            <div key={i} style={{display:"flex",gap:"16px",marginBottom:"12px",alignItems:"flex-start"}}>
              <div style={{minWidth:"90px",fontSize:"11px",fontWeight:600,color:"#34D399",fontFamily:"var(--mono)",paddingTop:"2px"}}>{c.period}</div>
              <div style={{color:"rgba(255,255,255,0.72)",fontSize:"14px",lineHeight:1.65}}>{c.catalyst}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "20px" }}><SecHead>Conclusion</SecHead><Prose>{data.conclusion}</Prose></div>
      </Card>

      <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px", fontFamily: "var(--mono)", textAlign: "center", lineHeight: 1.65 }}>{data.disclaimer}</p>
    </div>
  );
}

/* ── INTELLIGENCE TAB ── */
function IntelTab({ ticker, onRun, data, loading, error }) {
  const [fetching, setFetching] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  async function fetchAndAnalyze() {
    if (!ticker) return;
    setFetching(true);
    setRawData(null);
    setFetchError(null);

    try {
      // Use Claude with web search to fetch real intelligence
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: INTEL_SYSTEM,
          messages: [{
            role: "user",
            content: `Run a full intelligence sweep on ${ticker}. Search for and synthesize:

1. SEC EDGAR: Latest 10-K, 10-Q, any 8-Ks in the last 90 days, and Form 4 insider transactions (search "SEC EDGAR ${ticker} insider transactions form 4 2025 2026")
2. Institutional ownership: Latest 13F filings — who are the top holders, who bought/sold last quarter (search "${ticker} 13F institutional ownership Q4 2025")  
3. Short interest: Current short float and trend (search "${ticker} short interest 2026")
4. Earnings transcript: Most recent earnings call — management tone, key quotes, guidance vs consensus, any language shifts (search "${ticker} Q4 2025 earnings call transcript")
5. Alternative signals: Recent job postings trends, patent filings, regulatory pipeline, competitor moves (search "${ticker} hiring 2026 headcount" and "${ticker} competitor news 2026")

Synthesize everything into the JSON format specified. Identify the single most non-consensus insight.`
          }]
        }),
      });

      const raw = await res.json();
      const text = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const cleaned = text.replace(/```json|```/g, "").trim();
      // Find JSON in response
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart === -1) throw new Error("No JSON found");
      const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
      setRawData(parsed);
    } catch (e) {
      setFetchError("Intelligence fetch failed. " + e.message);
    } finally {
      setFetching(false);
    }
  }

  const SignalBadge = ({ text, positive }) => (
    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
      <span style={{ color: positive ? "#34D399" : "#F87171", fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>{positive ? "+" : "−"}</span>
      <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.6 }}>{text}</span>
    </div>
  );

  if (!rawData && !fetching && !fetchError) {
    return (
      <div className="fade-up">
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Live Intelligence Sweep</div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.75 }}>
              Pulls real-time data from SEC EDGAR, 13F filings, earnings transcripts, short interest, and alternative signals. Claude searches the web live to find the most current intelligence.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              ["📄 SEC Filings", "10-K, 10-Q, 8-K, Form 4 insider transactions"],
              ["🏦 13F Analysis", "Smart money holders, Q/Q changes, positioning trends"],
              ["📞 Earnings NLP", "Tone analysis, language shifts, guidance vs consensus"],
              ["⚡ Alt Data", "Hiring signals, patents, regulatory pipeline, competitor moves"],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "14px 16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          <button onClick={fetchAndAnalyze} style={{ width: "100%", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "14px", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
            RUN INTELLIGENCE SWEEP ON {ticker} →
          </button>
        </Card>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", fontFamily: "var(--mono)", textAlign: "center" }}>Uses live web search. Results depend on publicly available data. Always verify against primary sources.</p>
      </div>
    );
  }

  if (fetching) return <Spinner label={`SWEEPING INTELLIGENCE ON ${ticker}`} />;
  if (fetchError) return <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "14px 18px", color: "#F87171", fontFamily: "var(--mono)", fontSize: "13px" }}>{fetchError}<br/><button onClick={fetchAndAnalyze} style={{marginTop:"12px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#F87171",padding:"8px 16px",borderRadius:"6px",cursor:"pointer",fontFamily:"var(--mono)",fontSize:"11px"}}>RETRY</button></div>;

  const sec = rawData.secFindings || {};
  const inst = rawData.institutionalOwnership || {};
  const si = rawData.shortInterest || {};
  const et = rawData.earningsTranscript || {};
  const alt = rawData.alternativeData || {};
  const edge = rawData.edgeAssessment || {};

  const smartMoneyColor = inst.smartMoneyTrend === "Accumulating" ? "#34D399" : inst.smartMoneyTrend === "Distributing" ? "#F87171" : "#FBBF24";

  return (
    <div className="fade-up">
      {/* Edge insight — lead with the alpha */}
      <div style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(96,165,250,0.08))", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "14px", padding: "24px 26px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#34D399", fontFamily: "var(--mono)", marginBottom: "10px" }}>⚡ Top Non-Consensus Insight</div>
        <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "8px", lineHeight: 1.4 }}>{edge.topInsight}</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: 1.75, marginBottom: "10px" }}>{edge.whyItMatters}</div>
        <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", padding: "10px 14px" }}>
          <span style={{ color: "#34D399", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>ACTIONABLE ANGLE: </span>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>{edge.actionableAngle}</span>
        </div>
      </div>

      {/* Institutional ownership */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Institutional Ownership & Smart Money</SecHead>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: `rgba(${smartMoneyColor==="#34D399"?"52,211,153":smartMoneyColor==="#F87171"?"248,113,113":"251,191,36"},0.1)`, border: `1px solid rgba(${smartMoneyColor==="#34D399"?"52,211,153":smartMoneyColor==="#F87171"?"248,113,113":"251,191,36"},0.3)`, borderRadius: "8px", padding: "8px 16px" }}>
            <span style={{ color: smartMoneyColor, fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700 }}>{inst.smartMoneyTrend || "—"}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{inst.summary}</span>
        </div>
        {(inst.notableHolders||[]).map((h,i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "8px", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
            <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"var(--mono)",marginBottom:"3px"}}>FUND</div><div style={{fontSize:"13px",fontWeight:600}}>{h.fund}</div></div>
            <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"var(--mono)",marginBottom:"3px"}}>POSITION</div><div style={{fontSize:"13px",fontFamily:"var(--mono)"}}>{h.position}</div></div>
            <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"var(--mono)",marginBottom:"3px"}}>CHANGE</div><div style={{fontSize:"13px",fontFamily:"var(--mono)",color:h.changeLastQ?.includes("+")||h.changeLastQ?.toLowerCase().includes("new")?"#34D399":h.changeLastQ?.includes("-")?"#F87171":"#fff"}}>{h.changeLastQ}</div></div>
            <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"var(--mono)",marginBottom:"3px"}}>SIGNAL</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.55)"}}>{h.signal}</div></div>
          </div>
        ))}
        {inst.concentrationRisk && <div style={{marginTop:"10px",color:"rgba(255,255,255,0.45)",fontSize:"13px",fontFamily:"var(--mono)"}}>{inst.concentrationRisk}</div>}
      </Card>

      {/* Insider transactions */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Insider Transactions (Form 4)</SecHead>
        <Prose dim>{sec.insiderActivity?.summary}</Prose>
        {(sec.insiderActivity?.recentTransactions||[]).map((t,i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr", gap: "8px", marginBottom: "8px", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", alignItems: "center" }}>
            <div style={{fontSize:"13px",fontWeight:600}}>{t.who}</div>
            <div style={{fontSize:"12px",fontFamily:"var(--mono)",color:t.type==="Buy"?"#34D399":"#F87171",fontWeight:700}}>{t.type}</div>
            <div style={{fontSize:"12px",fontFamily:"var(--mono)",color:"rgba(255,255,255,0.6)"}}>{t.shares}</div>
            <div style={{fontSize:"12px",fontFamily:"var(--mono)"}}>{t.value}</div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.45)"}}>{t.signal}</div>
          </div>
        ))}
      </Card>

      {/* Short interest */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Short Interest</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <MetricCard label="Short Float"    value={si.shortFloat}   />
          <MetricCard label="Days to Cover"  value={si.daysToCover}  />
          <MetricCard label="Trend"          value={si.trend} accent={si.trend==="Falling"?"#34D399":si.trend==="Rising"?"#F87171":"#FBBF24"} />
        </div>
        <Prose dim>{si.interpretation}</Prose>
      </Card>

      {/* Earnings transcript */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Earnings Call Analysis</SecHead>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <MetricCard label="Last Earnings" value={et.lastEarningsDate} />
          <MetricCard label="Mgmt Tone" value={et.managementTone} accent={et.managementTone==="Confident"?"#34D399":et.managementTone==="Cautious"?"#F87171":"#FBBF24"} />
        </div>
        {(et.keyQuotes||[]).map((q,i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid rgba(96,165,250,0.5)", borderRadius: "6px", padding: "12px 16px", marginBottom: "10px" }}>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.7, fontStyle: "italic" }}>"{q}"</p>
          </div>
        ))}
        {et.guidanceVsConsensus && <><Sub>Guidance vs Consensus</Sub><Prose dim>{et.guidanceVsConsensus}</Prose></>}
        {et.languageShifts && <><Sub>Language Shifts vs Prior Quarter</Sub><Prose dim>{et.languageShifts}</Prose></>}
        {et.bullishSignals?.length > 0 && <><Sub>Bullish Signals</Sub>{et.bullishSignals.map((s,i)=><SignalBadge key={i} text={s} positive={true}/>)}</>}
        {et.redFlags?.length > 0 && <><Sub>Red Flags</Sub>{et.redFlags.map((s,i)=><SignalBadge key={i} text={s} positive={false}/>)}</>}
      </Card>

      {/* Recent SEC filings */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Recent SEC Filings</SecHead>
        {(sec.recentFilings||[]).map((f,i) => (
          <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "12px", paddingBottom: "12px", borderBottom: i < (sec.recentFilings.length-1) ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ minWidth: "48px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "5px", padding: "4px 6px", textAlign: "center", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 700, color: "rgba(255,255,255,0.55)", height: "fit-content" }}>{f.type}</div>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "var(--mono)", marginBottom: "4px" }}>{f.date}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6 }}>{f.keyTakeaway}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: "8px" }}>
          {sec.positiveSignals?.length > 0 && <><Sub>Positive Signals</Sub>{sec.positiveSignals.map((s,i)=><SignalBadge key={i} text={s} positive={true}/>)}</>}
          {sec.redFlags?.length > 0 && <><Sub>Red Flags</Sub>{sec.redFlags.map((s,i)=><SignalBadge key={i} text={s} positive={false}/>)}</>}
        </div>
      </Card>

      {/* Alternative data */}
      <Card style={{ marginBottom: "12px" }}>
        <SecHead>Alternative Data Signals</SecHead>
        {[["Hiring Signals", alt.hiringSignals], ["Patent Activity", alt.patentActivity], ["Regulatory Pipeline", alt.regulatoryPipeline], ["Competitor Moves", alt.competitorMoves]].map(([label, val]) => val ? (
          <div key={label} style={{ marginBottom: "14px" }}>
            <Sub>{label}</Sub>
            <Prose dim>{val}</Prose>
          </div>
        ) : null)}
      </Card>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <button onClick={fetchAndAnalyze} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em" }}>
          ↺ REFRESH INTELLIGENCE
        </button>
      </div>

      <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px", fontFamily: "var(--mono)", textAlign: "center", lineHeight: 1.65 }}>{rawData.disclaimer || "Intelligence sourced from live web search. Always verify against primary sources including SEC.gov."}</p>
    </div>
  );
}

/* ── MAIN ── */
export default function AlphaTerminal() {
  const [ticker, setTicker] = useState("");
  const [activeTab, setActiveTab] = useState("scorecard");
  const [scorecardData, setScorecardData] = useState(null);
  const [writeupData, setWriteupData] = useState(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [writeupLoading, setWriteupLoading] = useState(false);
  const [scorecardError, setScorecardError] = useState(null);
  const [writeupError, setWriteupError] = useState(null);
  const [history, setHistory] = useState([]);
  const [analyzedTicker, setAnalyzedTicker] = useState("");
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function callClaude(system, userMsg, maxTokens = 3000) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] }),
    });
    const raw = await res.json();
    const text = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
    if (s === -1) throw new Error("No JSON in response");
    return JSON.parse(cleaned.slice(s, e + 1));
  }

  async function analyze(t) {
    const raw = (t || ticker).trim();
    if (!raw) return;
    // If it looks like a ticker (1-5 caps/letters, no spaces), uppercase it
    // If it's a company name, keep original casing but pass as-is
    const isTicker = /^[A-Za-z]{1,5}$/.test(raw);
    const q = isTicker ? raw.toUpperCase() : raw;
    setTicker(q);
    setAnalyzedTicker(q);
    setScorecardData(null);
    setWriteupData(null);
    setScorecardError(null);
    setWriteupError(null);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    // Scorecard
    setScorecardLoading(true);
    callClaude(SCORECARD_PROMPT, `Analyze this company (ticker or name): ${q}. If given a company name, identify the correct ticker automatically.`, 2000)
      .then(d => { setScorecardData(d); setHistory(prev => [{ ticker: d.ticker || q, verdict: d.verdict }, ...prev.filter(h => h.ticker !== (d.ticker || q))].slice(0, 8)); })
      .catch(() => setScorecardError("Scorecard analysis failed."))
      .finally(() => setScorecardLoading(false));

    // Write-up
    setWriteupLoading(true);
    callClaude(WRITEUP_PROMPT, `Write a full IC investment memorandum for: ${q}. If given a company name, identify the correct ticker. Be specific with real figures.`, 4000)
      .then(d => setWriteupData(d))
      .catch(() => setWriteupError("Write-up generation failed."))
      .finally(() => setWriteupLoading(false));
  }

  const hasData = scorecardData || writeupData || scorecardLoading || writeupLoading;

  return (
    <div style={{ "--mono": "'IBM Plex Mono','Courier New',monospace", "--sans": "'IBM Plex Sans','Helvetica Neue',Arial,sans-serif", minHeight: "100vh", background: "#0C0C14", color: "#fff", fontFamily: "var(--sans)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "30px", height: "30px", background: "#34D399", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#0C0C14", fontSize: "15px", fontWeight: 700, fontFamily: "var(--mono)" }}>∆</span>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--mono)" }}>ALPHA TERMINAL</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>SCORECARD · IC MEMO · LIVE INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {INVESTORS.map(inv => <div key={inv.id} title={inv.name} style={{ width: "6px", height: "6px", borderRadius: "50%", background: inv.color, opacity: 0.7, boxShadow: `0 0 5px ${inv.color}` }} />)}
          <span style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "rgba(255,255,255,0.25)", marginLeft: "8px" }}>CLAUDE SONNET 4</span>
        </div>
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "44px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 700, lineHeight: 1.15, marginBottom: "10px", letterSpacing: "-0.02em" }}>Institutional Research Terminal</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", fontFamily: "var(--mono)" }}>Scorecard · IC Write-Up · SEC / 13F / Earnings Intelligence</p>
        </div>

        {/* Search */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "6px 6px 6px 20px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)", fontSize: "16px", fontWeight: 500 }}>$</span>
          <input ref={inputRef} value={ticker} onChange={e => setTicker(e.target.value)} onKeyDown={e => e.key === "Enter" && !(scorecardLoading||writeupLoading) && ticker.trim() && analyze()} placeholder="Ticker or company name — WAY, Nvidia, Waystar, Palantir…" style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: "15px", fontFamily: "var(--mono)", fontWeight: 500 }} />
          <button className="run-btn" onClick={() => analyze()} disabled={scorecardLoading || writeupLoading || !ticker.trim()} style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "11px 22px", borderRadius: "8px", cursor: scorecardLoading || writeupLoading || !ticker.trim() ? "not-allowed" : "pointer", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", transition: "all 0.2s", opacity: scorecardLoading || writeupLoading || !ticker.trim() ? 0.35 : 1, whiteSpace: "nowrap" }}>
            {scorecardLoading || writeupLoading ? "ANALYZING…" : "RUN →"}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "36px", justifyContent: "center" }}>
          {EXAMPLES.map(t => <button key={t} className="chip" onClick={() => !(scorecardLoading||writeupLoading) && analyze(t)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", transition: "all 0.15s" }}>{t}</button>)}
        </div>

        <div ref={resultsRef} />

        {/* Tabs */}
        {hasData && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "4px" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "11px 8px", borderRadius: "7px", border: "none", cursor: "pointer", background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent", transition: "all 0.2s" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>{tab.label}</div>
                <div style={{ fontSize: "10px", color: activeTab === tab.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)", fontFamily: "var(--mono)" }}>{tab.sub}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "scorecard" && (
          scorecardLoading ? <Spinner label="RUNNING 6-LENS SCORECARD" /> :
          scorecardError ? <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "14px 18px", color: "#F87171", fontFamily: "var(--mono)", fontSize: "13px" }}>{scorecardError}</div> :
          scorecardData ? <ScorecardTab data={scorecardData} /> : null
        )}

        {activeTab === "writeup" && (
          writeupLoading ? <Spinner label="GENERATING IC MEMORANDUM" /> :
          writeupError ? <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "14px 18px", color: "#F87171", fontFamily: "var(--mono)", fontSize: "13px" }}>{writeupError}<br/><button onClick={() => { setWriteupError(null); setWriteupLoading(true); callClaude(WRITEUP_PROMPT, `Write a full IC investment memorandum for: ${analyzedTicker}. Be specific with real figures.`, 4000).then(d => setWriteupData(d)).catch(() => setWriteupError("Write-up generation failed.")).finally(() => setWriteupLoading(false)); }} style={{marginTop:"12px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#F87171",padding:"8px 16px",borderRadius:"6px",cursor:"pointer",fontFamily:"var(--mono)",fontSize:"11px"}}>RETRY</button></div> :
          writeupData ? <WriteupTab data={writeupData} /> : null
        )}

        {activeTab === "intel" && analyzedTicker && (
          <IntelTab ticker={analyzedTicker} />
        )}

        {/* History */}
        {history.length > 1 && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)", marginBottom: "10px" }}>Recent</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {history.map(h => { const hv = VERDICT[h.verdict] || VERDICT.HOLD; return <button key={h.ticker} className="chip" onClick={() => !(scorecardLoading||writeupLoading) && analyze(h.ticker)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${hv.border}`, color: hv.color, padding: "5px 13px", borderRadius: "6px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", transition: "all 0.15s" }}>{h.ticker} · {h.verdict}</button>; })}
            </div>
          </div>
        )}

        {!hasData && (
          <div style={{ textAlign: "center", padding: "56px 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              {INVESTORS.map(inv => <div key={inv.id} style={{ width: "8px", height: "8px", borderRadius: "50%", background: inv.color, opacity: 0.2, boxShadow: `0 0 6px ${inv.color}` }} />)}
            </div>
            <div style={{ color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em" }}>ENTER A TICKER TO BEGIN</div>
          </div>
        )}
      </div>
    </div>
  );
}
