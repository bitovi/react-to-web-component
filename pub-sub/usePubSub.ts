import { useEffect, useCallback, useRef } from "react";

import { BaseMessage, publish, subscribe } from "./pub-sub";

const _internalTopicStabilizer = "-||-||-";

export const usePubSub = <TMessage extends BaseMessage>(
  topics: string[],
  handler?: (data: TMessage) => void
): ((data: TMessage) => void) => {
  const stableHandler = useRef(handler);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () => subscribe(topics, stableHandler?.current),
    [topics.join(_internalTopicStabilizer)]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    (data: TMessage) => publish(topics, data),
    [topics.join(_internalTopicStabilizer)]
  );
};
