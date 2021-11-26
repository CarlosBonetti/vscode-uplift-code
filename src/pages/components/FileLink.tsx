import { h, JSX } from "preact";
import { useEffect, useRef } from "preact/compat";
import { useVsCodeApi } from "../hooks/useVsCodeApi";

export const FileLink = (props: JSX.HTMLAttributes<HTMLAnchorElement>) => {
  const ref = useRef<HTMLAnchorElement>();
  const vscode = useVsCodeApi();

  useEffect(() => {
    ref.current.addEventListener("click", () => {
      vscode.postMessage({
        command: "open-file",
        href: ref.current.getAttribute("href"),
      });
    });
  }, []);

  return <a ref={ref} {...props} />;
};
