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
  publishedAt: string;
  modifiedAt: string;
  image?: string;
  imageAlt?: string;
  sections: ArticleSection[];
};

export const articles: InsightArticle[] = [
  {
    slug: "ndi-101-video-over-ip",
    category: "Engineering Practice",
    label: "Networked video",
    title: "NDI 101: A Practical Introduction to Video Over IP",
    excerpt:
      "A plain-English introduction to NDI, how it moves video across an IP network, where NDI High Bandwidth and NDI HX differ, and what a dependable system still requires.",
    readTime: "9 min read",
    focus: "NDI video over IP",
    publishedAt: "2026-09-16",
    modifiedAt: "2026-09-16",
    image: "/insights/ndi-101-networked-video.jpg",
    imageAlt: "Professional PTZ camera distributing NDI video through an IP network to multiple production displays.",
    sections: [
      {
        heading: "What is NDI?",
        paragraphs: [
          "NDI stands for Network Device Interface. It allows compatible devices and software to send and receive video, audio, and related information across an IP network. In practical terms, it turns video sources into network resources.",
          "Instead of connecting one camera directly to one production switcher, an NDI camera connects to the network. Other authorized devices and applications can then locate and use that stream. Cameras, computers, production systems, recorders, displays, and conferencing tools can share sources without every connection being a dedicated point-to-point video cable.",
        ],
        pullQuote: "NDI turns video sources into network resources.",
      },
      {
        heading: "A simple NDI workflow",
        paragraphs: [
          "Imagine a venue with three cameras, a production computer, two displays, and a streaming workstation. A traditional system may require a dedicated cable from each camera to the production area, followed by additional distribution equipment for the displays and stream.",
          "With NDI, those cameras and computers can connect to the network. The production system selects the sources it needs, while other compatible devices can access those same sources when appropriate. The network becomes the pathway between devices, and software handles much of the routing.",
          "An NDI stream may also include embedded audio, source identification, tally information, metadata, and camera control. Support varies by product, so the NDI logo is the beginning of the compatibility conversation—not the entire engineering process.",
        ],
      },
      {
        heading: "NDI High Bandwidth and NDI HX",
        paragraphs: [
          "NDI High Bandwidth is intended for high-quality, low-latency production workflows. It uses relatively light compression, helping preserve image quality and timing while requiring meaningful network capacity. It fits environments where production performance is the priority and the network has been designed accordingly.",
          "NDI HX uses more compression to reduce bandwidth. That can make it practical for larger camera counts, remote sources, constrained networks, or devices that cannot generate a High Bandwidth stream. The tradeoff can include additional latency and more dependence on the encoding and decoding capabilities of the equipment.",
          "Neither format is automatically better. A live production may prioritize minimal delay, while a lecture-capture or streaming system may benefit more from reduced bandwidth. The application should choose the format—not the marketing label.",
        ],
      },
      {
        heading: "Why AV teams use NDI",
        paragraphs: [
          "NDI makes sources easier to route, monitor, record, and reuse through software. It can reduce dedicated video cabling, simplify access to cameras and presentation sources, and connect hardware with a wide range of production and streaming applications.",
          "It can also make expansion easier. A new destination may be able to receive an existing source through the network rather than requiring a completely new physical distribution path. That flexibility is especially useful in studios, houses of worship, lecture spaces, sports venues, overflow systems, and facilities with changing production needs.",
          "The important qualifier is network capacity. Moving video onto the network changes the infrastructure requirement; it does not make that requirement disappear.",
        ],
      },
      {
        heading: "The network is part of the AV system",
        paragraphs: [
          "An NDI design should account for stream bandwidth, switch capacity, uplink speeds, network segmentation, discovery, multicast behavior, Quality of Service, security, monitoring, redundancy, and future growth. A few compressed streams may fit comfortably on an existing network. Numerous high-resolution streams may require dedicated switching and faster uplinks.",
          "Port speed alone does not describe the complete path. Multiple streams can converge on an undersized uplink, a switch may lack the internal capacity expected of it, or automatic discovery may fail across network boundaries. Reliable results come from evaluating the route from every source to every destination.",
        ],
        pullQuote: "NDI may simplify video routing, but it makes network design part of the AV design.",
      },
      {
        heading: "Latency still deserves attention",
        paragraphs: [
          "Every digital video system introduces some delay. With NDI, the result depends on the format, resolution, frame rate, camera processing, encoding, decoding, software, network performance, and display processing.",
          "A small delay may be harmless for recording or an online stream. It matters more when a presenter is visible beside a display showing their live image, or when video must remain synchronized with sound in the room. Latency should be tested across the complete signal chain rather than judged from the transport specification alone.",
        ],
      },
      {
        heading: "NDI is one form of AV-over-IP",
        paragraphs: [
          "NDI is an AV-over-IP technology, but AV-over-IP is a broader category. Some platforms are designed primarily to replace matrix switchers in meeting rooms, classrooms, and commercial display systems. NDI grew largely from video production and software-based workflows.",
          "Those categories increasingly overlap, but products still differ in compression, latency, control, security, interoperability, and intended use. Hybrid systems are normal: NDI may serve production cameras while HDMI, SDI, or another AV-over-IP platform handles other sources and destinations.",
          "There is no prize for forcing every signal onto the same transport technology.",
        ],
      },
      {
        heading: "Start with the workflow",
        paragraphs: [
          "Before selecting equipment, define which sources must be available, where they will be viewed or recorded, how many streams may operate simultaneously, the required image quality, acceptable latency, who owns the network, and what should happen when a connection or switch fails.",
          "Those answers determine whether the right approach is NDI High Bandwidth, NDI HX, another AV-over-IP platform, traditional video cabling, or a combination. NDI is valuable because it creates flexibility—not because it removes the need for engineering.",
        ],
        pullQuote: "Choose the transport after defining the workflow, not before.",
      },
    ],
  },
  {
    slug: "ipmx-101-open-av-over-ip-standard",
    category: "Engineering Practice",
    label: "Open AV-over-IP",
    title: "IPMX 101: The Open Standard That Could Reshape AV-over-IP",
    excerpt:
      "IPMX promises standards-based AV-over-IP without locking an entire system to one manufacturer. Here is what it does, who is supporting it, and where it makes sense today.",
    readTime: "12 min read",
    focus: "IPMX open AV-over-IP standard",
    publishedAt: "2026-09-16",
    modifiedAt: "2026-09-16",
    image: "/insights/ipmx-101-open-av-over-ip.jpg",
    imageAlt: "Professional AV sources and displays interconnected through an IPMX media network.",
    sections: [
      {
        heading: "What is IPMX?",
        paragraphs: [
          "AV-over-IP has changed how audiovisual systems are designed. Encoders and decoders can be placed where they are needed, while signals are routed across a network instead of through a fixed HDMI or SDI matrix. One persistent problem remains: most commercial AV-over-IP platforms are proprietary.",
          "IPMX stands for Internet Protocol Media Experience. It is a collection of open standards designed to transport professional video, audio, and control data over Ethernet networks. Its most important goal is interoperability: an encoder from one manufacturer should be able to work with a decoder, processor, or display from another.",
          "IPMX builds on technologies already used in professional broadcast, including SMPTE ST 2110 for media transport, AES67-compatible audio, Precision Time Protocol for synchronization, NMOS for discovery and routing, and JPEG XS for high-quality, low-latency compression. It adds the HDMI metadata, EDID, HDR, content protection, and security behaviors required in commercial AV.",
        ],
        pullQuote: "IPMX is an effort to bring open interoperability from modern broadcast networking into commercial AV.",
      },
      {
        heading: "It is a framework, not another codec",
        paragraphs: [
          "IPMX is sometimes compared directly with individual AV-over-IP products, but it is not one codec or one box. It is a framework that defines how different parts of a media system work together.",
          "An IPMX device may transport uncompressed video or use JPEG XS compression. Audio can be separated from video and routed independently. Devices advertise their capabilities through NMOS and establish connections using standardized methods. That modular design allows products with different capabilities and bandwidth requirements to participate in the same ecosystem.",
        ],
      },
      {
        heading: "Uncompressed video and JPEG XS",
        paragraphs: [
          "Uncompressed video offers excellent image quality and very low latency, but it consumes substantial bandwidth. A 1080p60 signal can require roughly 2.5 Gbps, while uncompressed 4K60 may require approximately 10 to 15 Gbps depending on color sampling and bit depth. Those requirements quickly move endpoints toward 10GbE or 25GbE connections.",
          "JPEG XS is a lightweight compression method built for professional real-time video. It can reduce a 4K signal enough to travel over a much smaller connection while maintaining very high image quality and extremely low latency. This makes it one of the most important pieces of IPMX for commercial AV.",
          "Designers still need to verify the exact profile, image quality, latency, and bitrate supported by every product. A stream that technically fits on a 1GbE port may leave very little room for overhead, additional media, or real-world operating margin.",
        ],
      },
      {
        heading: "Why an open standard matters",
        paragraphs: [
          "A proprietary platform generally ties the endpoints, management tools, feature roadmap, and replacement options to one manufacturer. If a product is discontinued or no longer fits the client's needs, changing vendors can mean replacing much more of the system than one device.",
          "A mature IPMX ecosystem could let designers select the best product for each function. It offers the potential for more manufacturer choice, less long-term lock-in, easier expansion, independent audio and video routing, and better integration between presentation and broadcast systems.",
          "Open does not mean identical. Products will still differ in supported resolutions, bandwidth, compression profiles, security, processing, and control features. Certification and careful product selection remain essential.",
        ],
        pullQuote: "Interoperability creates options, but it does not replace engineering.",
      },
      {
        heading: "Is IPMX ready today?",
        paragraphs: [
          "For several years, IPMX was discussed more often than it was deployed. That is changing. The Alliance for IP Media Solutions now operates an IPMX certification program and maintains a registry of certified products.",
          "Manufacturers and technology developers participating in the ecosystem include Matrox Video, PlexusAV, Evertz, Cobalt Digital, Panasonic, Barco, NovaStar, Bridge Technologies, intoPIX, Adeas-Nextera, and Macnica. Their products range from HDMI and SDI gateways to production switchers, high-density routing, test equipment, LED processing, and the codec technology used inside other manufacturers' devices.",
          "The market is still weighted toward broadcast, production, processing, and gateway equipment. There are fewer inexpensive wall-plate encoders and compact display decoders than integrators are accustomed to finding in established proprietary product families. IPMX is real and deployable, but it is not yet the automatic choice for every meeting room, restaurant, or small commercial system.",
        ],
      },
      {
        heading: "The network is part of the system",
        paragraphs: [
          "The phrase standard Ethernet can create the wrong impression. A large IPMX system cannot simply be attached to any switch with open ports. The design may require nonblocking switching capacity, multicast management, PTP-aware switching, appropriate Quality of Service, adequate packet buffers, high-speed uplinks, monitoring, and carefully planned redundancy.",
          "Bandwidth must be calculated across the entire path. Multicast prevents an encoder from creating a separate stream for every receiver, but it does not eliminate traffic. If ten different 1Gbps streams must cross an uplink, that link still needs to carry approximately 10Gbps of video before overhead and engineering margin are considered.",
          "Timing is equally important. PTP synchronizes media across the network, so grandmasters, clock domains, switch behavior, and failure modes belong in the design—not on a list of items to figure out during commissioning.",
        ],
        pullQuote: "Standard Ethernet does not mean any Ethernet switch will do.",
      },
      {
        heading: "Where IPMX makes sense",
        paragraphs: [
          "Auditoriums and multipurpose venues can use IPMX to share presentation sources and cameras between the in-room AV system and a live-production workflow. Enterprise and university campuses can use it as a common media backbone between studios, briefing rooms, training spaces, auditoriums, control rooms, and athletic facilities.",
          "Control rooms are a natural fit because they often combine high-quality video, KVM extension, multiviewing, video walls, and redundant network paths. Large arenas, casinos, resorts, and sportsbooks may also benefit from centralized sources, independent audio routing, and a standards-based path between distribution and production systems.",
          "For smaller and price-sensitive projects, established proprietary AV-over-IP platforms may still offer lower-cost endpoints, simpler commissioning, more mature control modules, and a broader selection of wall plates and specialty devices.",
        ],
      },
      {
        heading: "Control and redundancy",
        paragraphs: [
          "NMOS provides standardized discovery and connection management, but it does not need to become the operator interface. A Crestron, Q-SYS, or web-based control system can present familiar source names, destinations, room modes, presets, route status, and device faults while requesting IPMX connections behind the scenes.",
          "Critical systems can use SMPTE ST 2022-7 seamless protection switching. A transmitter sends duplicate streams over independent network paths, and the receiver reconstructs the output from the valid packets. True redundancy requires separate switches, interfaces, paths, and failure domains. Two VLANs on one switch provide organization, not redundancy.",
        ],
      },
      {
        heading: "Plan for IPMX without deploying it everywhere",
        paragraphs: [
          "A project can prepare for IPMX without buying a complete IPMX system today. High-speed single-mode or appropriate multimode fiber, 10GbE- or 25GbE-capable switching, multicast planning, PTP-aware infrastructure, sufficient uplink capacity, and space for future gateways create a practical migration path.",
          "For most smaller integrators, IPMX should be treated as a credible option rather than a universal replacement for every proprietary platform. It deserves serious consideration in broadcast and commercial AV crossover spaces, large auditoriums, enterprise campuses, arenas, control rooms, large-format display systems, and facilities with long expected service lives.",
          "The goal is not to specify the newest acronym. The goal is to give the client a reliable system with better choices, a sensible upgrade path, and fewer expensive surprises later.",
        ],
        pullQuote: "Become IPMX-aware now, specify it selectively, and prepare long-life infrastructure for what comes next.",
      },
    ],
  },
  {
    slug: "how-to-read-av-drawings",
    category: "Engineering Practice",
    label: "Drawings + coordination",
    title: "How to Read Commercial AV Drawings",
    excerpt:
      "A practical method for reading AV plans, reflected ceiling plans, system diagrams, rack elevations, schedules, and details as one coordinated package.",
    readTime: "9 min read",
    focus: "how to read AV drawings",
    publishedAt: "2026-08-21",
    modifiedAt: "2026-08-21",
    sections: [
      {
        heading: "Start with the drawing set, not a single sheet",
        paragraphs: [
          "Commercial AV drawings rarely tell the whole story on one page. Floor plans locate devices, reflected ceiling plans coordinate overhead equipment, system diagrams describe signal flow, rack elevations organize equipment, and schedules define the identifiers and attributes that connect those views.",
          "Begin with the cover sheet, drawing index, abbreviations, symbols, general notes, and revision information. Confirm the issue date and project phase before relying on any detail. A perfectly interpreted superseded sheet is still the wrong answer.",
        ],
        pullQuote: "Read the package as a coordinated system, not as a collection of unrelated sheets.",
      },
      {
        heading: "Use device identifiers as cross-references",
        paragraphs: [
          "A device tag such as DSP-01, CAM-02, or SPK-14 should connect the device across plans, diagrams, elevations, and schedules. Trace one identifier through the set to learn how that project's documentation is organized before trying to understand the entire system at once.",
          "If an identifier appears on a plan but not in the schedule or system diagram, record the discrepancy. Do not quietly invent the missing connection. Good drawing review turns ambiguity into an explicit coordination question while it is still inexpensive to answer.",
        ],
      },
      {
        heading: "Follow signal flow and cable information deliberately",
        paragraphs: [
          "On system diagrams, arrows and connector labels indicate how audio, video, control, network, and power relationships are intended to work. Line styles are project-specific, so use the legend rather than assuming every dashed line means the same thing.",
          "Check cable type, source and destination labels, port information, pathway notes, and any references to risers or details. For networked AV, distinguish a physical network connection from the logical services it requires, such as VLAN assignment, multicast behavior, addressing, clocking, control, or device management.",
        ],
      },
      {
        heading: "Check plans against architecture and other trades",
        paragraphs: [
          "An AV device location is only buildable when it agrees with the room layout, ceiling type, structure, millwork, power, data, pathways, lighting, mechanical systems, and accessibility requirements. Compare AV plans and reflected ceiling plans with the current architectural and consultant backgrounds.",
          "Pay particular attention to mounting heights, clearances, service access, sightlines, loudspeaker coverage intent, microphone placement, projector throw, display backing, rack ventilation, conduit routing, and ownership boundaries. These are common places for an apparently simple symbol to hide a field problem.",
        ],
      },
      {
        heading: "Read notes, schedules, details, and specifications together",
        paragraphs: [
          "General notes establish rules that may apply to every sheet. Keynotes explain local conditions. Schedules provide device-specific information. Details show how an installation is expected to be supported or finished. Specifications may define workmanship, approved products, testing, labeling, submittals, and closeout requirements that are not repeated graphically.",
          "When information conflicts, do not select whichever instruction is easiest to build. Confirm the governing contract documents and use the project's formal clarification process. Drawings communicate design intent; they do not eliminate the need for coordination and professional judgment.",
        ],
      },
      {
        heading: "Use a repeatable review sequence",
        paragraphs: [
          "First confirm the revision and scope. Then trace each room or system from plan location to signal path, rack position, infrastructure, power, network, control, and mounting detail. Finally, compare the result with the equipment schedule, specifications, and adjacent trades.",
          "Mark questions with the sheet number, detail, device identifier, and the exact decision required. A useful RFI is specific enough that the response can be incorporated into the drawings and communicated to the field without another round of interpretation.",
        ],
        pullQuote: "The goal is not merely to understand the lines. It is to find the decisions the project still needs.",
      },
    ],
  },
  {
    slug: "8-ohm-vs-70v-speakers",
    category: "Design Judgment",
    label: "Audio distribution",
    title: "8-Ohm vs. 70V Speakers for Commercial AV Systems",
    excerpt:
      "How low-impedance and 70V distributed loudspeaker systems differ—and how coverage, cable distance, amplifier loading, level control, and performance shape the right choice.",
    readTime: "9 min read",
    focus: "8 ohm vs 70V speakers",
    publishedAt: "2026-08-21",
    modifiedAt: "2026-08-21",
    sections: [
      {
        heading: "The difference is the distribution architecture",
        paragraphs: [
          "A low-impedance loudspeaker presents a nominal load—commonly 4, 8, or 16 ohms—to an amplifier channel. The designer must account for the combined impedance, wiring topology, cable resistance, amplifier capability, and the power required by every connected loudspeaker.",
          "A 70V system uses an amplifier designed for constant-voltage distribution and transformers at the loudspeakers. Each transformer tap represents an intended power draw. The connected tap values are added, design margin is applied, and the amplifier is selected to support that total load.",
        ],
        pullQuote: "Neither architecture is automatically better. Each solves a different distribution problem.",
      },
      {
        heading: "Why 70V works well for distributed commercial audio",
        paragraphs: [
          "Constant-voltage distribution makes it practical to connect many loudspeakers across long cable runs without calculating a complicated series-parallel impedance network. Individual transformer taps also make it straightforward to allocate different power levels to different spaces or loudspeaker locations.",
          "That makes 70V a common choice for paging, background music, corridors, retail areas, hospitality spaces, offices, classrooms, and other systems where consistent coverage across many loudspeakers matters more than delivering high power to a small number of cabinets.",
      ],
      },
      {
        heading: "Where low-impedance systems are often the better fit",
        paragraphs: [
          "Low-impedance connections are common where each amplifier channel serves one loudspeaker or a carefully engineered group and the design calls for higher output, wider bandwidth, lower-frequency extension, or more precise control. Examples can include performance systems, cinemas, foreground music, stage monitoring, and dedicated subwoofers.",
          "This does not mean every low-impedance system sounds better, or every 70V system is limited to speech. Loudspeaker quality, transformer design, enclosure, processing, coverage, placement, amplifier headroom, and commissioning all affect the result. Architecture alone does not determine fidelity.",
        ],
      },
      {
        heading: "Size the amplifier from the actual design",
        paragraphs: [
          "For a 70V system, add the selected transformer taps—not merely the maximum tap printed on each loudspeaker—and include appropriate headroom based on the program material, operating expectations, and amplifier manufacturer's guidance. Confirm that the selected taps can deliver the required sound pressure level at the listener positions.",
          "For a low-impedance system, verify the resulting load against the amplifier's rated operating range and consider cable resistance, channel allocation, expected crest factor, limiting, and thermal conditions. Avoid treating nominal impedance as a fixed resistance; loudspeaker impedance varies with frequency.",
        ],
      },
      {
        heading: "Coverage usually matters more than the label on the terminal",
        paragraphs: [
          "A successful distributed system begins with coverage, mounting height, listener distance, room noise, reverberation, required level, and intelligibility. The number and placement of loudspeakers should follow those requirements. The distribution architecture then supports the resulting design.",
          "Using fewer, louder loudspeakers simply to reduce device count can create uneven coverage and excessive level variation. Using more loudspeakers without checking tap settings and amplifier capacity creates a different failure. The math and the acoustic intent need to agree.",
        ],
        pullQuote: "Choose the architecture after defining coverage and performance—not before.",
      },
      {
        heading: "A practical selection rule",
        paragraphs: [
          "Use 70V when the system needs many distributed loudspeakers, long runs, straightforward load calculation, and flexible local power allocation. Consider low impedance when the design needs dedicated amplifier channels, higher power, specialized loudspeakers, subwoofers, or tighter performance control.",
          "Hybrid designs are normal. A facility may use 70V ceiling loudspeakers for paging and background music while using low-impedance loudspeakers and subwoofers in presentation or performance spaces. The right answer follows the operational requirement instead of forcing the entire project into one topology.",
        ],
      },
    ],
  },
  {
    slug: "hidden-cost-of-skipping-engineering",
    category: "Engineering Practice",
    label: "Risk + documentation",
    title: "The Hidden Cost of Skipping Engineering in AV Projects",
    excerpt:
      "Engineering is often scrutinized when budgets tighten. The apparent savings rarely survive contact with the field.",
    readTime: "7 min read",
    focus: "AV engineering services",
    publishedAt: "2026-07-21",
    modifiedAt: "2026-07-21",
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
    publishedAt: "2026-07-21",
    modifiedAt: "2026-07-21",
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
    publishedAt: "2026-07-21",
    modifiedAt: "2026-07-21",
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
    publishedAt: "2026-07-21",
    modifiedAt: "2026-07-21",
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
