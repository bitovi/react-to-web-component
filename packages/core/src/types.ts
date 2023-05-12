export interface RefObject<T> {
  current: T | null
}

export interface ReactElement<P = any, T extends string | any = string | any> {
  type: T
  props: P
  key: string | number | null
}

export interface ReactPortal extends ReactElement {
  key: string | number | null
  children: ReactNode
}

export type ReactFragment = Iterable<ReactNode>
export type ReactNode =
  | ReactElement
  | string
  | number
  | ReactFragment
  | ReactPortal
  | boolean
  | null
  | undefined

export interface FC<P = Record<string, unknown>> {
  (props: P & { children?: ReactNode }, context?: any): ReactElement<
    any,
    any
  > | null
  propTypes?: any
  contextTypes?: any
  defaultProps?: Partial<P>
  displayName?: string
}

export interface ComponentClass<P = Record<string, unknown>> {
  new (props: P, context?: any): any
  propTypes?: any
  contextType?: any
  contextTypes?: any
  childContextTypes?: any
  defaultProps?: Partial<P> | undefined
  displayName?: string | undefined
}

export type Container = Element | Document | DocumentFragment

export interface Context<PropsType> {
  reactContainer: HTMLElement
  component: ComponentClass<PropsType> | FC<PropsType>
}

export interface CustomElementConstructor {
  new (...params: any[]): HTMLElement
}

export interface R2WCOptions {
  shadow?: "open" | "closed" | boolean
  props?: string[] | Record<string, unknown>
}

export interface Renderer {
  mount: (container: HTMLElement, ReactComponent: FC<any> | ComponentClass<any>, props: any) => Context<any>
  unmount: (container: HTMLElement) => any
  update: (context: Context<any>, props: any) => void
  onUpdated?: () => void
}
