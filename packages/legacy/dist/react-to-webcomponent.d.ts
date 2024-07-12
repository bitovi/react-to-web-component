import { R2WCOptions } from '@r2wc/core';

/**
 * Converts a React component into a webcomponent by mounting it into an HTMLElement container.
 * @param {ReactComponent}
 * @param {React}
 * @param {ReactDOM}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
declare function r2wc<Props extends object>(ReactComponent: React.ComponentType<Props>, React: ReactType, ReactDOM: ReactDOMRootType | ReactDOMRenderType, options?: R2WCOptions<Props>): CustomElementConstructor;
export default r2wc;

declare interface ReactDOMRenderType {
    unmountComponentAtNode: (container: Element | DocumentFragment) => boolean;
    render: (element: React.ReactElement, container: ReactDOM.Container | null) => unknown;
}

declare interface ReactDOMRootRootType {
    render: (element: React.ReactElement | null) => void;
    unmount: () => void;
}

declare interface ReactDOMRootType {
    createRoot: (container: Element | DocumentFragment, options?: any) => ReactDOMRootRootType;
}

declare interface ReactType {
    createElement: (type: any, data: any, children?: any) => React.ReactElement;
}

export { }
