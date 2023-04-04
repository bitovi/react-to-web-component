/* eslint-disable @typescript-eslint/no-explicit-any */
interface RefObject<T> {
  current: T | null
}

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

interface ReactDOM {
  createRoot?: (container: Element | DocumentFragment, options?: any) => unknown
  unmountComponentAtNode?: (container: Element | DocumentFragment) => boolean
  render?: (
    element: ReactElement<any, any> | null | any,
    container: Container | null,
  ) => unknown
}

interface React {
  createRef: () => RefObject<unknown>
  createElement: (
    type: string | FC<any> | ComponentClass<any>,
    data: any,
    children?: any,
  ) => ReactElement<any, any> | null | any
}

interface CustomElementConstructor {
  new (...params: any[]): HTMLElement
}

interface R2WCOptions {
  shadow?: string | boolean
  props?: Array<string> | Record<string, unknown>
}
