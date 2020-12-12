document.addEventListener('click', e => {
  let btn = e.target as (HTMLButtonElement | null)
  if (!btn) return
  if (!btn.classList.contains('md')) btn = btn.parentElement as (HTMLButtonElement | null)
  if (!btn?.classList.contains('md') || btn.tagName !== 'BUTTON') return
  const wave = document.createElement('div')
  wave.className = 'wave'
  const btnHeight = btn.clientHeight
  const btnWidth = btn.clientWidth
  const top = e.offsetY / btn.clientHeight * 100
  const left = e.offsetX / btn.clientWidth * 100
  wave.style.top = top + '%'
  wave.style.left = left + '%'
  wave.style.transition = '.15s cubic-bezier(0.4, 0, 0.2, 1)'
  btn.insertBefore(wave, btn.firstElementChild)
  setTimeout(() => {
    wave.style.height = btnHeight * 2 + 'px'
    wave.style.width = btnWidth * 2 + 'px'
    wave.style.opacity = '0.14'
  }, 20)
  setTimeout(() => wave.remove(), 300)
})
