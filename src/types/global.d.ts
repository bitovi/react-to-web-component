/* eslint-disable @typescript-eslint/no-explicit-any */
interface ReactElement<P = any, T extends string | any = string | any> {
  type: T
  props: P
  key: string | number | null
}

interface ReactPortal extends ReactElement {
  key: string | number | null
  children: ReactNode
}

type ReactFragment = Iterable<ReactNode>
type ReactNode =
  | ReactElement
  | string
  | number
  | ReactFragment
  | ReactPortal
  | boolean
  | null
  | undefined

interface FC<P = Record<string, unknown>> {
  (props: P & { children?: ReactNode }, context?: any): ReactElement<
    any,
    any
  > | null
  propTypes?: any
  contextTypes?: any
  defaultProps?: Partial<P>
  displayName?: string
}

interface ComponentClass<P = Record<string, unknown>> {
  new (props: P, context?: any): any
  propTypes?: any
  contextType?: any
  contextTypes?: any
  childContextTypes?: any
  defaultProps?: Partial<P> | undefined
  displayName?: string | undefined
}

type Container = Element | Document | DocumentFragment

interface CustomElementConstructor {
  new (...params: any[]): HTMLElement
}

interface R2WCOptions {
  shadow?: string | boolean
  props?: Array<string> | Record<string, unknown>
}

interface Renderer<T> {
  mount: (container: HTMLElement, element: T) => any
  unmount: (container: HTMLElement) => any
}
