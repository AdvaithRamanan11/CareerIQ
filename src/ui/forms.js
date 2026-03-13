import { COLLEGES, JOB_INCOME, MAJORS, STATE_MULTIPLIERS } from '../data/constants.js'

export function populateColleges(...ids) {
  ids.forEach(id => {
    const sel = document.getElementById(id)
    if (!sel) return
    const placeholder = sel.options[0]
    sel.innerHTML = ''
    sel.appendChild(placeholder)
    for (const [tier, list] of Object.entries(COLLEGES)) {
      const group = document.createElement('optgroup')
      group.label = tier
      list.forEach(name => {
        const opt = document.createElement('option')
        opt.value = name
        opt.textContent = name
        group.appendChild(opt)
      })
      sel.appendChild(group)
    }
  })
}

export function populateMajors(...ids) {
  ids.forEach(id => {
    const sel = document.getElementById(id)
    if (!sel) return
    const placeholder = sel.options[0]
    sel.innerHTML = ''
    sel.appendChild(placeholder)
    MAJORS.forEach(m => {
      const opt = document.createElement('option')
      opt.value = m
      opt.textContent = m
      sel.appendChild(opt)
    })
  })
}

export function populateJobs(majorId, jobId) {
  const major = document.getElementById(majorId)?.value
  const sel   = document.getElementById(jobId)
  if (!major || !sel) return
  const placeholder = sel.options[0]
  sel.innerHTML = ''
  sel.appendChild(placeholder)
  const jobs = JOB_INCOME['Level 4 (Very High Tier)'][major]
  if (!jobs) return
  Object.keys(jobs).forEach(title => {
    const opt = document.createElement('option')
    opt.value = title
    opt.textContent = title
    sel.appendChild(opt)
  })
}

export function buildStateGrid(containerId, onSelect) {
  const container = document.getElementById(containerId)
  if (!container) return

  STATE_MULTIPLIERS.forEach(s => {
    const card = document.createElement('div')
    card.className = 'state-card' + (s.abbr === 'TX' ? ' active' : '')
    card.innerHTML = `
      <div class="state-name">${s.abbr}</div>
      <div class="state-mult">${s.mult.toFixed(2)}x</div>
      <div class="state-note">${s.note}</div>
    `
    card.addEventListener('click', () => {
      container.querySelectorAll('.state-card').forEach(c => c.classList.remove('active'))
      card.classList.add('active')
      onSelect(s)
    })
    container.appendChild(card)
  })
}
