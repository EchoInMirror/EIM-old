const main = document.querySelector('main')!

const emptyImage = new Image()

const getTarget = (e: DragEvent) => {
  let target = e.target as HTMLElement | null
  if (target?.getAttribute('draggable') !== 'true') return
  if (target.dataset.dragParent === 'true') target = target.parentElement
  return target === main || !target ? undefined : target
}
main.ondragstart = e => {
  const target = getTarget(e)
  if (!target) return
  e.dataTransfer?.setDragImage(emptyImage, 0, 0)
  const targetA: any = target
  targetA.startX = e.clientX - target.offsetLeft
  targetA.startY = e.clientY - target.offsetTop
}
main.ondrag = e => {
  if (!e.x && !e.y) return
  const target: any = getTarget(e)
  if (!target) return
  e.preventDefault()
  if (target.dataset.disableX !== 'true') target.style.left = (e.clientX - target.startX) + 'px'
  if (target.dataset.disableY !== 'true') {
    const y = e.clientY - target.startY
    if (target.dataset.limitY != null && y < +target.dataset.limitY) return
    target.style.top = y + 'px'
  }
}
main.ondragenter = main.ondragover = e => e.preventDefault()
