import React, { useEffect, useRef } from "react";
import { useVsCodeApi } from "../hooks/useVsCodeApi";

export const FileLink = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
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
