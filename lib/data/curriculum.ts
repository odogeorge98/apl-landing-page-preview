/**
 * Static curriculum content for Nugi Innovations training programmes.
 * Source: https://nugiinnovations.com/
 *
 * Only programmes with a documented curriculum have `modules`. The rest are
 * listed in the catalogue so the page reflects the full programme range and
 * can be filled in as outlines are supplied.
 */

export type CurriculumModule = {
  id: string;
  title: string;
  summary: string;
};

export type CurriculumProgramme = {
  id: string;
  name: string;
  /** Short category used for the badge on the programme tab. */
  category: "Development" | "Design" | "Data & Security" | "Infrastructure" | "Management" | "General IT" | "Marketing";
  overview: string;
  modules: CurriculumModule[];
  /** Professional skills practised alongside the technical modules. */
  skillsFocus: string[];
};

export const LEARNING_APPROACH = [
  {
    id: "practical",
    title: "Practical learning",
    description: "Learners build real things throughout the programme rather than only studying theory.",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    description: "Learners are guided by mentors as they work through each stage of the programme.",
  },
  {
    id: "internship",
    title: "Internship opportunities",
    description: "Potential internship placement is offered based on learner performance.",
  },
] as const;

export const curriculumProgrammes: CurriculumProgramme[] = [
  {
    id: "front-end-web-development",
    name: "Front-End Web Development",
    category: "Development",
    overview:
      "Learn to design, build, and ship modern, responsive websites and user interfaces, from page structure through to hosting and deployment.",
    modules: [
      { id: "html", title: "HTML", summary: "Structuring web pages with semantic markup." },
      { id: "css", title: "CSS", summary: "Styling pages and building layouts." },
      { id: "responsive-design", title: "Responsive web design", summary: "Making pages work across phones, tablets, and desktops." },
      { id: "javascript", title: "JavaScript", summary: "Adding interactive functionality to web pages." },
      { id: "react", title: "React", summary: "Building reusable user interface components." },
      { id: "git-github", title: "Git and GitHub", summary: "Version control and collaboration on code." },
      { id: "hosting-deployment", title: "Website hosting and deployment", summary: "Putting finished websites online." },
      { id: "projects", title: "Practical projects", summary: "Applying each skill by building real projects." },
    ],
    skillsFocus: [
      "Debugging",
      "Performance optimisation",
      "Cross-browser compatibility",
      "Teamwork",
      "Implementing designs from prototypes",
    ],
  },
  {
    id: "it-training",
    name: "IT Training",
    category: "General IT",
    overview:
      "Build a solid foundation in everyday computing, office tools, and the basics of keeping systems and networks running.",
    modules: [
      { id: "computer-fundamentals", title: "Computer fundamentals", summary: "Core concepts of how computers work and are used." },
      { id: "office-productivity", title: "Office productivity tools", summary: "Working effectively with common office software." },
      { id: "internet-email", title: "Internet and email usage", summary: "Using the web and email confidently and safely." },
      { id: "it-troubleshooting", title: "IT troubleshooting", summary: "Diagnosing and fixing common technical problems." },
      { id: "networking", title: "Networking", summary: "Understanding how devices connect and communicate." },
      { id: "system-configuration", title: "System configuration", summary: "Setting up and configuring computer systems." },
    ],
    skillsFocus: [],
  },
  {
  id: "back-end-development",
  name: "Back-End Development",
  category: "Development",
  overview:
    "Learn to build secure, reliable server-side applications, APIs, and databases that power modern websites and web applications.",
  modules: [
    { id: "programming-fundamentals", title: "Programming fundamentals", summary: "Learn variables, data types, functions, loops, conditions, and object-oriented programming." },
    { id: "backend-fundamentals", title: "Back-end development fundamentals", summary: "Understand client-server architecture, HTTP, HTTPS, requests, responses, and server-side processing." },
    { id: "server-side-programming", title: "Server-side programming", summary: "Build application logic using technologies such as Node.js, Python, or PHP." },
    { id: "backend-frameworks", title: "Back-end frameworks", summary: "Use frameworks to organise applications, handle routing, process requests, and manage middleware." },
    { id: "database-fundamentals", title: "Database fundamentals", summary: "Understand relational databases, SQL, tables, relationships, and database design." },
    { id: "api-development", title: "API development", summary: "Create REST APIs, implement CRUD operations, exchange JSON data, and handle HTTP status codes." },
    { id: "authentication-authorization", title: "Authentication and authorisation", summary: "Implement registration, login, password hashing, sessions, tokens, and access permissions." },
    { id: "backend-security", title: "Back-end security", summary: "Protect applications through input validation, secure configuration, and prevention of common vulnerabilities." },
    { id: "file-handling", title: "File handling and storage", summary: "Manage file uploads, validate files, and integrate storage solutions." },
    { id: "testing-debugging", title: "Testing and debugging", summary: "Test application logic and APIs, diagnose errors, and implement reliable error handling." },
    { id: "backend-deployment", title: "Deployment and maintenance", summary: "Configure production environments, manage environment variables, deploy applications, and monitor performance." },
    { id: "backend-capstone", title: "Practical back-end project", summary: "Build and deploy a complete API for an e-commerce platform, booking system, or school portal." },
  ],
  skillsFocus: [
    "Server-side programming",
    "REST API development",
    "SQL and database integration",
    "Authentication and authorisation",
    "Application security",
    "Testing and debugging",
    "Deployment and maintenance",
  ],
},

{
  id: "mobile-app-development",
  name: "Mobile App Development",
  category: "Development",
  overview:
    "Learn to design, build, test, and publish mobile applications with interactive interfaces, secure data handling, and modern development tools.",
  modules: [
    { id: "mobile-fundamentals", title: "Mobile development fundamentals", summary: "Understand mobile operating systems, application lifecycles, development approaches, and mobile UI conventions." },
    { id: "mobile-programming", title: "Programming fundamentals", summary: "Learn variables, functions, classes, objects, collections, and asynchronous programming for mobile applications." },
    { id: "development-environments", title: "Mobile development environments", summary: "Set up development tools, emulators, simulators, and physical devices for application testing." },
    { id: "mobile-ui-design", title: "Mobile user interface design", summary: "Create screens, layouts, navigation structures, reusable components, and responsive interfaces." },
    { id: "native-development", title: "Native app development", summary: "Explore Android development with Kotlin and iOS development with Swift." },
    { id: "cross-platform-development", title: "Cross-platform development", summary: "Build applications for multiple platforms using Flutter and Dart or React Native." },
    { id: "mobile-state-management", title: "State management and forms", summary: "Manage application state, user input, form validation, and interactive screen updates." },
    { id: "mobile-api-integration", title: "API integration and networking", summary: "Connect applications to REST APIs, process JSON responses, and handle network errors." },
    { id: "mobile-data-storage", title: "Local data storage", summary: "Store preferences and application data using local databases, caching, and synchronisation techniques." },
    { id: "mobile-authentication", title: "Mobile authentication", summary: "Implement registration, login, session management, and password recovery." },
    { id: "device-features", title: "Device features and permissions", summary: "Integrate camera, location, notifications, and file access while managing permissions." },
    { id: "mobile-testing-security", title: "Testing and mobile security", summary: "Test applications across devices and protect user information through secure data handling." },
    { id: "app-publishing", title: "App deployment and publishing", summary: "Prepare release builds, sign applications, manage versions, and learn app store submission requirements." },
    { id: "mobile-capstone", title: "Practical mobile app project", summary: "Build a functional task manager, shopping application, learning app, or location-based service." },
  ],
  skillsFocus: [
    "Mobile application development",
    "Kotlin, Swift, Flutter, or React Native",
    "Mobile UI design",
    "API integration",
    "Local data storage",
    "Mobile testing and security",
    "Application publishing",
  ],
},

{
  id: "product-design",
  name: "Product Design",
  category: "Design",
  overview:
    "Learn to research user needs and transform ideas into intuitive digital products through user experience design, interface design, prototyping, and usability testing.",
  modules: [
    { id: "design-fundamentals", title: "Design fundamentals", summary: "Understand visual hierarchy, colour theory, typography, spacing, alignment, and composition." },
    { id: "design-thinking", title: "Design thinking", summary: "Apply empathy, problem definition, ideation, prototyping, and testing to solve user problems." },
    { id: "user-research", title: "User research", summary: "Conduct interviews, surveys, competitor analysis, and observations to understand user needs." },
    { id: "user-personas", title: "User personas and journeys", summary: "Identify target users, document pain points, and map customer journeys and user goals." },
    { id: "information-architecture", title: "Information architecture", summary: "Organise product content, create sitemaps, and structure intuitive navigation." },
    { id: "user-flows", title: "User flows", summary: "Map the steps users take to complete tasks within websites and applications." },
    { id: "wireframing", title: "Wireframing", summary: "Create low-fidelity layouts to plan screen structure, content placement, and interactions." },
    { id: "figma-fundamentals", title: "Figma and design tools", summary: "Use frames, components, auto-layout, constraints, variants, and reusable design libraries." },
    { id: "interface-design", title: "User interface design", summary: "Create high-fidelity screens, design systems, typography scales, colour palettes, and interface components." },
    { id: "prototyping", title: "Interactive prototyping", summary: "Build clickable prototypes with transitions and interactions to demonstrate product behaviour." },
    { id: "responsive-design", title: "Responsive and accessible design", summary: "Design interfaces for mobile, tablet, and desktop while considering accessibility and readability." },
    { id: "usability-testing", title: "Usability testing", summary: "Plan tests, gather user feedback, identify usability problems, and improve designs iteratively." },
    { id: "developer-handoff", title: "Developer handoff", summary: "Prepare design specifications, export assets, document components, and collaborate with developers." },
    { id: "product-design-capstone", title: "Practical product design project", summary: "Design a complete digital product and present its research, wireframes, prototype, and design case study." },
  ],
  skillsFocus: [
    "UI/UX design",
    "User research",
    "Wireframing and prototyping",
    "Figma",
    "Design systems",
    "Responsive and accessible design",
    "Usability testing",
  ],
},

{
  id: "graphic-design",
  name: "Graphic Design",
  category: "Design",
  overview:
    "Develop visual communication skills for creating professional branding, digital graphics, advertising materials, illustrations, and print designs.",
  modules: [
    { id: "graphic-design-fundamentals", title: "Design fundamentals", summary: "Learn visual hierarchy, balance, contrast, alignment, composition, and other core design principles." },
    { id: "colour-theory", title: "Colour theory", summary: "Choose and combine colours effectively using colour relationships, palettes, and contrast." },
    { id: "typography", title: "Typography", summary: "Select and pair fonts, manage spacing, and create clear typographic hierarchies." },
    { id: "layout-composition", title: "Layout and composition", summary: "Use grids, alignment, whitespace, proportions, and visual flow to organise content." },
    { id: "photoshop", title: "Adobe Photoshop", summary: "Edit images, work with layers and masks, retouch photographs, and create visual compositions." },
    { id: "illustrator", title: "Adobe Illustrator", summary: "Create vector graphics, illustrations, logos, shapes, and scalable visual assets." },
    { id: "indesign", title: "Adobe InDesign", summary: "Design brochures, multipage documents, publications, and professional page layouts." },
    { id: "brand-identity", title: "Brand identity design", summary: "Develop logos, visual identities, brand guidelines, and consistent design systems." },
    { id: "digital-graphics", title: "Digital graphics and advertising", summary: "Create social media posts, banners, promotional graphics, and digital advertisements." },
    { id: "print-design", title: "Print design", summary: "Prepare flyers, posters, business cards, brochures, and other print-ready materials." },
    { id: "illustration-storytelling", title: "Illustration and visual storytelling", summary: "Use illustrations, icons, symbols, and visual metaphors to communicate ideas." },
    { id: "image-preparation", title: "Image preparation and export", summary: "Understand resolution, file formats, colour modes, and export settings for print and digital use." },
    { id: "client-workflow", title: "Client communication and workflow", summary: "Interpret design briefs, present concepts, manage feedback, and prepare final deliverables." },
    { id: "graphic-design-capstone", title: "Graphic design portfolio project", summary: "Develop a brand identity package and coordinated digital and print promotional campaign." },
  ],
  skillsFocus: [
    "Visual communication",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe InDesign",
    "Brand identity design",
    "Digital and print design",
    "Portfolio development",
  ],
},

{
  id: "data-science",
  name: "Data Science",
  category: "Data & Security",
  overview:
    "Learn to collect, clean, analyse, visualise, and model data to discover patterns, communicate insights, and support data-driven decisions.",
  modules: [
    { id: "data-science-fundamentals", title: "Data science fundamentals", summary: "Understand data types, data sources, analytical workflows, and real-world applications of data science." },
    { id: "mathematics-statistics", title: "Mathematics and statistics", summary: "Study descriptive statistics, probability, distributions, correlation, and hypothesis testing." },
    { id: "python-programming", title: "Python programming", summary: "Learn variables, data structures, functions, loops, modules, and error handling in Python." },
    { id: "data-science-tools", title: "Data science tools", summary: "Use Jupyter Notebook, NumPy, and pandas to manipulate and analyse datasets." },
    { id: "data-collection", title: "Data collection", summary: "Gather data from CSV files, spreadsheets, databases, APIs, and other appropriate sources." },
    { id: "data-cleaning", title: "Data cleaning and preparation", summary: "Handle missing values, duplicates, inconsistent records, outliers, and data transformation." },
    { id: "exploratory-data-analysis", title: "Exploratory data analysis", summary: "Summarise datasets, identify patterns, examine relationships, and investigate trends." },
    { id: "data-visualisation", title: "Data visualisation", summary: "Create meaningful charts and graphs using Matplotlib, Seaborn, and other visualisation tools." },
    { id: "sql-data-analysis", title: "SQL for data analysis", summary: "Query databases using filtering, joins, grouping, aggregation, and subqueries." },
    { id: "machine-learning", title: "Machine learning fundamentals", summary: "Understand supervised and unsupervised learning, regression, classification, and clustering." },
    { id: "model-evaluation", title: "Model training and evaluation", summary: "Split datasets, evaluate models, understand overfitting, and interpret appropriate performance metrics." },
    { id: "predictive-analytics", title: "Predictive analytics", summary: "Explore forecasting, trend analysis, and the interpretation of model-generated predictions." },
    { id: "data-ethics", title: "Data ethics and privacy", summary: "Understand data protection, bias, fairness, responsible analysis, and ethical use of information." },
    { id: "data-science-capstone", title: "Practical data science project", summary: "Analyse a real-world dataset, develop visualisations, interpret findings, and present actionable recommendations." },
  ],
  skillsFocus: [
    "Python programming",
    "Statistics and probability",
    "Data cleaning and analysis",
    "SQL",
    "NumPy and pandas",
    "Matplotlib and Seaborn",
    "Machine learning fundamentals",
  ],
},

{
  id: "cybersecurity",
  name: "Cybersecurity",
  category: "Data & Security",
  overview:
    "Learn to protect systems, networks, applications, and information through security fundamentals, vulnerability assessment, monitoring, and incident response.",
  modules: [
    { id: "security-fundamentals", title: "Cybersecurity fundamentals", summary: "Understand confidentiality, integrity, availability, threats, vulnerabilities, and risk management." },
    { id: "networking-fundamentals", title: "Networking fundamentals", summary: "Learn TCP/IP, DNS, DHCP, ports, protocols, routing, and network troubleshooting." },
    { id: "operating-system-security", title: "Operating system security", summary: "Manage Windows and Linux users, permissions, updates, processes, and security settings." },
    { id: "linux-security", title: "Linux security and administration", summary: "Use command-line tools, manage file permissions, inspect logs, and configure basic system security." },
    { id: "cryptography", title: "Cryptography fundamentals", summary: "Understand encryption, hashing, digital signatures, certificates, and public-key infrastructure." },
    { id: "identity-access-management", title: "Identity and access management", summary: "Apply authentication, multifactor authentication, authorisation, and least-privilege access." },
    { id: "network-security", title: "Network security", summary: "Learn firewall rules, network segmentation, secure Wi-Fi, and intrusion detection concepts." },
    { id: "web-application-security", title: "Web application security", summary: "Study common web vulnerabilities, secure authentication, input validation, and secure coding practices." },
    { id: "vulnerability-management", title: "Vulnerability assessment", summary: "Identify assets, perform authorised vulnerability scans, prioritise risks, and recommend remediation." },
    { id: "ethical-hacking", title: "Ethical hacking fundamentals", summary: "Learn authorised reconnaissance, enumeration, controlled security testing, and responsible reporting." },
    { id: "defensive-security", title: "Defensive security and monitoring", summary: "Analyse logs, monitor endpoints, identify suspicious activity, and understand security alerts." },
    { id: "incident-response", title: "Incident response", summary: "Learn incident identification, containment, investigation, recovery, and post-incident review." },
    { id: "digital-forensics", title: "Digital forensics fundamentals", summary: "Understand evidence preservation, file-system analysis, event timelines, and chain of custody." },
    { id: "security-governance", title: "Security governance and compliance", summary: "Develop security policies, conduct risk assessments, and understand privacy and business continuity." },
    { id: "cybersecurity-capstone", title: "Practical cybersecurity project", summary: "Assess a controlled lab environment, document security findings, and recommend corrective measures." },
  ],
  skillsFocus: [
    "Network security",
    "Windows and Linux security",
    "Vulnerability assessment",
    "Ethical hacking fundamentals",
    "Security monitoring",
    "Incident response",
    "Risk assessment and reporting",
  ],
},

{
  id: "devops-engineering",
  name: "DevOps Engineering",
  category: "Infrastructure",
  overview:
    "Learn to automate software delivery, manage infrastructure, deploy applications, and maintain reliable development and production environments.",
  modules: [
    { id: "devops-fundamentals", title: "DevOps fundamentals", summary: "Understand collaboration between development and operations, automation, continuous integration, and continuous delivery." },
    { id: "linux-administration", title: "Linux administration", summary: "Manage files, permissions, processes, services, packages, and users using Linux command-line tools." },
    { id: "git-version-control", title: "Git and version control", summary: "Manage repositories, branches, commits, merges, tags, and collaborative development workflows." },
    { id: "devops-scripting", title: "Scripting and automation", summary: "Automate routine tasks using Bash or Python scripts." },
    { id: "devops-networking", title: "Networking fundamentals", summary: "Understand IP addresses, DNS, ports, HTTP/HTTPS, firewalls, and network troubleshooting." },
    { id: "docker-containers", title: "Docker and containerisation", summary: "Build images, run containers, configure volumes and networks, and manage services with Docker Compose." },
    { id: "ci-cd-pipelines", title: "CI/CD pipelines", summary: "Automate builds, tests, and deployments using pipeline tools such as GitHub Actions." },
    { id: "cloud-fundamentals", title: "Cloud computing fundamentals", summary: "Understand cloud compute, storage, networking, identity, and application deployment." },
    { id: "infrastructure-as-code", title: "Infrastructure as code", summary: "Define and manage repeatable infrastructure configurations using tools such as Terraform." },
    { id: "configuration-management", title: "Configuration management", summary: "Automate system setup and maintain consistent application environments." },
    { id: "kubernetes-fundamentals", title: "Kubernetes fundamentals", summary: "Understand pods, deployments, services, configuration, and container orchestration." },
    { id: "monitoring-logging", title: "Monitoring and logging", summary: "Track application health, collect logs and metrics, configure alerts, and investigate performance issues." },
    { id: "devsecops", title: "DevSecOps and reliability", summary: "Integrate security checks, manage secrets, plan backups, and prepare rollback and incident response procedures." },
    { id: "devops-capstone", title: "Practical DevOps project", summary: "Containerise an application, automate its tests, configure a CI/CD pipeline, and deploy it to a suitable environment." },
  ],
  skillsFocus: [
    "Linux administration",
    "Git and GitHub",
    "Docker and Docker Compose",
    "CI/CD automation",
    "Cloud infrastructure",
    "Terraform fundamentals",
    "Kubernetes fundamentals",
    "Monitoring and deployment",
  ],
},

{
  id: "database-administration",
  name: "Database Administration",
  category: "Infrastructure",
  overview:
    "Learn to design, configure, secure, optimise, back up, and maintain databases that support reliable applications and business operations.",
  modules: [
    { id: "database-fundamentals", title: "Database fundamentals", summary: "Understand database models, database engines, relational concepts, and database architecture." },
    { id: "sql-fundamentals", title: "SQL fundamentals", summary: "Retrieve, insert, update, and delete data using SQL queries." },
    { id: "database-design", title: "Database design and modelling", summary: "Create entity-relationship diagrams, define relationships, and organise data using normalisation." },
    { id: "advanced-sql", title: "Advanced SQL", summary: "Use joins, subqueries, views, stored procedures, triggers, and aggregate queries." },
    { id: "database-integrity", title: "Keys and data integrity", summary: "Apply primary keys, foreign keys, unique constraints, and validation rules to maintain consistent data." },
    { id: "database-platforms", title: "Database administration tools", summary: "Install and manage database systems such as PostgreSQL, MySQL, or Microsoft SQL Server." },
    { id: "database-access-control", title: "Database users and permissions", summary: "Create accounts, manage roles, assign privileges, and enforce access control." },
    { id: "database-performance", title: "Indexing and query optimisation", summary: "Use indexes and execution plans to investigate slow queries and improve database performance." },
    { id: "database-transactions", title: "Transactions and concurrency", summary: "Understand ACID properties, locking, isolation levels, and concurrent database operations." },
    { id: "database-backup-recovery", title: "Backup and recovery", summary: "Plan backups, restore databases, and test recovery procedures." },
    { id: "database-replication", title: "Replication and availability", summary: "Understand database replication, failover concepts, and strategies for improving availability." },
    { id: "database-security", title: "Database security", summary: "Apply least-privilege access, encryption, auditing, and appropriate data protection measures." },
    { id: "database-monitoring", title: "Database monitoring and maintenance", summary: "Monitor database health, storage, resource usage, and performance indicators." },
    { id: "database-capstone", title: "Practical database administration project", summary: "Design, configure, secure, back up, and monitor a database for a school, inventory system, or online store." },
  ],
  skillsFocus: [
    "SQL",
    "Database design and normalisation",
    "PostgreSQL and MySQL",
    "Database security",
    "Query optimisation",
    "Backup and recovery",
    "Database monitoring",
  ],
},

{
  id: "server-administration",
  name: "Server Administration",
  category: "Infrastructure",
  overview:
    "Learn to install, configure, secure, monitor, and maintain servers that host applications, manage networks, and provide essential IT services.",
  modules: [
    { id: "server-fundamentals", title: "Server fundamentals", summary: "Understand server roles, hardware, client-server architecture, and virtualisation." },
    { id: "linux-server-administration", title: "Linux server administration", summary: "Install and manage Linux servers, users, groups, permissions, packages, and services." },
    { id: "windows-server-administration", title: "Windows Server administration", summary: "Explore server installation, administrative tools, server roles, and account management." },
    { id: "server-storage", title: "Server storage management", summary: "Configure disks, partitions, filesystems, storage allocation, and disk monitoring." },
    { id: "server-networking", title: "Server networking", summary: "Configure IP addresses, DNS, DHCP, routing, and network connectivity." },
    { id: "directory-services", title: "Directory services and identity", summary: "Understand centralised user accounts, groups, directory services, and group policies." },
    { id: "web-server-configuration", title: "Web server configuration", summary: "Configure Nginx or Apache, host websites, manage virtual hosts, and troubleshoot web services." },
    { id: "database-server-setup", title: "Database server setup", summary: "Install database services, configure connections, manage permissions, and perform basic maintenance." },
    { id: "server-security", title: "Server security and hardening", summary: "Configure firewalls, apply updates, secure remote access, and manage certificates and permissions." },
    { id: "server-virtualisation", title: "Virtualisation", summary: "Create virtual machines, allocate resources, configure virtual networks, and manage snapshots." },
    { id: "server-backup-recovery", title: "Backup and disaster recovery", summary: "Schedule backups, test restoration, and plan for server failures and service recovery." },
    { id: "server-monitoring", title: "Server monitoring and logs", summary: "Monitor CPU, memory, storage, service availability, system logs, and alerts." },
    { id: "server-automation", title: "Server automation", summary: "Use shell scripts and scheduled jobs to automate routine administration tasks." },
    { id: "cloud-server-deployment", title: "Cloud servers and deployment", summary: "Deploy services to cloud servers, configure secure access, and manage production environments." },
    { id: "server-capstone", title: "Practical server administration project", summary: "Deploy a website, configure DNS and HTTPS, establish backups, and document server security and maintenance." },
  ],
  skillsFocus: [
    "Linux and Windows Server",
    "DNS and DHCP",
    "Web server configuration",
    "Server security",
    "Virtualisation",
    "Backup and recovery",
    "Monitoring and automation",
  ],
},

{
  id: "product-management",
  name: "Product Management",
  category: "Management",
  overview:
    "Learn to identify customer problems, define product strategy, prioritise features, coordinate development, and measure product success.",
  modules: [
    { id: "product-management-fundamentals", title: "Product management fundamentals", summary: "Understand product manager responsibilities, product lifecycles, and business objectives." },
    { id: "market-research", title: "Market research and analysis", summary: "Research competitors, identify market opportunities, and understand customer needs and industry trends." },
    { id: "user-research", title: "Customer and user research", summary: "Conduct interviews, surveys, persona development, and customer journey mapping." },
    { id: "problem-definition", title: "Problem definition and validation", summary: "Define user problems, develop hypotheses, and assess potential product opportunities." },
    { id: "product-strategy", title: "Product vision and strategy", summary: "Establish product goals, positioning, differentiation, and strategic direction." },
    { id: "product-roadmaps", title: "Product roadmaps", summary: "Plan product goals, feature themes, milestones, priorities, and dependencies." },
    { id: "product-requirements", title: "Requirements and user stories", summary: "Write product requirements, user stories, acceptance criteria, and functional specifications." },
    { id: "feature-prioritisation", title: "Feature prioritisation", summary: "Compare opportunities using impact-effort analysis, MoSCoW, and other prioritisation methods." },
    { id: "agile-product-development", title: "Agile product development", summary: "Work with Scrum, Kanban, sprint planning, and cross-functional development teams." },
    { id: "product-prototyping", title: "Prototyping and validation", summary: "Test product assumptions using prototypes, experiments, user feedback, and minimum viable products." },
    { id: "product-analytics", title: "Product analytics and metrics", summary: "Measure adoption, activation, engagement, retention, conversion, and other product performance indicators." },
    { id: "product-launch", title: "Product launch and go-to-market", summary: "Coordinate releases, launch communication, marketing activities, and feedback collection." },
    { id: "stakeholder-management", title: "Stakeholder management", summary: "Communicate with designers, developers, executives, customers, and other stakeholders." },
    { id: "product-optimisation", title: "Product improvement and experimentation", summary: "Use customer feedback, analytics, and A/B testing to improve product experiences." },
    { id: "product-management-capstone", title: "Practical product management project", summary: "Prepare a product strategy, roadmap, requirements document, launch plan, and measurement framework." },
  ],
  skillsFocus: [
    "Product strategy",
    "Market and user research",
    "Roadmap planning",
    "Requirements gathering",
    "Agile methodologies",
    "Product analytics",
    "Stakeholder communication",
  ],
},

{
  id: "project-management",
  name: "Project Management",
  category: "Management",
  overview:
    "Learn to initiate, plan, coordinate, monitor, and close projects while managing timelines, budgets, resources, risks, and stakeholder expectations.",
  modules: [
    { id: "project-management-fundamentals", title: "Project management fundamentals", summary: "Understand project lifecycles, project roles, delivery approaches, and the difference between projects and operations." },
    { id: "project-initiation", title: "Project initiation", summary: "Define objectives, assess feasibility, identify stakeholders, and prepare a project charter." },
    { id: "scope-management", title: "Scope and requirements management", summary: "Define deliverables, gather requirements, create work breakdown structures, and control scope changes." },
    { id: "project-scheduling", title: "Project scheduling", summary: "Plan activities, dependencies, milestones, Gantt charts, and critical paths." },
    { id: "project-budgeting", title: "Cost and budget management", summary: "Estimate costs, establish budgets, track spending, and forecast project expenditure." },
    { id: "resource-management", title: "Resource and team management", summary: "Allocate resources, coordinate responsibilities, balance workloads, and manage team capacity." },
    { id: "project-risk-management", title: "Risk management", summary: "Identify risks, assess likelihood and impact, plan mitigations, and prepare contingency measures." },
    { id: "project-quality", title: "Quality management", summary: "Define acceptance criteria, plan quality assurance, and monitor the quality of project deliverables." },
    { id: "project-communication", title: "Communication and stakeholder management", summary: "Prepare status reports, coordinate meetings, manage expectations, and escalate issues." },
    { id: "agile-project-management", title: "Agile project management", summary: "Apply Scrum, Kanban, sprint planning, iterative delivery, and continuous improvement." },
    { id: "project-management-tools", title: "Project management tools", summary: "Use tools such as Microsoft Project, Trello, Jira, or Asana to track tasks and progress." },
    { id: "change-procurement", title: "Change control and procurement", summary: "Manage change requests, approvals, vendor coordination, and project documentation." },
    { id: "project-monitoring", title: "Monitoring and control", summary: "Track milestones, budgets, risks, performance indicators, and corrective actions." },
    { id: "project-closure", title: "Project closure and evaluation", summary: "Complete handovers, document lessons learned, evaluate outcomes, and close project activities." },
    { id: "project-management-capstone", title: "Practical project management project", summary: "Develop a project charter, schedule, budget, risk register, communication plan, and status report." },
  ],
  skillsFocus: [
    "Project planning and scheduling",
    "Budget and resource management",
    "Risk management",
    "Agile and Scrum",
    "Project management tools",
    "Stakeholder communication",
    "Monitoring and reporting",
  ],
},

{
  id: "computer-studies",
  name: "Computer Studies",
  category: "General IT",
  overview:
    "Build foundational digital skills by learning how computers work, using productivity software, navigating the internet, and solving common computer problems.",
  modules: [
    { id: "computer-fundamentals", title: "Computer fundamentals", summary: "Understand computer hardware, software, input and output devices, storage, and basic computer architecture." },
    { id: "operating-systems", title: "Operating systems", summary: "Navigate Windows, manage settings, organise files and folders, and work with user accounts." },
    { id: "computer-maintenance", title: "Computer maintenance", summary: "Learn about updates, drivers, disk management, backups, and preventive maintenance." },
    { id: "office-productivity", title: "Office productivity tools", summary: "Use Microsoft Word, Excel, PowerPoint, and other productivity applications." },
    { id: "word-processing", title: "Word processing", summary: "Create and format documents using headings, tables, page layouts, references, and mail merge." },
    { id: "spreadsheets", title: "Spreadsheets and data handling", summary: "Use formulas, functions, sorting, filtering, charts, and basic data analysis in spreadsheets." },
    { id: "presentation-skills", title: "Presentation software", summary: "Create organised presentations using layouts, themes, transitions, and appropriate visual elements." },
    { id: "internet-email", title: "Internet and email usage", summary: "Use browsers, search engines, email, downloads, and online collaboration tools effectively." },
    { id: "networking-basics", title: "Networking fundamentals", summary: "Understand local networks, Wi-Fi, routers, IP addresses, and internet connectivity." },
    { id: "digital-literacy", title: "Digital literacy and cloud tools", summary: "Practise online research, file sharing, cloud storage, and digital communication." },
    { id: "cybersecurity-awareness", title: "Cybersecurity awareness", summary: "Recognise phishing, malware, unsafe downloads, weak passwords, and online privacy risks." },
    { id: "programming-introduction", title: "Introduction to programming", summary: "Explore algorithms, flowcharts, logical thinking, and basic programming concepts." },
    { id: "computer-troubleshooting", title: "Computer troubleshooting", summary: "Diagnose common computer, software, printer, and connectivity problems." },
    { id: "digital-ethics", title: "Digital ethics and professionalism", summary: "Understand responsible technology use, copyright, privacy, and workplace digital practices." },
    { id: "computer-studies-capstone", title: "Practical computer skills project", summary: "Prepare a formatted report, spreadsheet analysis, presentation, and basic troubleshooting guide." },
  ],
  skillsFocus: [
    "Computer literacy",
    "Windows operating systems",
    "Microsoft Word, Excel, and PowerPoint",
    "Internet and email usage",
    "Basic networking",
    "Computer troubleshooting",
    "Digital safety",
  ],
},

{
  id: "social-media-marketing",
  name: "Social Media Marketing",
  category: "Marketing",
  overview:
    "Learn to grow brands online through audience research, content creation, social media strategy, paid advertising, community engagement, and campaign analytics.",
  modules: [
    { id: "digital-marketing-fundamentals", title: "Digital marketing fundamentals", summary: "Understand marketing funnels, target audiences, customer needs, and major digital marketing channels." },
    { id: "social-platforms", title: "Social media platforms", summary: "Explore Facebook, Instagram, TikTok, LinkedIn, YouTube, and X and their different audiences." },
    { id: "brand-strategy", title: "Brand strategy and positioning", summary: "Define brand identity, tone of voice, positioning, and audience value propositions." },
    { id: "audience-research", title: "Audience research", summary: "Identify target customers, research their interests, and analyse audience behaviour." },
    { id: "content-strategy", title: "Content strategy", summary: "Develop content pillars, storytelling approaches, educational posts, promotional content, and engagement strategies." },
    { id: "content-calendar", title: "Content calendars and scheduling", summary: "Plan publishing schedules, organise campaigns, and maintain consistent content delivery." },
    { id: "creative-production", title: "Creative content production", summary: "Create social graphics, short-form videos, captions, hashtags, and calls to action." },
    { id: "marketing-copywriting", title: "Marketing copywriting", summary: "Write engaging headlines, persuasive captions, promotional messages, and conversion-focused copy." },
    { id: "community-management", title: "Community management", summary: "Respond to comments and messages, moderate discussions, manage complaints, and maintain brand reputation." },
    { id: "social-media-analytics", title: "Social media analytics", summary: "Measure reach, impressions, engagement, clicks, conversions, and audience growth." },
    { id: "paid-social-advertising", title: "Paid social media advertising", summary: "Understand campaign objectives, audience targeting, budgets, ad creatives, and performance measurement." },
    { id: "social-search-seo", title: "Social search and SEO fundamentals", summary: "Use relevant keywords, hashtags, captions, and discoverability techniques to improve content visibility." },
    { id: "influencer-marketing", title: "Influencer marketing", summary: "Identify suitable creators, prepare collaboration briefs, coordinate campaigns, and measure results." },
    { id: "campaign-reporting", title: "Campaign reporting and optimisation", summary: "Prepare analytics reports, compare campaign performance, and identify opportunities for improvement." },
    { id: "social-media-capstone", title: "Practical social media marketing project", summary: "Develop a brand strategy, content calendar, sample campaign, and performance report for a business." },
  ],
  skillsFocus: [
    "Social media strategy",
    "Content creation",
    "Copywriting",
    "Community management",
    "Paid social advertising",
    "Analytics and reporting",
    "Campaign optimisation",
  ],
},
];

export function hasCurriculumOutline(programme: CurriculumProgramme): boolean {
  return programme.modules.length > 0;
}
