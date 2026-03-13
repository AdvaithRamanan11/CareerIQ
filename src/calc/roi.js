export function stdMonthlyPayment(principal, annualRatePct, years = 10) {
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (r === 0) return Math.round(principal / n)
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
}

export function buildPayoffTimeline(principal, annualRatePct, monthlyPayment, maxYears = 30) {
  const monthlyRate = annualRatePct / 100 / 12
  let balance = principal
  const timeline = []
  let totalMonths = 0

  for (let yr = 1; yr <= maxYears && balance > 0; yr++) {
    for (let m = 0; m < 12 && balance > 0; m++) {
      balance += balance * monthlyRate
      balance -= monthlyPayment
      balance = Math.max(0, balance)
      totalMonths++
    }
    timeline.push({ year: yr, balance: Math.round(balance) })
    if (balance <= 0) break
  }

  return { timeline, totalMonths }
}

export function roiVerdict(paymentToDisposableRatio) {
  if (paymentToDisposableRatio <= 0.3) {
    return { level: 'positive', text: `Strong ROI — loan payment is ${Math.round(paymentToDisposableRatio * 100)}% of disposable income.` }
  }
  if (paymentToDisposableRatio <= 0.5) {
    return { level: 'warning', text: `Manageable — loan takes ${Math.round(paymentToDisposableRatio * 100)}% of disposable income. Tight but workable.` }
  }
  return { level: 'negative', text: `Strained — ${Math.round(paymentToDisposableRatio * 100)}% of disposable income goes to loans. Consider a lower-cost school.` }
}
