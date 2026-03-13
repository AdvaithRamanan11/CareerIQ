import { initTheme }          from './ui/theme.js'
import { initTabs }           from './ui/tabs.js'
import { populateColleges, populateMajors, populateJobs, buildStateGrid } from './ui/forms.js'
import { predictSalary, fmt, getTier } from './calc/salary.js'
import { applyMultipliers }   from './calc/multipliers.js'
import { stdMonthlyPayment, buildPayoffTimeline, roiVerdict } from './calc/roi.js'
import { ROI_LOAN_DEFAULTS, ROI_EXPENSE_DEFAULTS, FEDERAL_LOAN_RATE, STATE_MULTIPLIERS, JOB_INCOME, TIER_PREMIUMS } from './data/constants.js'
import { fetchWages, searchOccupations } from './api/careeronestop.js'
import { cached } from './api/cache.js'

initTheme()
initTabs()

populateColleges('p-college', 'c-college1', 'c-college2', 'r-college', 'w-college', 'n-college', 'e-college')
populateMajors('p-major', 'c-major', 'r-major', 'w-major', 'n-major', 'e-major')

const $ = id => document.getElementById(id)
const show = (el, visible = true) => { if (el) el.hidden = !visible }
const val  = id => $(id)?.value ?? ''

// Maps app job titles → exact BLS occupation titles accepted by CareerOneStop
const JOB_TO_BLS = {
  // Engineering
  "Software Engineer":    "Software Developers",
  "Mechanical Engineer":  "Mechanical Engineers",
  "Electrical Engineer":  "Electrical Engineers",
  "Civil Engineer":       "Civil Engineers",
  "Chemical Engineer":    "Chemical Engineers",
  // Computer Science
  "Data Scientist":       "Data Scientists",
  "Systems Architect":    "Software Developers",
  "Database Administrator":"Database Administrators",
  "Web Developer":        "Web Developers",
  // Business
  "Investment Banker":    "Financial Managers",
  "Management Consultant":"Management Analysts",
  "Financial Analyst":    "Financial Analysts",
  "Marketing Manager":    "Marketing Managers",
  "Business Analyst":     "Management Analysts",
  // Healthcare
  "Physician":            "Physicians, Pathologists",
  "Surgeon":              "Surgeons, All Other",
  "Nurse Practitioner":   "Nurse Practitioners",
  "Medical Researcher":   "Medical Scientists, Except Epidemiologists",
  "Pharmacist":           "Pharmacists",
  // Law
  "Corporate Lawyer":     "Lawyers",
  "Public Defender":      "Lawyers",
  "Family Lawyer":        "Lawyers",
  "Patent Lawyer":        "Lawyers",
  "Litigation Lawyer":    "Lawyers",
}

function setLoading(elId, loading) {
  const el = $(elId)
  if (!el) return
  el.style.opacity = loading ? '0.4' : '1'
  el.style.pointerEvents = loading ? 'none' : ''
}

function setDataBadge(live) {
  const badge = document.querySelector('.data-badge')
  if (!badge) return
  if (live) {
    badge.innerHTML = `<i class="ph ph-circle-wavy-check"></i> LIVE BLS 2024`
    badge.style.color = 'var(--positive)'
  } else {
    badge.innerHTML = `<i class="ph ph-clock-clockwise"></i> STATIC ESTIMATE`
    badge.style.color = 'var(--text-muted)'
  }
}

function wireJobDropdown(majorId, jobId, ...callbacks) {
  $(majorId)?.addEventListener('change', () => {
    populateJobs(majorId, jobId)
    callbacks.forEach(cb => cb())
  })
}

async function getWagesForJob(job, location = 'tx') {
  if (!job) return null
  const blsTitle = JOB_TO_BLS[job]
  if (!blsTitle) return null
  try {
    return await cached(`wages:${blsTitle}:${location}`, () => fetchWages(blsTitle, location))
  } catch (err) {
    console.warn('CareerOneStop unavailable, using static fallback:', err.message)
    return null
  }
}

