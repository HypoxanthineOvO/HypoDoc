import { describe, expect, it } from "vitest";
import { parseHypoDoc } from "@hypodoc/parser-core";

import { createRenderDocument, isSafeWorkspaceResource } from "../src";

describe("renderer model", () => {
  it("projects answer content without deleting it from the parsed document", () => {
    const parsed = parseHypoDoc(
      ':::: {.qa #q kind="open"}\n::: {.question}\nPrompt\n:::\n::: {.answer}\nAnswer\n:::\n::::\n',
    );
    const student = createRenderDocument(parsed, { answerMode: "student" });
    const teacher = createRenderDocument(parsed, { answerMode: "teacher" });
    expect(JSON.stringify(student.nodes)).not.toContain('"name":"answer"');
    expect(JSON.stringify(teacher.nodes)).toContain('"name":"answer"');
    expect(JSON.stringify(parsed.nodes)).toContain('"name":"answer"');
  });

  it("allows only workspace-relative resource paths", () => {
    expect(isSafeWorkspaceResource("assets/figure.png")).toBe(true);
    expect(isSafeWorkspaceResource("../secret.png")).toBe(false);
    expect(isSafeWorkspaceResource("https://example.com/a.png")).toBe(false);
    expect(isSafeWorkspaceResource("C:\\secret.png")).toBe(false);
  });
});
