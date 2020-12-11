const svg = document.getElementById('definition-svg')!

const elm = svg.querySelector('#editor-grid-y') as SVGPatternElement

;[1, 3, 5, 8, 10].forEach(it => {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('fill', '#00000015')
  rect.setAttribute('width', '80')
  rect.setAttribute('height', '24')
  rect.setAttribute('x', '0')
  rect.setAttribute('y', (it * 24.5).toString())
  elm.appendChild(rect)
})