function tierPremium(college) {
  const tier = getTier(college)
  return TIER_PREMIUMS[tier] ?? 1.0
}

function salaryFromWages(wages, exp) {
  if (!wages?.state && !wages?.national) return null
  const w = wages.state ?? wages.national
  const map = {
    entry:                w.p25,
    initial_experienced:  Math.round((w.p25 + w.median) / 2),
    experienced:          w.median,
    veteran:              w.p75,
  }
  return map[exp] ?? w.median
}

// ── Predict ──────────────────────────────────────────────────────────────────

async function runPredict() {
  const college = val('p-college')
  const major   = val('p-major')
  const job     = val('p-job')
  const area    = val('p-area')
  const exp     = val('p-exp')
  if (!college || !major || !job || !area || !exp) return

  setLoading('predictResult', true)
  show($('predictResult'))

  const wages  = await getWagesForJob(job, 'tx')
  const live   = salaryFromWages(wages, exp)
  const areaMulti = { urban: 1.12, suburban: 1.0, rural: 0.88 }[area] ?? 1
  let annual

  if (live) {
    annual = Math.round(live * areaMulti * tierPremium(college))
    $('predictContext').textContent = `${college} · ${major} · ${job} · ${area} · ${exp.replace('_', ' ')} — live BLS data`
    setDataBadge(true)
  } else {
    const result = predictSalary(college, major, job, area, exp)
    if (!result) { setLoading('predictResult', false); return }
    annual = result.annual
    $('predictContext').textContent = `${college} · ${major} · ${job} · ${area} · ${exp.replace('_', ' ')} — estimated`
    setDataBadge(false)
  }

  $('predictAmount').textContent  = fmt(annual)
  $('predictMonthly').textContent = fmt(Math.round(annual / 12))
  $('predictWeekly').textContent  = fmt(Math.round(annual / 52))
  $('predictHourly').textContent  = '$' + Math.round(annual / 2080)
  setLoading('predictResult', false)
}

wireJobDropdown('p-major', 'p-job', runPredict)
;['p-college', 'p-job', 'p-area', 'p-exp'].forEach(id => $(id)?.addEventListener('change', runPredict))

// ── Compare ───────────────────────────────────────────────────────────────────

async function runCompare() {
  const c1    = val('c-college1')
  const c2    = val('c-college2')
  const major = val('c-major')
  const job   = val('c-job')
  const area  = val('c-area')
  const exp   = val('c-exp')
  if (!c1 || !c2 || !major || !job || !area || !exp) return

  const wages = await getWagesForJob(job, 'tx')
  const live  = salaryFromWages(wages, exp)
  const areaMulti = { urban: 1.12, suburban: 1.0, rural: 0.88 }[area] ?? 1

  const getSalary = (college) => {
    if (live) return Math.round(live * areaMulti * tierPremium(college))
    const r = predictSalary(college, major, job, area, exp)
    return r?.annual ?? 0
  }

  const s1 = getSalary(c1)
  const s2 = getSalary(c2)
  if (!s1 || !s2) return

  const r1 = { tier: getTier(c1), annual: s1 }
  const r2 = { tier: getTier(c2), annual: s2 }

  const diff    = r1.annual - r2.annual
  const diffPct = Math.round(Math.abs(diff) / Math.min(r1.annual, r2.annual) * 100)

  show($('compareResult'))
  $('compareNameA').textContent   = c1
  $('compareTierA').textContent   = r1.tier
  $('compareSalaryA').textContent = fmt(r1.annual)
  $('compareNameB').textContent   = c2
  $('compareTierB').textContent   = r2.tier
  $('compareSalaryB').textContent = fmt(r2.annual)

  const colA = $('compareColA'), colB = $('compareColB')
  const badgeA = $('compareBadgeA'), badgeB = $('compareBadgeB')
  colA.className = 'compare-col'; colB.className = 'compare-col'

  if (diff > 0) {
    colA.classList.add('winner'); colB.classList.add('loser')
    badgeA.textContent = `+${diffPct}% higher`; badgeA.className = 'compare-badge pos'
    badgeB.textContent = `-${diffPct}% lower`;  badgeB.className = 'compare-badge neg'
  } else if (diff < 0) {
    colB.classList.add('winner'); colA.classList.add('loser')
    badgeB.textContent = `+${diffPct}% higher`; badgeB.className = 'compare-badge pos'
    badgeA.textContent = `-${diffPct}% lower`;  badgeA.className = 'compare-badge neg'
  } else {
    badgeA.textContent = 'Equal'; badgeA.className = 'compare-badge neu'
    badgeB.textContent = 'Equal'; badgeB.className = 'compare-badge neu'
  }

  const l1 = fmt(r1.annual * 30), l2 = fmt(r2.annual * 30)
  const winner = diff > 0 ? c1 : diff < 0 ? c2 : null
  $('compareLifetime').innerHTML =
    `<span style="color:var(--text)">${c1}</span> — ${l1} over 30 years<br>` +
    `<span style="color:var(--text)">${c2}</span> — ${l2} over 30 years<br>` +
    (winner ? `<span style="color:var(--accent)">${winner} earns ${fmt(Math.abs(diff) * 30)} more over a career.</span>` : '')
}

