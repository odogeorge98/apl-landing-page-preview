/**
 * Starter learning materials for the student portal.
 *
 * Every entry links to a free, public learning resource from a reputable
 * source and is matched to a module of the programme it supports (see
 * lib/data/curriculum.ts). Materials uploaded by tutors will replace or add
 * to this list once the materials API is connected.
 */

export const MATERIAL_FORMATS = ["Documentation", "Tutorial", "Book", "Reference", "Interactive"] as const;
export type MaterialFormat = (typeof MATERIAL_FORMATS)[number];

export type LearningMaterial = {
  id: string;
  title: string;
  description: string;
  /** Programme name, as used in the curriculum. */
  course: string;
  /** Curriculum module the material supports. */
  module: string;
  format: MaterialFormat;
  /** Who publishes the resource. */
  source: string;
  href: string;
};

export const learningMaterials: LearningMaterial[] = [
  // Front-End Web Development
  {
    id: "fe-mdn-learn",
    title: "Learn web development",
    description: "A structured path through HTML, CSS and JavaScript fundamentals, with exercises at each step.",
    course: "Front-End Web Development",
    module: "Web foundations",
    format: "Tutorial",
    source: "MDN Web Docs",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
  },
  {
    id: "fe-webdev-css",
    title: "Learn CSS",
    description: "A modern course on the cascade, layout, Flexbox, Grid and responsive techniques.",
    course: "Front-End Web Development",
    module: "Responsive design and styling frameworks",
    format: "Tutorial",
    source: "web.dev",
    href: "https://web.dev/learn/css",
  },
  {
    id: "fe-tailwind",
    title: "Tailwind CSS documentation",
    description: "Reference for utility classes, responsive variants and customising your design system.",
    course: "Front-End Web Development",
    module: "Responsive design and styling frameworks",
    format: "Reference",
    source: "Tailwind CSS",
    href: "https://tailwindcss.com/docs",
  },
  {
    id: "fe-javascript-info",
    title: "The Modern JavaScript Tutorial",
    description: "From the basics to advanced concepts such as closures, promises and modules.",
    course: "Front-End Web Development",
    module: "JavaScript",
    format: "Tutorial",
    source: "javascript.info",
    href: "https://javascript.info/",
  },
  {
    id: "fe-react",
    title: "Learn React",
    description: "Official guide to components, props, state and building interactive interfaces.",
    course: "Front-End Web Development",
    module: "React and application building",
    format: "Documentation",
    source: "React",
    href: "https://react.dev/learn",
  },
  {
    id: "fe-pro-git",
    title: "Pro Git",
    description: "The complete book on Git: branching, collaboration and everyday workflows.",
    course: "Front-End Web Development",
    module: "Tooling and quality",
    format: "Book",
    source: "Git",
    href: "https://git-scm.com/book/en/v2",
  },

  // Back-End Development
  {
    id: "be-python-tutorial",
    title: "The Python Tutorial",
    description: "Official introduction to Python syntax, data structures, modules and error handling.",
    course: "Back-End Development",
    module: "Programming foundations",
    format: "Documentation",
    source: "Python",
    href: "https://docs.python.org/3/tutorial/",
  },
  {
    id: "be-http",
    title: "HTTP reference",
    description: "How requests, responses, headers, methods and status codes work on the web.",
    course: "Back-End Development",
    module: "Web frameworks and APIs",
    format: "Reference",
    source: "MDN Web Docs",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
  },
  {
    id: "be-postgres",
    title: "PostgreSQL tutorial",
    description: "A hands-on introduction to tables, queries, joins and transactions.",
    course: "Back-End Development",
    module: "Databases",
    format: "Documentation",
    source: "PostgreSQL",
    href: "https://www.postgresql.org/docs/current/tutorial.html",
  },
  {
    id: "be-owasp",
    title: "OWASP Top Ten",
    description: "The most critical web application security risks, including broken authentication.",
    course: "Back-End Development",
    module: "Authentication and security",
    format: "Reference",
    source: "OWASP",
    href: "https://owasp.org/www-project-top-ten/",
  },

  // Product Design (UI/UX)
  {
    id: "pd-figma",
    title: "Figma Help Center",
    description: "Guides for frames, auto layout, components, prototyping and developer handoff.",
    course: "Product Design (UI/UX)",
    module: "Wireframing and Figma",
    format: "Documentation",
    source: "Figma",
    href: "https://help.figma.com/hc/en-us",
  },
  {
    id: "pd-nngroup",
    title: "UX research and design articles",
    description: "Evidence-based articles on user research, usability testing and information architecture.",
    course: "Product Design (UI/UX)",
    module: "User research and structure",
    format: "Reference",
    source: "Nielsen Norman Group",
    href: "https://www.nngroup.com/articles/",
  },
  {
    id: "pd-accessibility",
    title: "Learn Accessibility",
    description: "Practical lessons on designing and building interfaces everyone can use.",
    course: "Product Design (UI/UX)",
    module: "Interfaces and prototyping",
    format: "Tutorial",
    source: "web.dev",
    href: "https://web.dev/learn/accessibility",
  },

  // Data Science
  {
    id: "ds-kaggle",
    title: "Kaggle Learn",
    description: "Short, hands-on courses in Python, pandas, data visualisation and machine learning.",
    course: "Data Science",
    module: "Python toolkit",
    format: "Interactive",
    source: "Kaggle",
    href: "https://www.kaggle.com/learn",
  },
  {
    id: "ds-pandas",
    title: "pandas: getting started",
    description: "Introductory tutorials on loading, cleaning and analysing tabular data.",
    course: "Data Science",
    module: "Data preparation and analysis",
    format: "Documentation",
    source: "pandas",
    href: "https://pandas.pydata.org/docs/getting_started/index.html",
  },
  {
    id: "ds-sklearn",
    title: "scikit-learn user guide",
    description: "Regression, classification, clustering and model evaluation explained with examples.",
    course: "Data Science",
    module: "Machine learning",
    format: "Documentation",
    source: "scikit-learn",
    href: "https://scikit-learn.org/stable/user_guide.html",
  },

  // Cybersecurity
  {
    id: "cs-owasp",
    title: "OWASP Top Ten",
    description: "Understand common application vulnerabilities and how they are prevented.",
    course: "Cybersecurity",
    module: "Application security",
    format: "Reference",
    source: "OWASP",
    href: "https://owasp.org/www-project-top-ten/",
  },
  {
    id: "cs-tryhackme",
    title: "Guided security labs",
    description: "Browser-based labs for practising security skills in a safe, controlled environment.",
    course: "Cybersecurity",
    module: "Security assessment",
    format: "Interactive",
    source: "TryHackMe",
    href: "https://tryhackme.com/",
  },
  {
    id: "cs-nist",
    title: "NIST Cybersecurity Framework",
    description: "A widely used framework for managing cybersecurity risk and incident response.",
    course: "Cybersecurity",
    module: "Response and governance",
    format: "Reference",
    source: "NIST",
    href: "https://www.nist.gov/cyberframework",
  },

  // IT Training
  {
    id: "it-gcf",
    title: "Computer Basics",
    description: "Plain-language lessons on hardware, operating systems, files and everyday computer use.",
    course: "IT Training",
    module: "Fundamentals",
    format: "Tutorial",
    source: "GCFGlobal",
    href: "https://edu.gcfglobal.org/en/computerbasics/",
  },
  {
    id: "it-netacad",
    title: "Networking courses",
    description: "Introductory networking courses covering IP addressing, routers and switches.",
    course: "IT Training",
    module: "Hardware and networking",
    format: "Interactive",
    source: "Cisco Networking Academy",
    href: "https://www.netacad.com/",
  },
  {
    id: "it-linux-journey",
    title: "Linux Journey",
    description: "Step-by-step lessons on the command line, users, permissions and system configuration.",
    course: "IT Training",
    module: "Configuration and troubleshooting",
    format: "Tutorial",
    source: "Linux Journey",
    href: "https://linuxjourney.com/",
  },
];

export const materialCourses: string[] = Array.from(new Set(learningMaterials.map((item) => item.course)));
