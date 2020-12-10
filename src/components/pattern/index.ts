import './index.less'
import '../../global'
import Window, { FULLSCREEN_BUTTON, MAIN_ELEMENT } from '../window'
import Keyboard from '../keyboard'

export type InstrumentElement = HTMLLIElement & {
  patternElement: HTMLLIElement
  editButtonElement: HTMLButtonElement
  dragHandleElement: HTMLDivElement
}

let editModeInstrument: InstrumentElement | null = null

const patternWindow = document.getElementById('pattern-window')! as Window
const body = patternWindow.querySelector('.body')! as HTMLDivElement
const instruments = body.querySelector('.instruments')! as HTMLOListElement
const patterns = body.querySelector('.patterns')! as HTMLUListElement
const blocks = body.querySelector('.blocks')! as HTMLUListElement
const keyboard = patternWindow.querySelector('eim-keyboard')! as Keyboard
const scrollBar = patternWindow.querySelector('.scroll-bar')! as HTMLDivElement

scrollBar.ondrag = e => {
  if (!editModeInstrument || body.clientHeight <= e.clientY - (scrollBar as any).startY + scrollBar.clientHeight + 10) {
    e.stopPropagation()
    return
  }
  const r = scrollBar.offsetTop / body.clientHeight
  keyboard.scrollTop = keyboard.clientHeight * r
  editModeInstrument.patternElement.scrollTop = keyboard.clientHeight * r
}

const fullscreenButton = FULLSCREEN_BUTTON.cloneNode() as HTMLButtonElement
patternWindow.buttonsElement.insertBefore(fullscreenButton, patternWindow.buttonsElement.firstChild)
fullscreenButton.onclick = () => {
  patternWindow.style.left = '0'
  patternWindow.style.top = '0'
  blocks.style.height = (MAIN_ELEMENT.offsetHeight - 40) + 'px'
  blocks.style.width = window.innerWidth + 'px'
  if (editModeInstrument) setTimeout(() => editModeInstrument && (blocks.scrollTop = editModeInstrument.offsetTop - 40), 20)
}

new window.ResizeObserver(([it]) => {
  const value = it.contentRect.height + 'px'
  instruments.style.height = value
}).observe(blocks)
blocks.onscroll = () => {
  instruments.scrollTop = blocks.scrollTop
}

instruments.ondrag = e => {
  if (e.x === 0 && e.y === 0) return
  const target = e.target as HTMLElement
  if (target?.className !== 'drag-handle') return
  const parent = target.parentElement! as InstrumentElement
  const value = e.clientY - (target as any).startY
  if (value < 60) {
    e.stopPropagation()
    return
  }
  parent.style.height = value + 'px'
  parent.patternElement.style.height = value + 'px'
}

const observer = new window.ResizeObserver(([it]) => {
  const value = it.contentRect.height + 'px'
  if (!editModeInstrument) return
  editModeInstrument.dragHandleElement.style.top = value
  editModeInstrument.patternElement.style.height = value
  editModeInstrument.style.height = value
})
observer.observe(blocks)

export const editMode = (instrument: InstrumentElement) => {
  if (editModeInstrument === instrument) {
    editModeInstrument = null
    instrument.editButtonElement.classList.remove('text-primary-color')
    blocks.style.overflowY = ''
    instrument.dragHandleElement.style.top = '60px'
    instrument.patternElement.style.height = '60px'
    instrument.style.height = '60px'
    scrollBar.style.display = 'none'
    keyboard.style.display = 'none'
    return
  }
  instrument.editButtonElement.classList.add('text-primary-color')
  const value = Math.max(500, patternWindow.offsetHeight - 40) + 'px'
  blocks.style.height = value
  instrument.dragHandleElement.style.top = value
  instrument.patternElement.style.height = value
  instrument.style.height = value
  instrument.patternElement.innerHTML += `<svg width="100%" height="3250">
  <rect fill="url(#editor-grid-y)" x="0" y="0" width="2496000" height="3240" />
</svg>`
  blocks.scrollTop = instrument.offsetTop
  blocks.style.overflowY = 'hidden'
  keyboard.style.top = instrument.offsetTop + 'px'
  keyboard.style.display = ''
  scrollBar.style.display = ''
  editModeInstrument = instrument
}

instruments.onclick = e => {
  const target = e.target as HTMLButtonElement
  switch (target.dataset.buttonFunction) {
    case 'edit':
      editMode(target.parentNode!.parentNode as InstrumentElement)
      break
  }
}

export const addInstrument = (name: string) => {
  const li = document.createElement('li') as InstrumentElement
  li.innerHTML = `<div class="avatar">${name[0]}</div> <span contenteditable="true">${name}</span> <div class="buttons">
    <button class="md circle small"><i class="material-icons">volume_off</i></button>
    <button class="md circle small" data-button-function="edit"><i class="material-icons">edit</i></button>
  </div>
  <div class="drag-handle" draggable="true" data-disable-x="true"></div>`
  li.patternElement = document.createElement('li')
  li.editButtonElement = li.querySelector('[data-button-function=edit]') as HTMLButtonElement
  li.dragHandleElement = li.lastElementChild as HTMLDivElement
  instruments.appendChild(li)
  patterns.appendChild(li.patternElement)
  return li
}

addInstrument('钢琴')
addInstrument('钢琴')
const elm = addInstrument('钢琴')
addInstrument('钢琴')
addInstrument('钢琴')
setTimeout(editMode, 200, elm)