wireJobDropdown('c-major', 'c-job', runCompare)
;['c-college1', 'c-college2', 'c-job', 'c-area', 'c-exp'].forEach(id => $(id)?.addEventListener('change', runCompare))

// ── ROI ───────────────────────────────────────────────────────────────────────

function roiAutoFill() {
  const college = val('r-college')
  const area    = val('r-area')
  if (!college || !area) return
  const tier = getTier(college)
  if (!tier) return
  const loan = ROI_LOAN_DEFAULTS[tier]
  const exp  = ROI_EXPENSE_DEFAULTS[area]
  $('r-loan').value     = loan.amount
  $('r-interest').value = FEDERAL_LOAN_RATE
  $('r-expenses').value = exp.amount
  $('roiLoanHint').textContent     = loan.hint
  $('roiExpensesHint').textContent = exp.hint
  $('r-stdpayment').value = stdMonthlyPayment(loan.amount, FEDERAL_LOAN_RATE, 10)
  show($('roiEstimatesCard'))
}

async function runROI() {
  const college  = val('r-college')
  const major    = val('r-major')
  const job      = val('r-job')
  const area     = val('r-area')
  const exp      = val('r-exp')
  const loan     = parseFloat($('r-loan')?.value) || 0
  const rate     = parseFloat($('r-interest')?.value) || 0
  const expenses = parseFloat($('r-expenses')?.value) || 0
  if (!college || !major || !job || !area || !exp || !loan) return

  const wages  = await getWagesForJob(job, 'tx')
  const live   = salaryFromWages(wages, exp)
  const areaMulti = { urban: 1.12, suburban: 1.0, rural: 0.88 }[area] ?? 1

  let annual
  if (live) {
    annual = Math.round(live * areaMulti * tierPremium(college))
  } else {
    const result = predictSalary(college, major, job, area, exp)
    if (!result) return
    annual = result.annual
  }

  const takeHome   = Math.round(annual / 12 * 0.72)
  const disposable = takeHome - expenses
  const payment    = stdMonthlyPayment(loan, rate, 10)

  show($('roiResult'))
  $('roiSalary').textContent    = fmt(annual)
  $('roiTakehome').textContent  = fmt(takeHome)
  $('roiDisposable').innerHTML  = `<span style="color:var(--${disposable >= 0 ? 'positive' : 'negative'})">${fmt(disposable)}</span>`

  if (disposable <= 0 || disposable < payment) {
    $('roiPayoff').textContent = 'N/A'
    $('roiVerdict').innerHTML  = `<span style="color:var(--negative)">Salary may not comfortably cover the $${payment.toLocaleString()}/mo standard payment after living expenses.</span>`
    $('roiBar').style.width    = '0%'
    $('roiPct').textContent    = '0%'
    $('roiTimeline').innerHTML = ''
    return
  }

  const { timeline, totalMonths } = buildPayoffTimeline(loan, rate, payment)
  const years  = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  $('roiPayoff').textContent = years > 0 ? `${years}y ${months}m` : `${totalMonths}mo`

  const lastBalance = timeline[timeline.length - 1]?.balance ?? 0
  const pct = Math.min(100, Math.round((1 - lastBalance / loan) * 100))
  $('roiBar').style.width = pct + '%'
  $('roiPct').textContent = pct + '%'

  const verdict = roiVerdict(payment / disposable)
  const colorMap = { positive: 'var(--positive)', warning: 'var(--warning)', negative: 'var(--negative)' }
  $('roiVerdict').innerHTML = `<span style="color:${colorMap[verdict.level]}">${verdict.text}</span>`

  $('roiTimeline').innerHTML = timeline.slice(0, 15).map(t => {
    const barW = Math.max(0, Math.round(t.balance / loan * 100))
    return `<div class="timeline-row">
      <span class="timeline-year">Year ${t.year}</span>
      <div class="timeline-track"><div class="timeline-bar" style="width:${barW}%"></div></div>
      <span class="timeline-balance">${t.balance > 0 ? fmt(t.balance) : '$0'}</span>
      <span class="timeline-done">${t.balance <= 0 ? 'Paid off' : ''}</span>
    </div>`
  }).join('')
}

