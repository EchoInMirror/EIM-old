import { addInstrument } from './components/pattern'
import { promises as fs } from 'fs'
import { parseArrayBuffer } from 'midi-json-parser'

type Note = [number, number, number, number]

let inited = false

export class EIM {
  constructor () {
    if (inited) throw new Error('!!!')
    inited = true
  }

  addInstrument () {
    const elm = addInstrument('钢琴')
    setTimeout(() => {
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
  }
}

const instance = new EIM()

export default instance
