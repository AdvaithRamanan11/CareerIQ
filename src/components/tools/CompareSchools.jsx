import { useMemo } from 'react'
import { useStore } from '../../store/useStore.js'
import { MAJORS, AREA_MULTIPLIERS, EXPERIENCE_MULTIPLIERS, REGIONS } from '../../data/salaries.js'
import { compareSchools, calculateLoan, estimateTaxes, formatCurrency, formatPct, ANNUAL_WAGE_GROWTH } from '../../lib/calculations.js'
import { useState } from 'react'
import { COLLEGES, INCOME_BRACKETS } from '../../data/colleges.js'
import CollegeSearch from '../ui/CollegeSearch.jsx'
import Select from '../ui/Select.jsx'

const AREA_OPTIONS = Object.keys(AREA_MULTIPLIERS).map(a => ({ value: a, label: a }))
const REGION_OPTIONS = REGIONS
const EXP_OPTIONS  = Object.keys(EXPERIENCE_MULTIPLIERS).map(e => ({ value: e, label: e }))
const INCOME_OPTIONS = INCOME_BRACKETS.map(b => ({ value: b.key, label: b.label }))

export default function CompareSchools() {
  const { major, setMajor, job, setJob, area, setArea, region, setRegion, experience, setExperience, incomeKey, setIncomeKey } = useStore()
  const [schoolA, setSchoolA] = useState(null)
  const [schoolB, setSchoolB] = useState(null)

  const majorObj = MAJORS.find(m => m.id === major)
  const jobObj   = majorObj?.jobs.find(j => j.id === job)

  const majorOptions = MAJORS.map(m => ({ value: m.id, label: m.name }))
  const jobOptions   = majorObj?.jobs.map(j => ({ value: j.id, label: j.title })) ?? []

  const result = useMemo(() =>
    compareSchools({ collegeA: schoolA, collegeB: schoolB, job: jobObj, area, experience, region }),
    [schoolA, schoolB, jobObj, area, experience, region]
  )

  // Per-school loan estimates (same math as the Loan Estimator tool, same
  // shared family-income bracket from the store).
  const loanA = useMemo(() => calculateLoan({ college: schoolA, incomeKey }), [schoolA, incomeKey])
  const loanB = useMemo(() => calculateLoan({ college: schoolB, incomeKey }), [schoolB, incomeKey])

  // Loan payment as a share of estimated monthly take-home pay (after taxes).
  const pctOfTakeHome = (salary, loan) => {
    if (!salary || !loan) return null
    const takeHomeMonthly = (salary - estimateTaxes(salary).totalTax) / 12
    return takeHomeMonthly > 0 ? (loan.monthlyPayment / takeHomeMonthly) * 100 : null
  }

  const winner = result ? (result.salaryA >= result.salaryB ? 'A' : 'B') : null
  const debtWinner = (loanA && loanB)
    ? (loanA.totalLoan4Year <= loanB.totalLoan4Year ? 'A' : 'B')
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Syne', sans-serif" }}>Compare Schools</h2>
        <p className="text-gray-500 text-sm mt-1">Side-by-side salary and lifetime earnings for any two U.S. colleges.</p>
      </div>

      {/* Shared inputs */}
      <div className="grid gap-4">
        <Select label="Major" value={major} onChange={v => { setMajor(v) }} options={majorOptions} placeholder="Select a major" />
        {major && <Select label="Job Title" value={job} onChange={setJob} options={jobOptions} placeholder="Select a job title" />}
        <Select label="Where do you plan to work?" value={region} onChange={setRegion} options={REGION_OPTIONS} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Area of Work" value={area} onChange={setArea} options={AREA_OPTIONS} />
          <Select label="Experience" value={experience} onChange={setExperience} options={EXP_OPTIONS} />
        </div>
        <Select
          label="Family Income Bracket (for loan estimate)"
          value={incomeKey}
          onChange={setIncomeKey}
          options={INCOME_OPTIONS}
        />
      </div>

      {/* School pickers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">School A</p>
          <CollegeSearch value={schoolA} onChange={setSchoolA} label="" />
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">School B</p>
          <CollegeSearch value={schoolB} onChange={setSchoolB} label="" />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4 animate-fade-up">
          {/* Salary comparison */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { school: schoolA, salary: result.salaryA, lifetime: result.lifetimeA, side: 'A' },
              { school: schoolB, salary: result.salaryB, lifetime: result.lifetimeB, side: 'B' },
            ].map(({ school, salary, lifetime, side }) => (
              <div
                key={side}
                className={`rounded-2xl p-5 border-2 transition-all ${
                  winner === side
                    ? 'bg-gradient-to-br from-teal-500 to-teal-700 border-teal-400 text-white'
                    : 'bg-white border-gray-100'
                }`}
              >
                {winner === side && (
                  <div className="text-xs font-bold uppercase tracking-widest text-teal-200 mb-2">Higher earning</div>
                )}
                <div className="text-xs font-medium text-gray-400 mb-1 truncate" style={{ color: winner === side ? 'rgba(255,255,255,0.7)' : undefined }}>
                  {school?.name}
                </div>
                <div className={`text-3xl font-black mb-1 ${winner === side ? 'text-white' : 'text-gray-800'}`}>
                  {formatCurrency(salary)}
                </div>
                <div className={`text-xs ${winner === side ? 'text-teal-100' : 'text-gray-500'}`}>Annual est. salary</div>
                <div className={`mt-3 pt-3 border-t ${winner === side ? 'border-teal-400' : 'border-gray-100'}`}>
                  <div className={`text-sm font-bold ${winner === side ? 'text-white' : 'text-gray-700'}`}>{formatCurrency(lifetime, true)}</div>
                  <div className={`text-xs ${winner === side ? 'text-teal-100' : 'text-gray-500'}`}>
                    {side === 'A' ? result.yearsA ?? 30 : result.yearsB ?? 30}-yr lifetime earnings
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Debt comparison */}
          {(loanA && loanB) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 mt-1">Estimated Debt</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { school: schoolA, loan: loanA, salary: result.salaryA, side: 'A' },
                  { school: schoolB, loan: loanB, salary: result.salaryB, side: 'B' },
                ].map(({ school, loan, salary, side }) => {
                  const pct = pctOfTakeHome(salary, loan)
                  return (
                    <div
                      key={side}
                      className={`rounded-2xl p-5 border-2 transition-all ${
                        debtWinner === side
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-400 text-white'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      {debtWinner === side && (
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">Lower debt</div>
                      )}
                      <div className="text-xs font-medium mb-1 truncate" style={{ color: debtWinner === side ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                        {school?.name}
                      </div>
                      <div className={`text-3xl font-black mb-1 ${debtWinner === side ? 'text-white' : 'text-gray-800'}`}>
                        {formatCurrency(loan.totalLoan4Year)}
                      </div>
                      <div className={`text-xs ${debtWinner === side ? 'text-emerald-100' : 'text-gray-500'}`}>
                        Est. borrowed over {loan.programYears} years
                      </div>
                      <div className={`mt-3 pt-3 border-t space-y-1 ${debtWinner === side ? 'border-emerald-400' : 'border-gray-100'}`}>
                        <div className={`text-sm font-bold ${debtWinner === side ? 'text-white' : 'text-gray-700'}`}>
                          {formatCurrency(loan.monthlyPayment)}/mo
                        </div>
                        <div className={`text-xs ${debtWinner === side ? 'text-emerald-100' : 'text-gray-500'}`}>
                          10-yr repayment at {(loan.blendedRate * 100).toFixed(2)}%
                        </div>
                        {pct != null && (
                          <div className={`text-xs ${debtWinner === side ? 'text-emerald-100' : 'text-gray-500'}`}>
                            ≈ {pct.toFixed(0)}% of est. monthly take-home pay
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Loan estimate assumes the full net price for your selected family income bracket is borrowed
                (federal Direct Loans up to the cap, then PLUS) — the same model as the Loan Estimator tool.
                A common guideline is keeping student loan payments under ~10% of take-home pay.
              </p>
            </div>
          )}

          {/* Delta summary */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-black text-gray-800">{formatPct(result.pctDiff)}</div>
            <div className="text-sm text-gray-500 mt-1">salary difference between schools</div>
            <div className="text-xs text-gray-400 mt-2">
              {formatCurrency(Math.abs(result.lifetimeDiff))} lifetime earnings gap
            </div>
            <div className="text-xs text-gray-300 mt-1">
              Assumes {(ANNUAL_WAGE_GROWTH * 100).toFixed(1)}% annual wage growth (BLS ECI 10-yr avg)
            </div>
          </div>

          {/* 2-year vs 4-year note */}
          {(result.yearsA !== result.yearsB) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700">
              <p className="font-semibold text-amber-800 mb-1">⏱ Different program lengths</p>
              <p>
                One school is a 2-year community college and one is a 4-year institution.
                Lifetime earnings are projected over <strong>{result.yearsA} years</strong> and <strong>{result.yearsB} years</strong> respectively
                to reflect the same career endpoint — community college grads enter the workforce 2 years earlier.
                The debt estimates above also reflect each school's program length (2 years of borrowing vs. 4).
              </p>
            </div>
          )}

          {/* Interpretation note */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-600 text-sm">How to interpret this comparison</p>
            <p>The salary difference shows which school's graduates tend to earn more in this career — but a higher-earning school almost always costs more too. The real question is whether the salary premium is worth the extra debt.</p>
            <p><span className="font-semibold text-gray-600">Lifetime earnings</span> projects your total income over a career assuming a {(ANNUAL_WAGE_GROWTH * 100).toFixed(1)}% annual raise each year. The gap looks large because small annual differences compound significantly over decades — the same reason interest on a loan adds up.</p>
            <p><span className="font-semibold text-gray-600">Estimated debt</span> shows what you'd borrow at each school based on its net price for your selected family income bracket, and what that costs monthly over a standard 10-year repayment. Put the salary gap and the debt gap side by side: a school that earns you {formatCurrency(Math.abs(result.salaryA - result.salaryB))} more per year but costs {loanA && loanB ? formatCurrency(Math.abs(loanA.totalLoan4Year - loanB.totalLoan4Year)) : 'more'} extra in loans may or may not be the better deal — that tradeoff is the decision.</p>
            <p className="text-gray-400">For educational illustration only. Salary projections are national estimates and do not account for individual performance, employer, or economic conditions. Debt estimates assume the full net price is borrowed; family savings, scholarships beyond reported aid, or work income would lower actual borrowing.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">⇄</div>
          <p className="text-gray-500 text-sm">Select two schools, a major, and job title to compare.</p>
        </div>
      )}

      <div className="text-xs text-gray-500 border-t pt-4 space-y-2">
        <p>BLS OES · College Scorecard · IPEDS · For educational purposes only.</p>
        <details>
          <summary className="cursor-pointer font-medium text-gray-500 hover:text-gray-700 transition-colors">
            ℹ How salary and lifetime earnings are calculated
          </summary>
          <div className="mt-2 bg-gray-50 rounded-xl p-3 space-y-1 text-gray-500 leading-relaxed">
            <p>
              <span className="font-semibold">Salary estimate:</span> BLS national mean wage for the selected
              job title, adjusted by each college's earnings multiplier (from College Scorecard median earnings
              10 years after entry), location, and experience level.
            </p>
            <p>
              <span className="font-semibold">30-year lifetime earnings:</span> Calculated as the sum of a
              geometric series assuming a {(ANNUAL_WAGE_GROWTH * 100).toFixed(1)}% annual wage growth rate
              (BLS Employment Cost Index 10-year average), starting from the estimated salary. This is more
              realistic than a flat projection because it accounts for raises and cost-of-living adjustments
              over a career.
            </p>
            <p className="text-gray-400 pt-1">
              For educational illustration only. Actual earnings depend on many individual factors.
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