;['r-college', 'r-area'].forEach(id => $(id)?.addEventListener('change', () => { roiAutoFill(); runROI() }))
wireJobDropdown('r-major', 'r-job', runROI)
;['r-job', 'r-exp'].forEach(id => $(id)?.addEventListener('change', runROI))
;['r-loan', 'r-interest', 'r-expenses'].forEach(id => $(id)?.addEventListener('input', runROI))

// ── What-If ────────────────────────────────────────────────────────────────────

const WHATIF_SCENARIOS = [
  { label: 'Entry · Urban',          area: 'urban',    exp: 'entry' },
  { label: 'Entry · Suburban',       area: 'suburban', exp: 'entry' },
  { label: 'Entry · Rural',          area: 'rural',    exp: 'entry' },
  { label: 'Experienced · Urban',    area: 'urban',    exp: 'experienced' },
  { label: 'Experienced · Suburban', area: 'suburban', exp: 'experienced' },
  { label: 'Veteran · Urban',        area: 'urban',    exp: 'veteran' },
  { label: 'Veteran · Suburban',     area: 'suburban', exp: 'veteran' },
  { label: 'Veteran · Rural',        area: 'rural',    exp: 'veteran' },
]

async function runWhatIf() {
  const college = val('w-college')
  const major   = val('w-major')
  const job     = val('w-job')
  const area    = val('w-area')
  if (!college || !major || !job || !area) return

  const wages = await getWagesForJob(job, 'tx')
  const areaMultipliers = { urban: 1.12, suburban: 1.0, rural: 0.88 }

  function getSalary(s) {
    if (wages) {
      const live = salaryFromWages(wages, s.exp)
      if (live) return Math.round(live * (areaMultipliers[s.area] ?? 1) * tierPremium(college))
    }
    const tier = getTier(college)
    const base = JOB_INCOME[tier]?.[major]?.[job]
    if (!base) return 0
    return applyMultipliers(base, major, s.area, s.exp)
  }

  const baseline = getSalary({ area: 'urban', exp: 'entry' })
  if (!baseline) return

  show($('whatifResult'))
  $('whatifGrid').innerHTML = WHATIF_SCENARIOS.map(s => {
    const sal     = getSalary(s)
    const diff    = sal - baseline
    const diffPct = Math.round(Math.abs(diff) / baseline * 100)
    const cls     = diff > 0 ? 'pos' : diff < 0 ? 'neg' : 'neu'
    const sign    = diff > 0 ? '+' : diff < 0 ? '-' : ''
    return `<div class="whatif-card">
      <div class="whatif-scenario">${s.label}</div>
      <div class="whatif-amount">${fmt(sal)}</div>
      <div class="whatif-change ${cls}">${sign}${diffPct}% vs entry baseline</div>
    </div>`
  }).join('')
}

