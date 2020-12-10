import './index.less'

export const MAIN_ELEMENT = document.querySelector('main')! as HTMLDivElement

const template = (document.getElementById('template-window') as HTMLTemplateElement)

export const FULLSCREEN_BUTTON = document.createElement('button')
FULLSCREEN_BUTTON.className = 'circle-button success plus'

export default class Window extends HTMLElement {
  #title = ''
  #titleElement: HTMLSpanElement

  public readonly buttonsElement: HTMLDivElement

  public get title () { return this.#title }
  public set title (it) {
    this.#title = it
    this.#titleElement.innerText = it
  }

  constructor () {
    super()
    template.classList.forEach(it => this.classList.add(it))
    const elm = document.importNode(template.content, true)
    this.#titleElement = elm.querySelector('.title')!.querySelector('span') as HTMLSpanElement
    this.title = this.getAttribute('title') || ''
    this.buttonsElement = elm.querySelector('.buttons')! as HTMLDivElement
    const closeBtn = elm.querySelector('.close')! as HTMLButtonElement
    elm.querySelector('.body')!.append(...this.children)
    closeBtn.onclick = console.log
    this.dataset.limitY = '10'
    this.append(elm)
  }
}

window.customElements.define('eim-window', Window)
