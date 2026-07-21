export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  pullQuote?: string;
};

export type InsightArticle = {
  slug: string;
  category: "Engineering Practice" | "Design Judgment" | "Client Relationships" | "Field Notes";
  label: string;
  title: string;
  excerpt: string;
  readTime: string;
  focus: string;
  sections: ArticleSection[];
};

export const articles: InsightArticle[] = [
  {
    slug: "hidden-cost-of-skipping-engineering",
    category: "Engineering Practice",
    label: "Risk + documentation",
    title: "The Hidden Cost of Skipping Engineering in AV Projects",
    excerpt:
      "Engineering is often scrutinized when budgets tighten. The apparent savings rarely survive contact with the field.",
    readTime: "7 min read",
    focus: "AV engineering services",
    sections: [
      {
        heading: "Engineering prevents expensive field decisions",
        paragraphs: [
          "Every unanswered question in a drawing package eventually gets answered in the field. The problem is that field decisions are usually made under pressure, with installers waiting, schedules moving, and other trades depending on an answer.",
          "Cable pathways, rack allocation, power, network infrastructure, and equipment locations are far easier to resolve while the project team can still coordinate them. A few deliberate engineering hours can prevent days of rework later.",
        ],
        pullQuote: "Every unanswered question in a drawing package eventually gets answered in the field.",
      },
      {
        heading: "Documentation creates a common language",
        paragraphs: [
          "Clear documentation gives architects, contractors, project managers, technicians, and clients the same reference point. Without it, assumptions begin to replace facts.",
          "Those assumptions become RFIs, change orders, schedule impacts, and arguments about scope. Good documentation does more than communicate a system—it reduces the number of opportunities for the project to drift.",
        ],
      },
      {
        heading: "The network cannot be an afterthought",
        paragraphs: [
          "Modern AV systems depend on network infrastructure for video, audio, control, monitoring, conferencing, signage, and management. Waiting until equipment arrives to discuss VLANs, addressing, bandwidth, multicast, or switch capacity turns planning into triage.",
          "A coordinated network design establishes ownership and requirements early enough for the IT and AV teams to succeed together.",
        ],
      },
      {
        heading: "Engineering protects the budget",
        paragraphs: [
          "Engineering does not automatically increase project cost. Done well, it identifies unnecessary complexity, clarifies priorities, and prevents labor from being consumed by troubleshooting and rework.",
          "The best projects are not necessarily the largest. They are the ones that finish with the fewest surprises because important decisions were made while they were still inexpensive to change.",
        ],
      },
    ],
  },
  {
    slug: "standardization-vs-innovation",
    category: "Design Judgment",
    label: "Standards + technology",
    title: "Standardization vs. Innovation: Finding the Sweet Spot",
    excerpt:
      "Standards reduce risk. Curiosity prevents stagnation. Good AV design requires both—and the judgment to know when each matters.",
    readTime: "8 min read",
    focus: "AV system design standards",
    sections: [
      {
        heading: "Standards exist for good reasons",
        paragraphs: [
          "Preferred manufacturers and proven design patterns create consistency. Engineers design faster, estimators gain confidence, technicians build familiarity, and service teams understand the likely failure points.",
          "Clients benefit from predictable results. In a project environment, predictability is not boring—it is valuable risk reduction.",
        ],
      },
      {
        heading: "The danger of what we have always done",
        paragraphs: [
          "Technology changes quickly enough that a once-excellent standard can become a habit long after it stops being the best answer. The question is not whether a familiar product still works. The question is whether it remains the right solution for this project.",
          "Organizations that refuse to evaluate new options eventually standardize around yesterday's constraints.",
        ],
        pullQuote: "Choose a standard because it remains the right answer—not because it is the answer nobody has challenged lately.",
      },
      {
        heading: "Clients should not become beta testers",
        paragraphs: [
          "Innovation also creates risk. Early products can reveal firmware problems, missing features, support gaps, and integration limitations only after they reach real projects.",
          "A new option deserves consideration when it solves a real problem, comes from a manufacturer capable of supporting it, and provides enough value to justify the uncertainty. Excitement alone is not an engineering criterion.",
        ],
      },
      {
        heading: "The right balance is deliberate",
        paragraphs: [
          "Strong integrators build standards around proven solutions while continuously evaluating credible alternatives. They do not refuse change, and they do not chase every launch announcement.",
          "The goal is neither the newest product nor the oldest one. It is the right solution, selected with enough evidence to defend the decision.",
        ],
      },
    ],
  },
  {
    slug: "listening-first-technology-budgets",
    category: "Client Relationships",
    label: "Discovery + budgets",
    title: "Listening First: Aligning Client Needs With Technology Budgets",
    excerpt:
      "A strong AV relationship begins before the equipment list—with honest questions about what matters and what those priorities cost.",
    readTime: "6 min read",
    focus: "AV project discovery",
    sections: [
      {
        heading: "Listening is part of engineering",
        paragraphs: [
          "Every successful AV project starts with a conversation about people, operations, expectations, and constraints—not brands or part numbers.",
          "Understanding what a client is actually trying to accomplish gives the technical team a reason for every design decision that follows.",
        ],
      },
      {
        heading: "Separate must-haves from nice-to-haves",
        paragraphs: [
          "Questions such as what cannot fail, which features will be used daily, and what future changes are likely reveal where investment creates real value.",
          "This does not mean designing down to a budget. It means showing clients how different priorities affect infrastructure, complexity, labor, support, and lifecycle cost.",
        ],
        pullQuote: "Clients do not need to understand every technical detail. They do deserve to understand what their decisions mean.",
      },
      {
        heading: "Translate cost without hiding behind jargon",
        paragraphs: [
          "Rack power, redundancy, network architecture, signal transport, and serviceability can feel abstract. Their cost becomes understandable when connected to uptime, operating effort, installation risk, and the user's experience.",
          "A transparent budget conversation gives clients agency. It replaces a mysterious number with a series of choices they can evaluate.",
        ],
      },
      {
        heading: "Trust is the durable deliverable",
        paragraphs: [
          "When clients feel heard and understand the tradeoffs, projects become more collaborative. They raise concerns earlier, make decisions faster, and are less likely to feel surprised by the result.",
          "The system matters. The relationship that makes an honest system possible matters just as much.",
        ],
      },
    ],
  },
  {
    slug: "field-notes-from-real-projects",
    category: "Field Notes",
    label: "Field notes introduction",
    title: "Field Notes: What Real AV Projects Teach Us",
    excerpt:
      "Why BMT will share anonymized lessons from design rooms, coordination calls, job sites, and commissioning days.",
    readTime: "4 min read",
    focus: "commercial AV lessons learned",
    sections: [
      {
        heading: "Experience is useful when it is shared",
        paragraphs: [
          "Some of the most useful lessons in commercial AV do not begin as standards. They begin as a question nobody asked, an assumption that reached the field, or a small coordination detail that changed the course of a project.",
          "Field Notes will capture those lessons while they are still specific enough to be useful—and then translate them into principles another integrator can apply.",
        ],
      },
      {
        heading: "Protect the project and explain the lesson",
        paragraphs: [
          "These stories are not case studies, client critiques, or opportunities to assign blame. Project names, locations, organizations, and identifying details will be removed or combined where necessary.",
          "The point is the engineering lesson: what made the situation difficult, which question clarified it, and what should be done earlier the next time.",
        ],
        pullQuote: "Protect the client. Explain the lesson. Leave the reader with something useful.",
      },
      {
        heading: "Field-tested does not mean inflexible",
        paragraphs: [
          "A lesson learned on one project is not automatically a universal rule. Context still matters. Field Notes will distinguish between a durable principle and a response that only made sense under a particular set of constraints.",
          "That distinction is where experience becomes judgment rather than folklore.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
