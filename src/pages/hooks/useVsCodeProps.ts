import { useState, useEffect } from "preact/compat";

export function useVsCodeProps() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [props, setProps] = useState<any>();

  useEffect(() => {
    const handleMessageEvent = (event) => {
      const message = event.data;

      switch (message.type) {
        case "props-change":
          setProps((currentProps) => ({ ...currentProps, ...message.payload }));
          break;
      }
    };

    window.addEventListener("message", handleMessageEvent);
    return () => window.removeEventListener("message", handleMessageEvent);
  }, []);

  return [props, setProps];
}
