export const SPEC_VERSION = "0.2.0-rc.1" as const;
export const REGISTRY_DIGEST =
  "sha256:159c5ea0f86efdc31c3d5005f1e7ebeafe5e795dec35eb822518f341d50f9768";

export interface DirectiveDefinition {
  attributes: Readonly<Record<string, { required?: boolean; values?: readonly string[]; list?: boolean }>>;
  requiresId?: boolean;
  empty?: boolean;
  parents?: readonly string[];
}

const title = { title: {} } as const;

export const DIRECTIVES: Readonly<Record<string, DirectiveDefinition>> = {
  note: { attributes: title },
  tip: { attributes: title },
  warning: { attributes: title },
  summary: { attributes: title },
  objective: { attributes: title },
  info: { attributes: title },
  task: { attributes: title },
  requirement: { attributes: title },
  deliverable: { attributes: title },
  checklist: { attributes: title },
  rubric: { attributes: title },
  question: {
    attributes: {
      title: {},
      label: {},
      numbered: { values: ["true", "false"] },
    },
  },
  hint: { attributes: title, parents: ["qa"] },
  answer: { attributes: { title: {}, choices: { list: true } }, parents: ["qa"] },
  solution: { attributes: title, parents: ["qa"] },
  qa: {
    attributes: {
      title: {},
      kind: { required: true, values: ["open", "single-choice", "multiple-choice"] },
    },
    requiresId: true,
  },
  figure: {
    attributes: { src: { required: true }, caption: {}, label: {} },
    empty: true,
  },
  ref: { attributes: { target: { required: true } }, empty: true },
  choices: { attributes: {}, parents: ["qa"] },
  choice: { attributes: {}, requiresId: true, parents: ["choices"] },
  table: {
    attributes: {
      kind: { values: ["default", "comparison", "checklist", "rubric"] },
      caption: {},
    },
    requiresId: true,
  },
};

export const PROFILES = ["core", "book", "article", "beamer"] as const;
