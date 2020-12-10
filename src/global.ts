/* eslint-disable no-unused-vars */
declare interface ResizeObserverEntry {
  target: HTMLElement | null
  contentRect: ResizeObserverEntry['target'] extends null? null : DOMRectReadOnly
}

declare class ResizeObserver {
  constructor (entries: (entries: ResizeObserverEntry[]) => void)
  observe (target: HTMLElement, options?: { box: 'border-box' | 'content-box' }): void
  unobserve (target: HTMLElement): void
  disconnect (): void
}

declare interface Window {
  ResizeObserver: typeof ResizeObserver
}
