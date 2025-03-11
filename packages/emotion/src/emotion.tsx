import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { useMemo } from "react"

import { R2WCBaseProps } from "@r2wc/core"

export function withCacheProvider<Props>(
  Component: React.ComponentType<Props>,
  key: string = "rtwc",
): React.FC<Props & R2WCBaseProps> {
  const ComponentWithStyleProvider: React.FC<Props & R2WCBaseProps> = ({
    container,
    ...props
  }) => {
    const cache = useMemo(() => createCache({ key, container }), [container])

    return (
      <CacheProvider value={cache}>
        <Component
          {...(props as JSX.IntrinsicAttributes & Props)}
          container={container}
        />
      </CacheProvider>
    )
  }

  return ComponentWithStyleProvider
}
