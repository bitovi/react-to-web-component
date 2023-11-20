export interface Transform<Type> {
    stringify?: (value: Type, attribute: string, element: HTMLElement) => string;
    parse: (value: string, attribute: string, element: HTMLElement) => Type;
}
declare const transforms: {
    string: Transform<string>;
    number: Transform<number>;
    boolean: Transform<boolean>;
    function: Transform<(...args: unknown[]) => unknown>;
    json: Transform<string>;
};
export type R2WCType = keyof typeof transforms;
export default transforms;
