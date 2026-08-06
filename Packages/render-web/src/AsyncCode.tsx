import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

import { highlightCode, supportedLanguage } from "./highlight";

interface AsyncCodeProps {
  code: string;
  language: string;
}

export function AsyncCode({ code, language }: AsyncCodeProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setHtml(null);
    setFailed(false);
    if (!supportedLanguage(language)) return;
    void highlightCode(code, language)
      .then((value) => {
        if (active && value) setHtml(DOMPurify.sanitize(value));
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [code, language]);

  if (!html || failed) {
    return (
      <pre className="hd-code" data-language={language || "text"}>
        <code>{code}</code>
      </pre>
    );
  }
  return <div className="hd-code-highlight" dangerouslySetInnerHTML={{ __html: html }} />;
}
