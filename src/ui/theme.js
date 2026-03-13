import { THEMES } from '../data/constants.js'

const STORAGE_KEY = 'careeriq-theme'

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem(STORAGE_KEY, id)
  updateIcon(id)
  updateActiveOption(id)
}

function updateIcon(id) {
  const icon = document.getElementById('themeIcon')
  if (!icon) return
  const map = { dark: 'ph-moon', light: 'ph-sun', midnight: 'ph-moon-stars', slate: 'ph-circle-half' }
  icon.className = `ph ${map[id] ?? 'ph-moon'}`
}

function updateActiveOption(id) {
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.dataset.themeId === id)
  })
}

function buildMenu() {
  const wrap = document.getElementById('themeMenuWrap')
  if (!wrap) return

  const menu = document.createElement('div')
  menu.className = 'theme-menu'
  menu.id = 'themeMenu'
  menu.hidden = true

  THEMES.forEach(t => {
    const btn = document.createElement('button')
    btn.className = 'theme-option'
    btn.dataset.themeId = t.id
    btn.innerHTML = `<span class="theme-swatch" style="background:${t.swatch};border:1px solid rgba(255,255,255,0.15)"></span>${t.label}`
    btn.addEventListener('click', () => {
      applyTheme(t.id)
      menu.hidden = true
    })
    menu.appendChild(btn)
  })

  wrap.appendChild(menu)
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) ?? 'dark'
  applyTheme(saved)
  buildMenu()

  const toggle = document.getElementById('themeToggle')
  const menu = document.getElementById('themeMenu')

  toggle?.addEventListener('click', (e) => {
    e.stopPropagation()
    if (menu) menu.hidden = !menu.hidden
  })

  document.addEventListener('click', () => {
    if (menu) menu.hidden = true
  })
}
