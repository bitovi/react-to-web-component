import type { BaseMessage } from "./pub-sub";

import { useState, useCallback } from "react";

import { usePubSub } from "./usePubSub";

export const usePubSubState = <TMessage extends BaseMessage>(
  topics: string[],
  initialValue?: TMessage,
  filter?: (data: TMessage) => boolean
): [TMessage | undefined, (data: TMessage) => void] => {
  const [state, setState] = useState(initialValue);

  const filteredSetter = useCallback(
    (data: TMessage) => {
      if (!filter) {
        setState(data);
        return;
      }

      if (filter(data)) {
        setState(data);
        return;
      }
    },
    [filter]
  );

  const publish = usePubSub(topics, filteredSetter);

  return [state, publish];
};