wireJobDropdown('w-major', 'w-job', runWhatIf)
;['w-college', 'w-job', 'w-area'].forEach(id => $(id)?.addEventListener('change', runWhatIf))

// ── National ──────────────────────────────────────────────────────────────────

let selectedState = STATE_MULTIPLIERS.find(s => s.abbr === 'TX')

buildStateGrid('stateGrid', s => {
  selectedState = s
  show($('nationalCalc'))
})

wireJobDropdown('n-major', 'n-job')

window.calcNational = async function () {
  if (!selectedState) return
  const job = val('n-job')
  const exp = val('n-exp')
  const area = val('n-area')
  if (!job || !exp || !area) return

  const locationMap = { CA: 'ca', NY: 'ny', WA: 'wa', MA: 'ma', CO: 'co', TX: 'tx', GA: 'ga', FL: 'fl', AZ: 'az', OH: 'oh', TN: 'tn', MS: 'ms' }
  const loc    = locationMap[selectedState.abbr] ?? 'tx'
  const wages  = await getWagesForJob(job, loc)
  const live   = salaryFromWages(wages, exp)
  const areaMulti = { urban: 1.12, suburban: 1.0, rural: 0.88 }[area] ?? 1

  let adj, txBase
  if (live) {
    adj    = Math.round(live * areaMulti)
    const txWages = await getWagesForJob(job, 'tx')
    const txLive  = salaryFromWages(txWages, exp)
    txBase = txLive ? Math.round(txLive * areaMulti) : adj
  } else {
    const result = predictSalary(val('n-college'), val('n-major'), job, area, exp)
    if (!result) return
    txBase = result.annual
    adj    = Math.round(txBase * selectedState.mult)
  }

  const diff = adj - txBase
  show($('natResult'))
  $('natLabel').textContent  = `Estimated Salary in ${selectedState.name}`
  $('natAmount').textContent = fmt(adj)
  $('natSub').textContent    = `TX base: ${fmt(txBase)} · ${diff >= 0 ? '+' : ''}${fmt(diff)}`
}

// ── Export ────────────────────────────────────────────────────────────────────

window.buildExport = async function () {
  const college = val('e-college')
  const major   = val('e-major')
  const job     = val('e-job')
  const area    = val('e-area')
  const exp     = val('e-exp')
  if (!college || !major || !job || !area || !exp) return

  const wages  = await getWagesForJob(job, 'tx')
  const live   = salaryFromWages(wages, exp)
  const areaMulti = { urban: 1.12, suburban: 1.0, rural: 0.88 }[area] ?? 1

  let annual, source
  if (live) {
    annual = Math.round(live * areaMulti * tierPremium(college))
    source = 'BLS / CareerOneStop live data'
  } else {
    const result = predictSalary(college, major, job, area, exp)
    if (!result) return
    annual = result.annual
    source = 'Estimated (static model)'
  }

  const tier = getTier(college)
  const rows = [
    { k: 'College',        v: college },
    { k: 'Tier',           v: tier },
    { k: 'Major',          v: major },
    { k: 'Job Title',      v: job },
    { k: 'Area',           v: area[0].toUpperCase() + area.slice(1) },
    { k: 'Experience',     v: exp.replace('_', ' ') },
    { k: 'Monthly (est.)', v: fmt(Math.round(annual / 12)) },
    { k: 'Hourly (est.)',  v: '$' + Math.round(annual / 2080) },
    { k: 'Data Source',    v: source },
  ]

  show($('exportPreview'))
  $('exportDate').textContent   = `Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · TXCareerIQ`
  $('exportAmount').textContent = fmt(annual)
  $('exportRows').innerHTML     = rows.map(r =>
    `<div class="export-row"><span class="export-key">${r.k}</span><span class="export-val">${r.v}</span></div>`
  ).join('')
}

wireJobDropdown('e-major', 'e-job', buildExport)
;['e-college', 'e-job', 'e-area', 'e-exp'].forEach(id => $(id)?.addEventListener('change', buildExport))
