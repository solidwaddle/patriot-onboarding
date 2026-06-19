import { useState, useMemo, useRef, Fragment } from 'react'
import LOGO from './assets/pfg-logo.png'



/* ---------- small UI primitives ---------- */
function Field({ label, optional, children, className = "" }) {
  return (
    <label className={"block " + className}>
      <span className="block text-[12px] font-semibold tracking-wide text-navy/80 mb-1.5">
        {label}{optional && <span className="text-slate-400 font-normal"> (optional)</span>}
      </span>
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-ink " +
  "outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15 placeholder:text-slate-400";

function SectionLabel({ children, className = "" }) {
  return (
    <div className={"flex items-center gap-3 mb-4 " + className}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-patriotred">{children}</span>
      <span className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Text(props) { return <input {...props} className={inputCls} />; }
function Area(props) { return <textarea {...props} className={inputCls + " resize-none"} rows={props.rows || 3} />; }
function Select({ children, ...p }) {
  return <select {...p} className={inputCls + " appearance-none bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat"}
    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath d='M5.5 7.5l4.5 4.5 4.5-4.5'/%3E%3C/svg%3E\")" }}>
    {children}
  </select>;
}

function Btn({ children, variant = "primary", className = "", ...p }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary: "bg-patriotred text-white hover:bg-patriotred-700 shadow-sm",
    navy: "bg-navy text-white hover:bg-navy-800 shadow-sm",
    ghost: "bg-white text-navy border border-slate-200 hover:bg-slate-50",
    subtle: "bg-slate-100 text-navy hover:bg-slate-200",
  };
  return <button {...p} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
}

const Icon = {
  arrowR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  shield: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>,
  upload: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/></svg>,
  file: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,
  plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>,
  chevron: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
};

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

/* ---------- step definitions ---------- */
const STEPS = [
  "Welcome", "Company", "Contact", "Billing", "Shipping",
  "Payment", "Credit", "Credit & Compliance", "Agreements", "Done"
];

/* =====================================================================
   ONBOARDING WIZARD
===================================================================== */
function Wizard({ goAdmin, goModel }) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState({
    legalName: "", dba: "", ein: "", website: "", industry: "", companyPhone: "",
    companyAddr: "", companyCity: "", companyState: "", companyZip: "", companyCountry: "United States",
    cFirst: "", cLast: "", cTitle: "", cEmail: "", cPhone: "", cMobile: "", prefContact: "Email",
    apName: "", apEmail: "", apPhone: "", billingAddr: "", billingSame: true,
    hasBillingApi: false, billingPlatform: "", techName: "", techEmail: "", techPhone: "",
    shipLocations: [{ id: 1, addr: "", city: "", state: "", zip: "", country: "United States" }],
    payMethod: "", creditLimit: "", annualRev: "", yearsInBiz: "", dnb: "",
    tradeRefs: [{ id: 1, company: "", contact: "", phone: "", email: "" }],
    docs: [],
    agreeCredit: false, agreeTerms: false, agreeComms: false,
    sigName: "", sigTitle: "", sigText: "", sigDate: "2026-06-12",
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  // conditional: credit step skipped when paying by card
  const skipCredit = data.payMethod === "Credit Card";
  // ordered list of "real" steps for the progress bar (excludes welcome & success)
  const flowSteps = useMemo(() => {
    const s = ["Company", "Contact", "Billing", "Shipping", "Payment"];
    if (!skipCredit) s.push("Credit");
    s.push("Credit & Compliance", "Agreements");
    return s;
  }, [skipCredit]);

  const next = () => setStep(s => {
    if (s === 5 && skipCredit) return 7;       // payment -> documents (skip credit)
    return Math.min(s + 1, 9);
  });
  const back = () => setStep(s => {
    if (s === 7 && skipCredit) return 5;       // documents -> payment (skip credit)
    return Math.max(s - 1, 0);
  });

  const saveLater = () => { setSaved(true); setTimeout(() => setSaved(false), 2600); };

  // progress %
  const currentLabel = STEPS[step];
  const progressIdx = flowSteps.indexOf(currentLabel);
  const pct = step === 0 ? 0 : step === 9 ? 100
    : Math.round(((progressIdx + 1) / (flowSteps.length + 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar goAdmin={goAdmin} goModel={goModel} onSave={step > 0 && step < 9 ? saveLater : null} saved={saved} />

      {/* hero band only on welcome & success */}
      {(step === 0 || step === 9) && <HeroBand step={step} data={data} />}

      {/* progress bar */}
      {step > 0 && step < 9 && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-semibold text-navy">
                Step {progressIdx + 1} of {flowSteps.length}
                <span className="text-slate-400 font-normal"> · {currentLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <Icon.clock /> ~{Math.max(1, flowSteps.length - progressIdx - 1)} min left
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-patriotred rounded-full transition-all duration-500" style={{ width: pct + "%" }} />
            </div>
            <div className="hidden sm:flex justify-between mt-2.5">
              {flowSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={"w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold " +
                    (i < progressIdx ? "bg-navy text-white" : i === progressIdx ? "bg-patriotred text-white ring-4 ring-patriotred/15" : "bg-slate-200 text-slate-500")}>
                    {i < progressIdx ? <Icon.check width="9" height="9" /> : i + 1}
                  </span>
                  <span className={"text-[11px] whitespace-nowrap " + (i === progressIdx ? "text-navy font-semibold" : "text-slate-400")}>{s === "Credit & Compliance" ? "Compliance" : s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* body */}
      <main className="flex-1">
        <div className={"mx-auto px-5 py-8 " + (step === 0 || step === 9 ? "max-w-2xl" : "max-w-3xl")}>
          <div key={step} className="fade-in">
            {step === 0 && <StepWelcome onBegin={() => setStep(1)} />}
            {step === 1 && <StepCompany d={data} set={set} />}
            {step === 2 && <StepContact d={data} set={set} />}
            {step === 3 && <StepBilling d={data} set={set} />}
            {step === 4 && <StepShipping d={data} set={set} />}
            {step === 5 && <StepPayment d={data} set={set} />}
            {step === 6 && <StepCredit d={data} set={set} />}
            {step === 7 && <StepDocs d={data} set={set} />}
            {step === 8 && <StepAgreements d={data} set={set} />}
            {step === 9 && <StepSuccess d={data} />}
          </div>

          {/* nav */}
          {step > 0 && step < 9 && (
            <div className="flex items-center justify-between mt-7">
              <Btn variant="ghost" onClick={back}><Icon.arrowL /> Back</Btn>
              <Btn variant="primary" onClick={next}>Next <Icon.arrowR /></Btn>
            </div>
          )}
          {step === 8 && (
            <div className="flex items-center justify-between mt-7">
              <Btn variant="ghost" onClick={back}><Icon.arrowL /> Back</Btn>
              <Btn variant="primary"
                disabled={!(data.agreeCredit && data.agreeTerms && data.agreeComms && data.sigName && data.sigText)}
                onClick={() => setStep(9)}>Submit Application <Icon.check width="15" height="15" /></Btn>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- top bar + hero + footer ---------- */
function TopBar({ goAdmin, goModel, onSave, saved }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <img src={LOGO} alt="Patriot Freight Group" className="h-7 sm:h-8" />
        <div className="flex items-center gap-2">
          {onSave && (
            <button onClick={onSave} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-navy hover:text-patriotred transition">
              {saved
                ? <><Icon.check width="14" height="14" /> Progress saved</>
                : <>Save &amp; continue later</>}
            </button>
          )}
          <button onClick={goModel} className="text-[12px] font-medium text-slate-400 hover:text-navy transition px-2">Data Model</button>
          <button onClick={goAdmin} className="text-[12px] font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition">Admin View</button>
        </div>
      </div>
    </header>
  );
}

function HeroBand({ step }) {
  return (
    <div className="bg-flag relative overflow-hidden">
      <div className="absolute -right-10 top-0 bottom-0 w-1/3 bg-patriotred/90"
           style={{ clipPath: "polygon(38% 0, 100% 0, 100% 100%, 0% 100%)" }} />
      <div className="max-w-2xl mx-auto px-5 py-10 relative">
        <div className="text-[11px] font-bold tracking-[0.18em] text-white/60 mb-2">
          {step === 0 ? "CUSTOMER ONBOARDING" : "SUBMISSION COMPLETE"}
        </div>
        <h1 className="text-white text-[26px] sm:text-[32px] font-extrabold leading-tight max-w-md">
          {step === 0 ? "Let's get your account set up." : "Thank you — you're all set."}
        </h1>
        <p className="text-white/70 text-[14px] mt-2 max-w-md">
          {step === 0
            ? "Patriot Freight Group is collecting a few details to activate your account and begin quoting and moving freight."
            : "Your application is in our queue. Our team will be in touch shortly."}
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-slate-400">
        <div className="flex items-center gap-1.5"><span className="text-navy"><Icon.shield /></span> Secured &amp; encrypted · 256-bit SSL</div>
        <div>© 2026 Patriot Freight Group · Need help? <span className="text-navy font-medium">onboarding@patriotfreight.com</span></div>
      </div>
    </footer>
  );
}

function Card({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8">
      {title && <div className="mb-6">
        <h2 className="text-[20px] sm:text-[22px] font-bold text-navy">{title}</h2>
        {sub && <p className="text-[14px] text-slate-500 mt-1">{sub}</p>}
      </div>}
      {children}
    </div>
  );
}

/* =====================  STEPS  ===================== */
function StepWelcome({ onBegin }) {
  const items = [
    ["Company & contact details", "Legal name, EIN, primary contact"],
    ["Billing & shipping", "AP contact and your locations"],
    ["Payment & credit", "Choose terms; credit app if needed"],
    ["Documents & e-signature", "W-9, agreements, and sign-off"],
  ];
  return (
    <Card>
      <div className="flex items-center gap-2 text-patriotred text-[13px] font-semibold mb-3">
        <Icon.clock /> Estimated completion time: 3–5 minutes
      </div>
      <h2 className="text-[22px] font-bold text-navy mb-1">Here's what we'll cover</h2>
      <p className="text-[14px] text-slate-500 mb-6">A short, guided setup. You can save and return anytime.</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {items.map(([t, s], i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-navy text-white flex items-center justify-center text-[13px] font-bold">{i + 1}</div>
            <div>
              <div className="text-[14px] font-semibold text-navy">{t}</div>
              <div className="text-[12px] text-slate-500">{s}</div>
            </div>
          </div>
        ))}
      </div>
      <Btn variant="primary" className="w-full sm:w-auto px-8 py-3" onClick={onBegin}>Begin Setup <Icon.arrowR /></Btn>
    </Card>
  );
}

function StepCompany({ d, set }) {
  return (
    <Card title="Tell us about your company" sub="This information activates your account and appears on shipping paperwork.">
      <SectionLabel>Legal</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Legal Company Name"><Text value={d.legalName} onChange={e => set("legalName", e.target.value)} placeholder="U.S. Parts Locators, Inc." /></Field>
        <Field label="DBA Name" optional><Text value={d.dba} onChange={e => set("dba", e.target.value)} placeholder="Trade name" /></Field>
        <Field label="HQ Address" className="sm:col-span-2"><Text value={d.companyAddr} onChange={e => set("companyAddr", e.target.value)} placeholder="Street address" /></Field>
        <Field label="City"><Text value={d.companyCity} onChange={e => set("companyCity", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="State"><Select value={d.companyState} onChange={e => set("companyState", e.target.value)}><option value="">—</option>{US_STATES.map(s => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="ZIP Code"><Text value={d.companyZip} onChange={e => set("companyZip", e.target.value)} /></Field>
        </div>
        <Field label="Country" className="sm:col-span-2"><Select value={d.companyCountry} onChange={e => set("companyCountry", e.target.value)}><option>United States</option><option>Canada</option><option>Mexico</option></Select></Field>
      </div>

      <SectionLabel className="mt-7">Business Details</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Website"><Text value={d.website} onChange={e => set("website", e.target.value)} placeholder="https://" /></Field>
        <Field label="Industry">
          <Select value={d.industry} onChange={e => set("industry", e.target.value)}>
            <option value="">Select industry…</option>
            {["Manufacturing","Automotive","Retail / E-commerce","Wholesale / Distribution","Construction","Food & Beverage","Industrial Equipment","Other"].map(x => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Company Phone Number" className="sm:col-span-2"><Text value={d.companyPhone} onChange={e => set("companyPhone", e.target.value)} placeholder="(555) 000-0000" /></Field>
      </div>
    </Card>
  );
}

function StepContact({ d, set }) {
  const methods = [["Email","Best for documents"],["Phone","Fastest response"],["Text","Quick updates"]];
  return (
    <Card title="Who should we work with?" sub="Your primary point of contact for quotes and shipments.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First Name"><Text value={d.cFirst} onChange={e => set("cFirst", e.target.value)} /></Field>
        <Field label="Last Name"><Text value={d.cLast} onChange={e => set("cLast", e.target.value)} /></Field>
        <Field label="Title" className="sm:col-span-2"><Text value={d.cTitle} onChange={e => set("cTitle", e.target.value)} placeholder="e.g. Logistics Manager" /></Field>
        <Field label="Email Address"><Text type="email" value={d.cEmail} onChange={e => set("cEmail", e.target.value)} placeholder="name@company.com" /></Field>
        <Field label="Phone Number"><Text value={d.cPhone} onChange={e => set("cPhone", e.target.value)} /></Field>
        <Field label="Mobile Number" optional><Text value={d.cMobile} onChange={e => set("cMobile", e.target.value)} /></Field>
      </div>
      <div className="mt-6">
        <span className="block text-[12px] font-semibold tracking-wide text-navy/80 mb-2">Preferred Contact Method</span>
        <div className="grid grid-cols-3 gap-3">
          {methods.map(([m, s]) => (
            <button key={m} onClick={() => set("prefContact", m)}
              className={"text-left rounded-xl border p-3.5 transition " +
                (d.prefContact === m ? "border-navy bg-navy/5 ring-2 ring-navy/15" : "border-slate-200 hover:border-slate-300")}>
              <div className="text-[14px] font-semibold text-navy">{m}</div>
              <div className="text-[11px] text-slate-500">{s}</div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function StepBilling({ d, set }) {
  return (
    <Card title="Billing information" sub="Where invoices go and who to reach in accounts payable.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="AP Contact Name"><Text value={d.apName} onChange={e => set("apName", e.target.value)} /></Field>
        <Field label="AP Email"><Text type="email" value={d.apEmail} onChange={e => set("apEmail", e.target.value)} placeholder="ap@company.com" /></Field>
        <Field label="AP Phone" className="sm:col-span-2"><Text value={d.apPhone} onChange={e => set("apPhone", e.target.value)} /></Field>
      </div>
      <label className="flex items-center gap-3 mt-5 mb-2 cursor-pointer select-none">
        <Check checked={d.billingSame} onChange={() => set("billingSame", !d.billingSame)} />
        <span className="text-[14px] text-navy font-medium">Billing address same as company address</span>
      </label>
      {!d.billingSame && (
        <Field label="Billing Address" className="mt-3 fade-in"><Area value={d.billingAddr} onChange={e => set("billingAddr", e.target.value)} placeholder="Street, City, State ZIP" /></Field>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
        <label className="flex items-start gap-3 p-4 cursor-pointer select-none hover:bg-slate-50/60 transition">
          <Check checked={d.hasBillingApi} onChange={() => set("hasBillingApi", !d.hasBillingApi)} />
          <div>
            <div className="text-[14px] font-semibold text-navy">Do you handle billing through an API or integration?</div>
            <div className="text-[12px] text-slate-500">If you use a billing platform or EDI, we can connect directly to automate invoicing.</div>
          </div>
        </label>
        {d.hasBillingApi && (
          <div className="px-4 pb-4 fade-in border-t border-slate-100 pt-4">
            <Field label="Billing Platform / System" className="mb-4"><Text value={d.billingPlatform} onChange={e => set("billingPlatform", e.target.value)} placeholder="e.g. Coupa, SAP Ariba, EDI, NetSuite" /></Field>
            <div className="text-[12px] font-semibold tracking-wide text-navy/80 mb-2.5">Technical Point of Contact</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name"><Text value={d.techName} onChange={e => set("techName", e.target.value)} /></Field>
              <Field label="Email"><Text type="email" value={d.techEmail} onChange={e => set("techEmail", e.target.value)} placeholder="it@company.com" /></Field>
              <Field label="Phone" className="sm:col-span-2"><Text value={d.techPhone} onChange={e => set("techPhone", e.target.value)} /></Field>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function StepShipping({ d, set }) {
  const [open, setOpen] = useState(1);
  const add = () => {
    const id = Date.now();
    set("shipLocations", [...d.shipLocations, { id, addr: "", city: "", state: "", zip: "", country: "United States" }]);
    setOpen(id);
  };
  const upd = (id, k, v) => set("shipLocations", d.shipLocations.map(l => l.id === id ? { ...l, [k]: v } : l));
  const rm = (id) => set("shipLocations", d.shipLocations.filter(l => l.id !== id));
  return (
    <Card title="Shipping locations" sub="Add every site we'll pick up from or deliver to.">
      <div className="space-y-3">
        {d.shipLocations.map((l, i) => {
          const isOpen = open === l.id;
          return (
            <div key={l.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setOpen(isOpen ? -1 : l.id)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50/70 hover:bg-slate-100 transition">
                <div className="flex items-center gap-3 text-left">
                  <span className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center text-[12px] font-bold">{i + 1}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-navy">{i === 0 ? "Primary Shipping Location" : `Location ${i + 1}`}</div>
                    <div className="text-[12px] text-slate-500">{l.addr ? `${l.addr}${l.city ? ", " + l.city : ""}` : "No address yet"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {i > 0 && <span onClick={(e) => { e.stopPropagation(); rm(l.id); }} className="p-1.5 text-slate-400 hover:text-patriotred rounded-md"><Icon.trash /></span>}
                  <Icon.chevron className={"text-slate-400 transition " + (isOpen ? "rotate-180" : "")} />
                </div>
              </button>
              {isOpen && (
                <div className="p-4 grid sm:grid-cols-2 gap-4 fade-in">
                  <Field label="Primary Shipping Address" className="sm:col-span-2"><Text value={l.addr} onChange={e => upd(l.id, "addr", e.target.value)} placeholder="Street address" /></Field>
                  <Field label="City"><Text value={l.city} onChange={e => upd(l.id, "city", e.target.value)} /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="State"><Select value={l.state} onChange={e => upd(l.id, "state", e.target.value)}><option value="">—</option>{US_STATES.map(s => <option key={s}>{s}</option>)}</Select></Field>
                    <Field label="ZIP"><Text value={l.zip} onChange={e => upd(l.id, "zip", e.target.value)} /></Field>
                  </div>
                  <Field label="Country" className="sm:col-span-2"><Select value={l.country} onChange={e => upd(l.id, "country", e.target.value)}><option>United States</option><option>Canada</option><option>Mexico</option></Select></Field>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={add} className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-patriotred transition">
        <span className="w-6 h-6 rounded-lg border-2 border-dashed border-current flex items-center justify-center"><Icon.plus /></span>
        Add additional location
      </button>
    </Card>
  );
}

function StepPayment({ d, set }) {
  const opts = [
    ["Credit Card", "Pay per shipment by card. No credit application required.", "Instant setup"],
    ["Net Terms", "Invoice now, pay later on approved terms. Credit review applies.", "Most flexible"],
  ];
  return (
    <Card title="How would you like to pay?" sub="You can change this later. Net Terms includes a quick credit review.">
      <div className="space-y-3">
        {opts.map(([m, desc, tag]) => (
          <button key={m} onClick={() => set("payMethod", m)}
            className={"w-full text-left rounded-xl border p-4 flex items-start gap-3.5 transition " +
              (d.payMethod === m ? "border-navy bg-navy/5 ring-2 ring-navy/15" : "border-slate-200 hover:border-slate-300")}>
            <span className={"mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 " +
              (d.payMethod === m ? "border-navy" : "border-slate-300")}>
              {d.payMethod === m && <span className="w-2.5 h-2.5 rounded-full bg-navy" />}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-navy">{m}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-patriotred bg-patriotred/10 rounded px-1.5 py-0.5">{tag}</span>
              </div>
              <div className="text-[13px] text-slate-500 mt-0.5">{desc}</div>
            </div>
          </button>
        ))}
      </div>
      {d.payMethod === "Credit Card" && (
        <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3.5 text-[13px] text-green-800 fade-in flex gap-2">
          <Icon.check width="16" height="16" /> No credit application needed — we'll skip ahead to documents.
        </div>
      )}
    </Card>
  );
}

function StepCredit({ d, set }) {
  const upd = (id, k, v) => set("tradeRefs", d.tradeRefs.map(r => r.id === id ? { ...r, [k]: v } : r));
  const add = () => set("tradeRefs", [...d.tradeRefs, { id: Date.now(), company: "", contact: "", phone: "", email: "" }]);
  const rm = (id) => set("tradeRefs", d.tradeRefs.filter(r => r.id !== id));
  return (
    <Card title="Credit application" sub="Required for Net Terms. Helps us set the right credit line.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Federal Tax ID (EIN)"><Text value={d.ein} onChange={e => set("ein", e.target.value)} placeholder="00-0000000" /></Field>
        <Field label="Requested Credit Limit"><Text value={d.creditLimit} onChange={e => set("creditLimit", e.target.value)} placeholder="$50,000" /></Field>
        <Field label="Annual Revenue"><Text value={d.annualRev} onChange={e => set("annualRev", e.target.value)} placeholder="$1,000,000+" /></Field>
        <Field label="Years In Business"><Text value={d.yearsInBiz} onChange={e => set("yearsInBiz", e.target.value)} /></Field>
        <Field label="D&B Number" optional className="sm:col-span-2"><Text value={d.dnb} onChange={e => set("dnb", e.target.value)} placeholder="DUNS #" /></Field>
      </div>
      <div className="mt-7 mb-3 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-navy">Trade References</div>
          <div className="text-[12px] text-slate-500">Optional, but they speed up approval.</div>
        </div>
      </div>
      <div className="space-y-3">
        {d.tradeRefs.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-slate-200 p-4 relative">
            {i > 0 && <button onClick={() => rm(r.id)} className="absolute top-3 right-3 text-slate-400 hover:text-patriotred"><Icon.trash /></button>}
            <div className="text-[12px] font-semibold text-slate-400 mb-3">Reference {i + 1}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company Name"><Text value={r.company} onChange={e => upd(r.id, "company", e.target.value)} /></Field>
              <Field label="Contact Name"><Text value={r.contact} onChange={e => upd(r.id, "contact", e.target.value)} /></Field>
              <Field label="Phone"><Text value={r.phone} onChange={e => upd(r.id, "phone", e.target.value)} /></Field>
              <Field label="Email"><Text value={r.email} onChange={e => upd(r.id, "email", e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-patriotred transition">
        <span className="w-6 h-6 rounded-lg border-2 border-dashed border-current flex items-center justify-center"><Icon.plus /></span>
        Add another reference
      </button>
    </Card>
  );
}

function UploadZone({ slot, title, desc, badge, badgeTone, d, set }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const files = d.docs.filter(f => f.slot === slot);
  const addFiles = (fileList) => {
    const list = Array.from(fileList).map(f => ({ id: Date.now() + Math.random(), slot, name: f.name, size: (f.size / 1024).toFixed(0) + " KB" }));
    set("docs", [...d.docs, ...list]);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };
  const rm = (id) => set("docs", d.docs.filter(x => x.id !== id));
  const tone = badgeTone === "required" ? "text-patriotred bg-patriotred/10"
    : badgeTone === "conditional" ? "text-amber-700 bg-amber-100"
    : "text-slate-500 bg-slate-100";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[14px] font-semibold text-navy">{title}</div>
        <span className={"text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 " + tone}>{badge}</span>
      </div>
      <p className="text-[12px] text-slate-500 mb-2.5">{desc}</p>
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={"rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition " +
          (drag ? "border-navy bg-navy/5" : "border-slate-300 hover:border-navy hover:bg-slate-50")}>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="w-10 h-10 mx-auto rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-2"><Icon.upload /></div>
        <div className="text-[14px] font-semibold text-navy">Drop file here or <span className="text-patriotred">browse</span></div>
        <div className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, or PNG · up to 25 MB</div>
      </div>
      {files.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5 fade-in">
              <div className="w-8 h-8 rounded-lg bg-patriotred/10 text-patriotred flex items-center justify-center"><Icon.file /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-navy truncate">{f.name}</div>
                <div className="text-[11px] text-slate-400">{f.size} · Uploaded</div>
              </div>
              <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1"><Icon.check width="12" height="12" /> Done</span>
              <button onClick={() => rm(f.id)} className="text-slate-300 hover:text-patriotred"><Icon.trash /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepDocs({ d, set }) {
  return (
    <Card title="Credit & Compliance" sub="Upload the documents we need to verify your business and set up your account.">
      <div className="space-y-6">
        <UploadZone slot="w9" title="Upload W-9" desc="Required for account setup and tax verification."
          badge="Required" badgeTone="required" d={d} set={set} />
        <UploadZone slot="credit" title="Upload Credit Application (if applicable)" desc="Required when requesting payment terms."
          badge="If applicable" badgeTone="conditional" d={d} set={set} />
        <UploadZone slot="additional" title="Upload Additional Supporting Documents" desc="Optional."
          badge="Optional" badgeTone="optional" d={d} set={set} />
      </div>
    </Card>
  );
}

function StepAgreements({ d, set }) {
  const agreements = [
    ["agreeCredit", "Credit Terms Agreement", "I agree to Patriot Freight Group's credit terms and payment schedule."],
    ["agreeTerms", "Terms & Conditions", "I have read and accept the Patriot Freight Group Terms & Conditions."],
    ["agreeComms", "Electronic Communications Consent", "I consent to receive invoices and notices electronically."],
  ];
  return (
    <Card title="Review & submit" sub="Confirm the agreements and sign to complete your application.">
      <div className="space-y-3">
        {agreements.map(([k, t, s]) => (
          <label key={k} className="flex gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-slate-300 transition">
            <Check checked={d[k]} onChange={() => set(k, !d[k])} />
            <div>
              <div className="text-[14px] font-semibold text-navy">{t}</div>
              <div className="text-[12px] text-slate-500">{s}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="text-[13px] font-semibold text-navy mb-4">Electronic Signature</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name"><Text value={d.sigName} onChange={e => set("sigName", e.target.value)} /></Field>
          <Field label="Title"><Text value={d.sigTitle} onChange={e => set("sigTitle", e.target.value)} /></Field>
        </div>
        <Field label="Signature" className="mt-4">
          <input value={d.sigText} onChange={e => set("sigText", e.target.value)} placeholder="Type your full name to sign"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: "22px", color: "#16245c" }} />
        </Field>
        <Field label="Date" className="mt-4 max-w-[200px]"><Text type="date" value={d.sigDate} onChange={e => set("sigDate", e.target.value)} /></Field>
      </div>
    </Card>
  );
}

function StepSuccess({ d }) {
  const steps = [
    ["Account Review", "We verify your company details"],
    ["Credit Review", d.payMethod === "Credit Card" ? "Not required — paying by card" : "We review your credit application"],
    ["Account Activation", "Your account goes live in Salesforce"],
    ["Welcome Email", "Login + rep introduction sent to you"],
  ];
  return (
    <Card>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
          <Icon.check width="32" height="32" />
        </div>
        <h2 className="text-[24px] font-bold text-navy">Thank you</h2>
        <p className="text-[14px] text-slate-500 mt-1">Your account setup has been submitted successfully.</p>
      </div>

      <div className="rounded-xl bg-navy text-white p-4 text-center mb-6">
        <div className="text-[11px] uppercase tracking-widest text-white/60">Application Number</div>
        <div className="text-[22px] font-extrabold tracking-wide mt-0.5">PFG-2026-000123</div>
      </div>

      <div className="text-[13px] font-semibold text-navy mb-3">Next steps</div>
      <div className="space-y-2.5 mb-6">
        {steps.map(([t, s], i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Icon.check width="14" height="14" /></span>
            <div><div className="text-[14px] font-semibold text-navy">{t}</div><div className="text-[12px] text-slate-500">{s}</div></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-6 justify-center">
        <Icon.clock /> Expected turnaround: <span className="font-semibold text-navy">1–2 business days</span>
      </div>

      <Btn variant="navy" className="w-full py-3" onClick={() => location.reload()}>Return to Website</Btn>
    </Card>
  );
}

function Check({ checked, onChange }) {
  return (
    <span onClick={onChange}
      className={"w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center cursor-pointer transition " +
        (checked ? "bg-navy border-navy text-white" : "border-slate-300 bg-white")}>
      {checked && <Icon.check width="12" height="12" />}
    </span>
  );
}

/* =====================================================================
   ADMIN DASHBOARD MOCKUP
===================================================================== */
function Admin({ back }) {
  const stats = [
    ["New Applications", "18", "+4 today", "text-navy"],
    ["Awaiting Credit Review", "7", "2 overdue", "text-amber-600"],
    ["Approved Accounts", "126", "+11 this week", "text-green-600"],
    ["Rejected Accounts", "4", "this month", "text-patriotred"],
    ["Avg. Processing Time", "1.4d", "↓ 0.3d", "text-navy"],
  ];
  const rows = [
    ["PFG-2026-000123", "U.S. Parts Locators", "Net Terms", "Credit Review", "amber"],
    ["PFG-2026-000122", "Atlas Manufacturing", "Net Terms", "Under Review", "blue"],
    ["PFG-2026-000121", "Coastal Retail Co.", "Credit Card", "Approved", "green"],
    ["PFG-2026-000120", "Midwest Distributors", "Net Terms", "Submitted", "slate"],
    ["PFG-2026-000119", "Vertex Industrial", "Net Terms", "Activated", "green"],
    ["PFG-2026-000118", "Harbor Foods LLC", "Net Terms", "Rejected", "red"],
  ];
  const badge = { amber: "bg-amber-100 text-amber-700", blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700", slate: "bg-slate-100 text-slate-600", red: "bg-red-100 text-patriotred" };
  return (
    <div className="min-h-screen">
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="PFG" className="h-7 bg-white rounded px-2 py-1" />
            <span className="text-[14px] font-semibold text-white/80 border-l border-white/20 pl-3">Onboarding Admin</span>
          </div>
          <button onClick={back} className="text-[13px] font-semibold bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition">← Back to portal</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <h1 className="text-[22px] font-bold text-navy mb-1">Customer Onboarding Pipeline</h1>
        <p className="text-[14px] text-slate-500 mb-6">Live view of applications flowing in from the portal into Salesforce.</p>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
          {stats.map(([t, v, sub, color]) => (
            <div key={t} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="text-[12px] text-slate-500">{t}</div>
              <div className={"text-[28px] font-extrabold mt-1 " + color}>{v}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[15px] font-semibold text-navy">Recent Applications</div>
            <div className="text-[12px] text-slate-400">Synced with Salesforce · 2 min ago</div>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase tracking-wide">
                <th className="px-5 py-2.5 font-semibold">Application #</th>
                <th className="px-5 py-2.5 font-semibold">Company</th>
                <th className="px-5 py-2.5 font-semibold">Payment</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
                <th className="px-5 py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-[12px] text-navy">{r[0]}</td>
                  <td className="px-5 py-3 font-semibold text-navy">{r[1]}</td>
                  <td className="px-5 py-3 text-slate-600">{r[2]}</td>
                  <td className="px-5 py-3"><span className={"text-[11px] font-semibold rounded-full px-2.5 py-1 " + badge[r[4]]}>{r[3]}</span></td>
                  <td className="px-5 py-3 text-right"><button className="text-[12px] font-semibold text-navy hover:text-patriotred">Open →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   SALESFORCE DATA MODEL VIEW
===================================================================== */
function DataModel({ back }) {
  const stages = ["Draft", "Submitted", "Under Review", "Credit Review", "Approved", "Rejected", "Activated"];
  const related = [
    ["Account", "Created on activation. Mirrors company info.", "1:1"],
    ["Contacts", "Primary + AP contacts.", "1:many"],
    ["Billing Information", "AP details & billing address.", "1:1"],
    ["Credit Request", "Limit, revenue, trade refs.", "1:1"],
    ["Uploaded Documents", "W-9, agreements as Files.", "1:many"],
  ];
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <img src={LOGO} alt="PFG" className="h-7" />
          <button onClick={back} className="text-[13px] font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5">← Back to portal</button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-[22px] font-bold text-navy mb-1">Salesforce Data Model</h1>
        <p className="text-[14px] text-slate-500 mb-7">How the portal maps onto Salesforce objects and lifecycle stages.</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="text-[12px] font-bold uppercase tracking-wide text-patriotred mb-3">Primary Object</div>
          <div className="text-[18px] font-bold text-navy mb-1">Customer_Onboarding_Application__c</div>
          <p className="text-[13px] text-slate-500 mb-5">One record per submission. Drives the pipeline status field.</p>
          <div className="flex flex-wrap items-center gap-2">
            {stages.map((s, i) => (
              <Fragment key={s}>
                <span className={"text-[12px] font-semibold rounded-lg px-3 py-1.5 " +
                  (s === "Rejected" ? "bg-red-100 text-patriotred" : s === "Activated" || s === "Approved" ? "bg-green-100 text-green-700" : "bg-navy/10 text-navy")}>{s}</span>
                {i < stages.length - 1 && s !== "Rejected" && <span className="text-slate-300">→</span>}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="text-[12px] font-bold uppercase tracking-wide text-slate-400 mb-3">Related Records</div>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {related.map(([t, s, rel]) => (
            <div key={t} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold text-navy">{t}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{s}</div>
              </div>
              <span className="text-[10px] font-bold text-navy bg-navy/10 rounded px-2 py-1 shrink-0">{rel}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-navy text-white/90 p-6">
          <div className="text-[13px] font-semibold text-white mb-2">Flow summary</div>
          <p className="text-[13px] leading-relaxed text-white/70">
            Portal writes a <span className="text-white font-medium">Draft</span> application (auto-saved on "save &amp; continue later").
            On submit → <span className="text-white font-medium">Submitted</span>, triggering an approval process. Net-Terms applicants hit
            <span className="text-white font-medium"> Credit Review</span>; card customers skip it. On approval, a flow creates the <span className="text-white font-medium">Account</span>,
            <span className="text-white font-medium"> Contacts</span>, and billing/credit child records, then sets status to <span className="text-white font-medium">Activated</span> and fires the welcome email.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   ROOT
===================================================================== */
function App() {
  const [view, setView] = useState("wizard");
  if (view === "admin") return <Admin back={() => setView("wizard")} />;
  if (view === "model") return <DataModel back={() => setView("wizard")} />;
  return <Wizard goAdmin={() => setView("admin")} goModel={() => setView("model")} />;
}

export default App;