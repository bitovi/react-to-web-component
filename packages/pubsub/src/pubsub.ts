type ChannelListeners = { __listeners: Array<Listener<BaseMessage>> }
type ChannelFragments = { [topic: string]: Channel | undefined }
type Channel = ChannelListeners & ChannelFragments

type Unsubscribe = () => void

export type Topic = string[]
export type Listener<Message extends BaseMessage> = (message: Message) => void
export type BaseMessage = { type: string }

const symbol = Symbol.for("r2wc.pubsub")

declare global {
  interface Window {
    [symbol]: Channel
  }
}

function createChannel(): Channel {
  return { __listeners: [] } as unknown as Channel
}

export const subscribe = <Message extends BaseMessage>(
  topic: Topic,
  listener?: Listener<Message>,
): Unsubscribe | undefined => {
  if (!listener) return

  if (!window[symbol]) {
    window[symbol] = createChannel()
  }

  let channel: Channel = window[symbol]

  for (const fragment of topic) {
    if (!channel[fragment]) channel[fragment] = createChannel()
    channel = channel[fragment] as Channel
  }

  channel.__listeners.push(listener as Listener<BaseMessage>)

  return () => {
    const index = channel.__listeners.indexOf(listener as Listener<BaseMessage>)
    if (index > -1) {
      channel.__listeners.splice(index, 1)
    }
  }
}

export const publish = <Message extends BaseMessage>(
  topic: Topic,
  message: Message,
): void => {
  if (!window[symbol]) {
    window[symbol] = createChannel()
  }

  const listeners: Array<Listener<BaseMessage>> = []

  let channel: Channel = window[symbol]

  for (const fragment of topic) {
    listeners.unshift(...channel.__listeners)

    if (!channel[fragment]) channel[fragment] = createChannel()

    channel = channel[fragment] as Channel
  }

  channel.__listeners.forEach((subscriber) => subscriber(message))
  listeners.forEach((subscriber) => subscriber(message))
}
