import type { R2WCType } from "./transforms";
type PropName<Props> = Exclude<Extract<keyof Props, string>, "container">;
type PropNames<Props> = Array<PropName<Props>>;
export interface R2WCOptions<Props> {
    shadow?: "open" | "closed";
    props?: PropNames<Props> | Partial<Record<PropName<Props>, R2WCType>>;
}
export interface R2WCRenderer<Props extends R2WCBaseProps, Context> {
    mount: (container: HTMLElement, ReactComponent: React.ComponentType<Props>, props: Props) => Context;
    update: (context: Context, props: Props) => void;
    unmount: (context: Context) => void;
}
export interface R2WCBaseProps {
    container: HTMLElement;
}
/**
 * Converts a React component into a Web Component.
 * @param {ReactComponent}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: "string" | "number" | "boolean" | "function" | "json" }
 */
export default function r2wc<Props extends R2WCBaseProps, Context>(ReactComponent: React.ComponentType<Props>, options: R2WCOptions<Props>, renderer: R2WCRenderer<Props, Context>): CustomElementConstructor;
export declare function useImperativeMethods<Methods extends string>(container: HTMLElement | ShadowRoot, methods: Record<Methods, () => unknown>): void;
export {};
