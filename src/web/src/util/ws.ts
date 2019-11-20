import {Subject} from 'rxjs'

interface WSOptions {
  url?: string
  path?: string
  host?: string
  scheme?: string
}

export class WS {
  private url: string
  private socket?: WebSocket
  private message: Subject<any>
  private backoff: number = 100
  public opened: Subject<Event>
  public closed: Subject<CloseEvent>
  public error: Subject<Event>
  public connected: Subject<boolean>

  constructor(options: WSOptions) {
    if (options.url) {
      this.url = options.url
    } else {
      const path = options.path || ''
      const host = options.host || window.location.host
      const scheme = options.scheme || window.location.protocol === 'https:' ? 'wss' : 'ws'
      this.url = `${scheme}://${host}/${path}`
    }
    this.message = new Subject()
    this.opened = new Subject()
    this.closed = new Subject()
    this.error = new Subject()
    this.connected = new Subject()
  }

  public connect() {
    if (this.socket) {
      this.socket.close()
    }
    this.socket = new WebSocket(this.url)
    this.socket.addEventListener('message', (event) => this.message.next(event.data))
    this.socket.addEventListener('open', (event) => {
      this.backoff = 100
      this.opened.next(event)
      this.connected.next(true)
    })
    const retry = (event: CloseEvent) => {
      this.closed.next(event)
      if (event.code !== 1000) {
        this.connected.next(false)
        setTimeout(() => {
          this.connect()
        }, this.backoff)
        this.backoff *= 2
      }
    }
    this.socket.addEventListener('error', (event) => this.error.next(event))
    this.socket.addEventListener('close', retry)
  }
  public close() {
    this.socket.close()
  }
}
