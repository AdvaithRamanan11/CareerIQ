export function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn')
  const panels  = document.querySelectorAll('.tab-panel')

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab

      buttons.forEach(b => {
        b.classList.toggle('active', b === btn)
        b.setAttribute('aria-selected', b === btn)
      })

      panels.forEach(p => {
        const active = p.id === `tab-${target}`
        p.hidden = !active
        if (active) p.classList.add('tab-panel')
      })
    })
  })
}
