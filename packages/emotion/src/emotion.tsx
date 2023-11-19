import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { useMemo } from "react"

export function withCacheProvider<Props>(
  Component: React.ComponentType<Props>,
  key: string = "rtwc",
): React.FC<Props & { container: HTMLElement }> {
  const ComponentWithStyleProvider: React.FC<
    Props & { container: HTMLElement }
  > = ({ container, ...props }) => {
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
