import './index.less'
import '../../global'
import Window, { FULLSCREEN_BUTTON, MAIN_ELEMENT } from '../window'
import { promises as fs } from 'fs'
import { parseArrayBuffer } from 'midi-json-parser'

export type InstrumentElement = HTMLLIElement & {
  patternElement: HTMLLIElement
  editButtonElement: HTMLButtonElement
  dragHandleElement: HTMLDivElement
  notesElement: HTMLDivElement
}

const gridY = document.importNode(document.getElementById('template-grid-y') as HTMLTemplateElement, true).content.firstElementChild as SVGElement

let editModeInstrument: InstrumentElement | null = null

const patternWindow = document.getElementById('pattern-window')! as Window
const body = patternWindow.querySelector('.body')! as HTMLDivElement
const instruments = body.querySelector('.instruments')! as HTMLOListElement
const patterns = body.querySelector('.patterns')! as HTMLUListElement
const blocks = body.querySelector('.blocks')! as HTMLUListElement
const keyboard = patternWindow.querySelector('.keyboard')! as HTMLDivElement
const eimKeyboard = keyboard.firstChild! as HTMLDivElement
const scrollBar = patternWindow.querySelector('.scroll-bar')! as HTMLDivElement

let ratioY = 1

const resizeY = (it: number) => {
  if (it > 1) return
  ratioY = it
  const t = `scaleY(${it})`
  eimKeyboard.style.transform = t
  gridY.style.transform = t
  if (editModeInstrument) editModeInstrument.notesElement.style.transform = t
}

let isScrollByJs = false

scrollBar.ondrag = e => {
  if (!editModeInstrument || body.clientHeight <= e.clientY - (scrollBar as any).startY + scrollBar.clientHeight + 10) {
    e.stopPropagation()
    return
  }
  const r = (2940 * ratioY - body.clientHeight) * (scrollBar.offsetTop / (body.clientHeight - scrollBar.clientHeight))
  isScrollByJs = true
  keyboard.scrollTop = r
  editModeInstrument.patternElement.scrollTop = r
}

new window.ResizeObserver(([it]) => {
  if (!editModeInstrument) return
  resizeY(70 / it.contentRect.height)
}).observe(scrollBar)

let isFullscreen = false

const fullscreenButton = FULLSCREEN_BUTTON.cloneNode() as HTMLButtonElement
patternWindow.buttonsElement.insertBefore(fullscreenButton, patternWindow.buttonsElement.firstChild)
fullscreenButton.onclick = () => {
  isFullscreen = !isFullscreen
  if (isFullscreen) {
    fullscreenButton.classList.add('sub')
    patternWindow.style.left = '0'
    patternWindow.style.top = '0'
    blocks.style.height = (MAIN_ELEMENT.offsetHeight - 40) + 'px'
    blocks.style.width = window.innerWidth + 'px'
    if (editModeInstrument) setTimeout(() => editModeInstrument && (blocks.scrollTop = editModeInstrument.offsetTop), 20)
  } else {
    fullscreenButton.classList.remove('sub')
    blocks.style.height = '500px'
    blocks.style.width = '600px'
  }
}

new window.ResizeObserver(([it]) => {
  instruments.style.height = it.contentRect.height + 'px'
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
  if (!editModeInstrument) parent.notesElement.style.transform = `scaleY(${parent.clientHeight / 2940})`
}

new window.ResizeObserver(([it]) => {
  if (!editModeInstrument) return
  const value = it.contentRect.height + 'px'
  editModeInstrument.dragHandleElement.style.top = value
  editModeInstrument.patternElement.style.height = value
  editModeInstrument.style.height = value
}).observe(blocks)

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
    instrument.notesElement.style.transform = `scaleY(${instrument.clientHeight / 2940})`
    instrument.patternElement.onscroll = null
    gridY.remove()
    return
  }
  instrument.editButtonElement.classList.add('text-primary-color')
  const value = Math.max(500, patternWindow.offsetHeight - 40) + 'px'
  blocks.style.height = value
  instrument.dragHandleElement.style.top = value
  instrument.patternElement.style.height = value
  instrument.style.height = value
  instrument.notesElement.style.transform = `scaleY(${ratioY})`
  instrument.patternElement.insertBefore(gridY, instrument.notesElement)
  blocks.scrollTop = instrument.offsetTop
  blocks.style.overflowY = 'hidden'
  keyboard.style.top = instrument.offsetTop + 'px'
  keyboard.style.display = ''
  scrollBar.style.display = ''
  editModeInstrument = instrument
  instrument.patternElement.onscroll = e => {
    if (isScrollByJs) {
      isScrollByJs = false
      return
    }
    scrollBar.style.top = (instrument.patternElement.scrollTop / 2940 / ratioY * body.clientHeight) + 'px'
    keyboard.scrollTop = instrument.patternElement.scrollTop
  }
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
  li.notesElement = document.createElement('div')
  li.patternElement.appendChild(li.notesElement)
  li.editButtonElement = li.querySelector('[data-button-function=edit]') as HTMLButtonElement
  li.dragHandleElement = li.lastElementChild as HTMLDivElement
  instruments.appendChild(li)
  patterns.appendChild(li.patternElement)
  return li
}

type Note = [number, number, number, number]

addInstrument('钢琴')
addInstrument('钢琴')
const elm = addInstrument('钢琴')
addInstrument('钢琴')
addInstrument('钢琴')
setTimeout((it: InstrumentElement) => {
  editMode(it)
  resizeY(0.5)
  fs.readFile('C:\\Users\\Shirasawa\\Desktop\\GGGG.mid').then(it => parseArrayBuffer(it.buffer)).then(data => {
    const track = data.tracks[1]
    if (!track) return
    let time = 0
    const noteMap: Record<number, number | null> = { }
    const notes: Note[] = []
    track.forEach(n => {
      time += n.delta
      if (n.noteOn) {
        // eslint-disable-next-line no-undef
        const note = n as import('midi-json-parser-worker').IMidiNoteOnEvent
        if (noteMap[note.noteOn.noteNumber] != null) return
        noteMap[note.noteOn.noteNumber] = notes.push([time, time, note.noteOn.noteNumber, note.noteOn.velocity]) - 1
      } else if (n.noteOff) {
        // eslint-disable-next-line no-undef
        const note = n as import('midi-json-parser-worker').IMidiNoteOffEvent
        const id = noteMap[note.noteOff.noteNumber]
        if (id == null) return
        notes[id][1] = time
        noteMap[note.noteOff.noteNumber] = null
      }
    })
    notes.forEach(([start, end, id, velocity]) => {
      const note = document.createElement('div')
      note.style.left = start + 'px'
      note.style.width = (end - start) + 'px'
      note.style.bottom = (id * 24.5) + 'px'
      note.style.filter = `brightness(${0.3 + velocity / 127 * 0.7})`
      elm.notesElement.appendChild(note)
    })
  })
}, 200, elm)
