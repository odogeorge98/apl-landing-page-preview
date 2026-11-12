export type Material = {
  id: string;
  subject: string;
  format: string;
  meta: string;
  title: string;
  access: "Open access" | "Institution access";
  accent?: boolean;
};

export const MATERIALS: Material[] = [
  { id: "research-skills", subject: "Research skills", format: "Study guide", meta: "Study guide · 12 pages", title: "Reading academic sources critically", access: "Open access" },
  { id: "data-structures", subject: "Computer Science", format: "Video", meta: "Video · 24 min", title: "Thinking in data structures", access: "Institution access", accent: true },
  { id: "linear-algebra", subject: "Mathematics", format: "Learning notes", meta: "Learning notes · 18 pages", title: "Linear algebra: a worked companion", access: "Open access" },
  { id: "research-methods", subject: "Research methods", format: "Workbook", meta: "Workbook · 8 activities", title: "From question to research plan", access: "Open access" },
  { id: "probability", subject: "Statistics", format: "Video", meta: "Video · 18 min", title: "Understanding probability", access: "Institution access", accent: true },
  { id: "writing-with-evidence", subject: "Academic writing", format: "Study guide", meta: "Study guide · 16 pages", title: "Writing with evidence", access: "Open access" },
];

export const SAVED_INITIAL = ["research-skills", "linear-algebra", "writing-with-evidence"];

export const ARTICLE_SLUG = "make-your-reading-list-work-for-you";

export const JOURNALS = [
  { letter: "L", title: "Learning & Society", issue: "Vol. 01 · Issue 02", desc: "Teaching, access and academic life", href: `/discoveries/${ARTICLE_SLUG}` },
  { letter: "C", title: "Computing Perspectives", issue: "Vol. 01 · Issue 01", desc: "Computing concepts and education", href: "/discoveries#journals" },
  { letter: "M", title: "Methods Notebook", issue: "Vol. 02 · Issue 01", desc: "Research design and academic practice", href: "/discoveries#journals" },
];

export const ARTICLES: Record<
  string,
  {
    title: string;
    subtitle: string;
    author: string;
    authorRole: string;
    journal: string;
    issue: string;
    meta: string;
    abstract: string;
    keywords: string;
    pageLabel: string;
    heading: string;
    paragraphs: string[];
    calloutTitle: string;
    callout: string;
    end: string;
    toc: string[];
    cite: { apa: string; mla: string; chicago: string };
    ris: string;
    related: { title: string; meta: string }[];
  }
> = {
  [ARTICLE_SLUG]: {
    title: "Make your reading list work for you",
    subtitle: "Plan. Question. Connect your reading.",
    author: "Dr. Ada Nwafor",
    authorRole: "Example editorial contributor",
    journal: "Learning & Society",
    issue: "Vol. 01 · Issue 02 · October 2026",
    meta: "8-page example article · English",
    abstract:
      "A long reading list can make it difficult to decide where to begin. This example article introduces a study framework: establish the purpose of a text, ask focused questions, record connections and revisit your notes. The preview is designed to demonstrate how a journal resource can be presented within Academic Pavilion.",
    keywords: "Keywords: academic reading · study skills · source evaluation",
    pageLabel: "Reading preview · Page 1 of 8",
    heading: "1. Start with a purpose",
    paragraphs: [
      "Before opening a source, write down what you need to understand. Is the reading introducing a concept, offering a different perspective or helping you shape a question?",
      "Scan the title, headings and conclusion. Then return to the relevant sections with a question in mind. Keep a short note of what the source says, what it supports and what you still need to investigate.",
    ],
    calloutTitle: "Ask as you read.",
    callout: "What is the central idea? How does it connect to your course? Which point would benefit from another source?",
    end: "End of example preview · Open the full example PDF to continue.",
    toc: ["1. Start with a purpose", "2. Read with questions", "3. Connect your notes", "4. Build a reading routine", "References & further reading"],
    cite: {
      apa: "Nwafor, A. (2026). Make your reading list work for you. Learning & Society, 1(2). [Example editorial material].",
      mla: "Nwafor, Ada. “Make Your Reading List Work for You.” Learning & Society, vol. 1, no. 2, 2026. Example editorial material.",
      chicago: "Nwafor, Ada. 2026. “Make Your Reading List Work for You.” Learning & Society 1 (2). Example editorial material.",
    },
    ris: "TY  - JOUR\nAU  - Nwafor, Ada\nTI  - Make your reading list work for you\nJO  - Learning & Society\nVL  - 1\nIS  - 2\nPY  - 2026\nN1  - Example editorial material\nER  - \n",
    related: [
      { title: "Reading academic sources critically", meta: "Study guide · 12 pages" },
      { title: "Writing with evidence", meta: "Learning material · 16 pages" },
      { title: "From question to research plan", meta: "Workbook · 8 activities" },
    ],
  },
};
