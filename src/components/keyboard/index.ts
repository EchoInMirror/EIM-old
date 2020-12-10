import './index.less'

export type NoteElement = HTMLDivElement & {
  note: number
}

const createNoteElement = (note: number, className: string) => {
  const elm = document.createElement('div') as NoteElement
  elm.note = note
  elm.className = className
  return elm
}

export default class Keyboard extends HTMLElement {
  constructor () {
    super()
    let all = +this.getAttribute('octave-count')! || 10
    let i = 0
    while (all-- > 0) {
      const container = document.createElement('div')
      container.append(
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b'),
        createNoteElement(i++, 'w divider'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b'),
        createNoteElement(i++, 'w')
      )
      this.appendChild(container)
    }
  }
}

window.customElements.define('eim-keyboard', Keyboard)
