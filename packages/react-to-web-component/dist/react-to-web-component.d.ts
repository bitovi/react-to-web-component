import type { R2WCOptions } from "@r2wc/core";
import React from "react";
export { useImperativeMethods } from "@r2wc/core";
export default function r2wc<Props extends object>(ReactComponent: React.ComponentType<Props>, options?: R2WCOptions<Props>): CustomElementConstructor;
