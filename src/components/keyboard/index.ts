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
    const replace = document.createElement('div')
    replace.className = 'eim-keyboard'
    this.classList.forEach(it => replace.classList.add(it))
    while (all-- > 0) {
      const container = document.createElement('div')
      container.append(
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b b1'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b b2'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b b3'),
        createNoteElement(i++, 'w divider'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b b4'),
        createNoteElement(i++, 'w'),
        createNoteElement(i++, 'b b5'),
        createNoteElement(i++, 'w')
      )
      replace.appendChild(container)
    }
    this.replaceWith(replace)
  }
}

window.customElements.define('eim-keyboard', Keyboard)
