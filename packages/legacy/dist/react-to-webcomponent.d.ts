import type { R2WCOptions } from "@r2wc/core";
interface ReactType {
    createElement: (type: any, data: any, children?: any) => React.ReactElement;
}
interface ReactDOMRootRootType {
    render: (element: React.ReactElement | null) => void;
    unmount: () => void;
}
interface ReactDOMRootType {
    createRoot: (container: Element | DocumentFragment, options?: any) => ReactDOMRootRootType;
}
interface ReactDOMRenderType {
    unmountComponentAtNode: (container: Element | DocumentFragment) => boolean;
    render: (element: React.ReactElement, container: ReactDOM.Container | null) => unknown;
}
/**
 * Converts a React component into a webcomponent by mounting it into an HTMLElement container.
 * @param {ReactComponent}
 * @param {React}
 * @param {ReactDOM}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
export default function r2wc<Props extends object>(ReactComponent: React.ComponentType<Props>, React: ReactType, ReactDOM: ReactDOMRootType | ReactDOMRenderType, options?: R2WCOptions<Props>): CustomElementConstructor;
export {};
