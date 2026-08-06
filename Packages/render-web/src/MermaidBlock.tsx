import DOMPurify from "dompurify";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface MermaidBlockProps {
  code: string;
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const reactId = useId().replace(/[^a-z0-9]/gi, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSvg(null);
    setError(null);
    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          deterministicIds: true,
          deterministicIDSeed: `hypodoc-${reactId}`,
          theme: "neutral",
          fontFamily: "var(--hd-font-ui)",
        });
        const result = await mermaid.render(`hypodoc-mermaid-${reactId}`, code);
        return DOMPurify.sanitize(result.svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
      })
      .then((value) => {
        if (active) setSvg(value);
      })
      .catch(() => {
        if (active) setError("Diagram syntax could not be rendered safely.");
      });
    return () => {
      active = false;
    };
  }, [code, reactId]);

  if (error) {
    return (
      <div className="hd-inline-error" role="status">
        <AlertTriangle aria-hidden="true" size={18} />
        <span>{error}</span>
      </div>
    );
  }
  if (!svg) {
    return (
      <div className="hd-diagram-loading" role="status">
        <LoaderCircle aria-hidden="true" size={20} />
        <span>Rendering diagram</span>
      </div>
    );
  }
  return (
    <figure className="hd-mermaid" aria-label="Mermaid diagram">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </figure>
  );
}
