import additionalLessons from "./additional-lessons.json";

export type LessonSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  graphic?: "layers" | "physical" | "switch" | "subnet" | "services" | "time" | "vlan" | "route" | "multicast" | "qos" | "wifi" | "security" | "identity";
};

export type Lesson = {
  markdown?: string;
  number: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  readTime: string;
  publishedAt: string;
  objectives: string[];
  sections: LessonSection[];
  examples: { title: string; text: string }[];
  glossary: { term: string; definition: string }[];
  exercise: { title: string; prompt: string };
  review: { question: string; answer: string }[];
  next: string;
};

export const lessons: Lesson[] = [
  {
    number: 1,
    slug: "how-networks-move-information",
    title: "How Networks Move Information",
    shortTitle: "Network fundamentals",
    description: "Start with the purpose of a network, the jobs performed by endpoints and switches, and the vocabulary that makes everything else easier.",
    readTime: "8 min",
    publishedAt: "2026-10-08",
    objectives: [
      "Describe a network as a system for moving information between endpoints.",
      "Distinguish a switch, router, endpoint, link, protocol, and service.",
      "Separate physical connectivity from logical communication.",
      "Follow a packet through a simple commercial AV system.",
    ],
    sections: [
      {
        heading: "A network is an agreement",
        paragraphs: [
          "A network is not just a pile of switches and cables. It is a collection of devices agreeing on how to identify one another, package information, move it, verify it, and respond when something goes wrong.",
          "A Q-SYS Core, Dante amplifier, control processor, laptop, and camera are all endpoints. Each generates or consumes information. The network provides a path between them, while protocols provide the shared rules that make the information understandable.",
          "That distinction matters because a cable can be connected and link lights can be blinking while communication still fails. Physical connectivity answers whether a path exists. Logical connectivity answers whether the devices can actually use it.",
        ],
        graphic: "layers",
      },
      {
        heading: "The basic jobs",
        paragraphs: [
          "A switch connects devices inside a local network and forwards Ethernet frames toward the correct destination. A router connects different IP networks. An endpoint originates or receives traffic. A service performs a useful job such as DHCP address assignment, DNS name resolution, or NTP time synchronization.",
          "Protocols are the rules. Ethernet, IP, TCP, UDP, DHCP, DNS, PTP, and HTTP each solve a different part of the communication problem. No single protocol is the network; they work as a stack.",
        ],
        bullets: [
          "Link: the physical or wireless connection between devices.",
          "Frame: the Layer 2 container moved by Ethernet switches.",
          "Packet: the Layer 3 container routed between IP networks.",
          "Application data: the actual control command, audio sample, video data, or webpage content being transported.",
        ],
      },
      {
        heading: "Follow the message, not the box",
        paragraphs: [
          "When troubleshooting, begin with the desired conversation: which device is sending, which device should receive, what protocol is used, and what path lies between them? Then test each dependency in order.",
          "This is more reliable than staring at the most expensive device in the rack and hoping it confesses. A communication failure can come from power, cabling, port configuration, addressing, routing, name resolution, authentication, or the application itself.",
        ],
      },
    ],
    examples: [
      { title: "Control command", text: "A touchscreen sends a command through an access switch to a control processor. Ethernet moves it locally; IP identifies the devices; the control protocol defines what the command means." },
      { title: "AV-over-IP route", text: "An encoder creates media traffic, switches forward it across the required links, and a decoder reconstructs it. Discovery, clocking, multicast, and control may each use different supporting protocols." },
    ],
    glossary: [
      { term: "Endpoint", definition: "A device that originates or consumes network communication." },
      { term: "Protocol", definition: "A defined set of communication rules." },
      { term: "Switch", definition: "A device that forwards Ethernet frames inside a Layer 2 network." },
      { term: "Router", definition: "A device that forwards packets between different IP networks." },
      { term: "Service", definition: "A network-accessible function such as DHCP, DNS, NTP, or a web interface." },
    ],
    exercise: { title: "Trace one conversation", prompt: "Choose one real AV action—pressing volume up, selecting a source, or subscribing a Dante receiver. Name the sender, receiver, physical path, and every network service you think the action depends on." },
    review: [
      { question: "Can link lights prove that two applications can communicate?", answer: "No. They confirm part of the physical connection, not addressing, routing, security, or application behavior." },
      { question: "What is the basic difference between a switch and a router?", answer: "A switch forwards frames within a Layer 2 network; a router forwards packets between IP networks." },
      { question: "Why do networks use multiple protocols?", answer: "Each protocol solves a different job, and the protocols work together as a stack." },
    ],
    next: "The OSI and TCP/IP models give us a dependable way to locate each of those jobs.",
  },
  {
    number: 2,
    slug: "osi-and-tcp-ip-models",
    title: "The OSI and TCP/IP Models",
    shortTitle: "The seven-layer map",
    description: "Use the seven-layer model as a troubleshooting map—not certification trivia—and connect each layer to familiar AV equipment and failures.",
    readTime: "10 min",
    publishedAt: "2026-10-09",
    objectives: [
      "Name the seven OSI layers and the practical job of each.",
      "Relate the OSI model to the simpler TCP/IP model.",
      "Place common AV protocols and failures at the appropriate layers.",
      "Use bottom-up troubleshooting without becoming trapped by the model.",
    ],
    sections: [
      {
        heading: "A model, not a machine",
        paragraphs: [
          "The OSI model divides network communication into seven conceptual layers. Your packet does not physically stop at seven little departments. The model gives engineers a common vocabulary for describing where a function or failure belongs.",
          "The TCP/IP model groups the same work into fewer layers. Real products do not always fit perfectly into either diagram, and that is fine. Their value is helping us ask the next useful question.",
        ],
        graphic: "layers",
      },
      {
        heading: "The layers from the cable upward",
        paragraphs: [
          "Layer 1 is Physical: copper, fiber, radio, connectors, light levels, link speed, and electrical signaling. Layer 2 is Data Link: Ethernet frames, MAC addresses, switching, VLAN tags, and link-local discovery. Layer 3 is Network: IP addresses, subnets, gateways, and routing.",
          "Layer 4 is Transport: primarily TCP and UDP. TCP emphasizes reliable, ordered delivery; UDP minimizes overhead and delay. Layers 5 through 7 describe sessions, representation, and applications. In day-to-day IT work, those upper layers are often discussed together as the application layer.",
        ],
        bullets: [
          "7 Application — services visible to software and users",
          "6 Presentation — data format, encoding, compression, encryption",
          "5 Session — establishing and maintaining conversations",
          "4 Transport — TCP/UDP delivery behavior and port numbers",
          "3 Network — IP addressing and routing",
          "2 Data Link — Ethernet, MAC addresses, switching, VLANs",
          "1 Physical — signals, media, connectors, optics, and radio",
        ],
      },
      {
        heading: "Troubleshoot from evidence",
        paragraphs: [
          "Bottom-up troubleshooting starts with power and the physical path, then progresses through link, VLAN, addressing, routing, and the application. This prevents an engineer from changing multicast settings when the fiber is dark.",
          "Do not treat the order as a religion. If logs show an expired certificate, start at the application and security layer. The model organizes evidence; it does not replace judgment.",
        ],
      },
    ],
    examples: [
      { title: "Decoder has no link", text: "Start at Layer 1: PoE, patching, copper certification, SFP type, polarity, and optical level. There is no reason to debug IP addressing until the link exists." },
      { title: "Web interface works, video does not", text: "Layers 1–3 may be healthy. Investigate transport and application requirements such as multicast membership, stream format, clocking, bandwidth, or authorization." },
    ],
    glossary: [
      { term: "OSI", definition: "Open Systems Interconnection; the seven-layer conceptual network model." },
      { term: "TCP/IP", definition: "The practical protocol suite and simpler layered model used by modern IP networks." },
      { term: "TCP", definition: "A connection-oriented transport protocol with ordered delivery and retransmission." },
      { term: "UDP", definition: "A connectionless transport protocol with low overhead and no built-in retransmission." },
    ],
    exercise: { title: "Place the fault", prompt: "A camera links at 1 Gbps, receives the expected IP address, answers a ping, and opens its webpage, but its video stream never appears. List the layers already supported by evidence and the higher-layer items you would test next." },
    review: [
      { question: "Which layer contains VLAN tags and MAC addresses?", answer: "Layer 2, the Data Link layer." },
      { question: "Which layer contains IP addressing and routing?", answer: "Layer 3, the Network layer." },
      { question: "Does a working ping prove an AV application works?", answer: "No. It supports basic Layer 3 reachability but does not test every transport, security, timing, or application requirement." },
    ],
    next: "We go all the way down to Layer 1: copper, fiber, SFPs, link speed, and PoE.",
  },
  {
    number: 3,
    slug: "copper-fiber-sfps-and-poe",
    title: "Copper, Fiber, SFPs, and PoE",
    shortTitle: "The physical layer",
    description: "Understand what the link lights are sitting on: copper categories, multimode and single-mode fiber, transceivers, optical diagnostics, and PoE budgets.",
    readTime: "12 min",
    publishedAt: "2026-10-09",
    objectives: [
      "Choose the appropriate copper or fiber medium for a link.",
      "Interpret OM and OS fiber designations without treating them as port speeds.",
      "Explain the roles of SFP modules and DOM diagnostics.",
      "Distinguish PoE type, class, source output, and device power.",
    ],
    sections: [
      {
        heading: "The medium defines the first boundary",
        paragraphs: [
          "Copper Ethernet carries electrical signals and may also carry power. Fiber carries light, is immune to electromagnetic interference, supports longer distances, and electrically isolates the connected equipment. Neither is universally better; the application, distance, bandwidth, environment, and service strategy decide.",
          "A 1000BASE-T copper link is normally designed around a 100-meter channel limit. Higher speeds may impose stricter cabling requirements. Fiber distance depends on the Ethernet optic, wavelength, fiber type, connector loss, splices, and the complete optical budget—not the jacket label alone.",
        ],
        graphic: "physical",
      },
      {
        heading: "OM and OS are fiber categories",
        paragraphs: [
          "OM3, OM4, and OM5 are laser-optimized multimode fiber categories. OS2 is the common indoor/outdoor single-mode category. These labels describe the fiber's performance; they do not assign one fixed data rate.",
          "OM3 commonly supports 10GbE to 300 meters and 40/100GbE to roughly 100 meters using common parallel optics. OM4 extends those typical distances to about 400 meters for 10GbE and 150 meters for common 40/100GbE parallel links. OS2 can support Ethernet links over kilometers when paired with the appropriate single-mode optics.",
          "Always verify the exact Ethernet standard and optic datasheet. A fiber category tells you what the glass can support; the transceivers define the actual link.",
        ],
      },
      {
        heading: "SFPs and DOM",
        paragraphs: [
          "An SFP-family module converts the switch's electrical interface into the signaling required by copper or fiber. The module must match the port, speed, wavelength, fiber type, connector, and optic at the opposite end.",
          "DOM means Digital Optical Monitoring, also called DDM by some manufacturers. A DOM-capable optic can report transmit power, receive power, temperature, supply voltage, and laser bias current. Receive power is especially useful: it turns 'the fiber seems weird' into an actual measured optical level that can be compared with the module's specified operating range.",
        ],
      },
      {
        heading: "PoE is negotiated power",
        paragraphs: [
          "Power over Ethernet uses a PSE, such as a switch, to detect and classify a PD, such as a camera or touchscreen, before applying normal operating power. The switch's maximum output is higher than the guaranteed power available at the endpoint because the cable consumes some energy.",
          "The four modern PoE types reach approximately 15.4 W, 30 W, 60 W, and 90 W at the PSE. The commonly quoted guaranteed PD values are 12.95 W, 25.5 W, 51 W, and 71.3 W. Device class provides a more detailed power request inside those types. A switch also has a total chassis power budget, so enough capable ports do not guarantee enough simultaneous wattage.",
        ],
      },
    ],
    examples: [
      { title: "Remote AV rack", text: "Use fiber between buildings or distant IDFs for reach, EMI immunity, and electrical isolation. Record fiber type, strand count, connector, optic standard, and estimated loss on the drawings." },
      { title: "PoE-heavy room", text: "Cameras, touchpanels, speakers, and encoders may all link successfully while the switch lacks enough aggregate PoE budget. Schedule each device's expected draw and preserve headroom." },
    ],
    glossary: [
      { term: "MMF / SMF", definition: "Multimode fiber / single-mode fiber." },
      { term: "OM / OS", definition: "Optical multimode and optical single-mode fiber categories." },
      { term: "SFP", definition: "Small Form-factor Pluggable transceiver." },
      { term: "DOM/DDM", definition: "Digital optical diagnostics reported by a compatible transceiver." },
      { term: "PSE / PD", definition: "Power sourcing equipment and powered device in a PoE system." },
    ],
    exercise: { title: "Read one real port", prompt: "Open a managed switch and inspect one active fiber port and one PoE port. Record negotiated speed, optic type, receive power if DOM is available, PoE class, actual draw, and the switch's remaining PoE budget." },
    review: [
      { question: "Does OM4 mean the link automatically runs at 100 Gbps?", answer: "No. OM4 describes the fiber. The port and matched transceivers establish the Ethernet speed." },
      { question: "What DOM value is most immediately useful for a questionable fiber link?", answer: "Received optical power, compared with the optic's supported range." },
      { question: "Why is a 90 W PoE switch port not the same as 90 W at the device?", answer: "Some power is lost in the cable, so the guaranteed power at the PD is lower." },
    ],
    next: "With the physical link established, we move up to Ethernet frames, MAC addresses, switching, and LLDP.",
  },
  {
    number: 4,
    slug: "ethernet-mac-addresses-switching-and-lldp",
    title: "Ethernet, MAC Addresses, Switching, and LLDP",
    shortTitle: "How a switch learns",
    description: "See what a switch actually reads, how it learns device locations, when it floods traffic, and how LLDP reveals neighboring equipment.",
    readTime: "11 min",
    publishedAt: "2026-10-10",
    objectives: [
      "Identify the important fields and purpose of an Ethernet frame.",
      "Explain how a switch builds and uses its MAC address table.",
      "Distinguish unicast, broadcast, and multicast destination behavior.",
      "Use LLDP information during documentation and troubleshooting.",
    ],
    sections: [
      {
        heading: "The Ethernet envelope",
        paragraphs: [
          "An Ethernet frame wraps higher-layer information with source and destination MAC addresses, a type or length field, optional VLAN information, and an error-detection value. Switches primarily use the destination MAC address to decide where a frame should go.",
          "A MAC address identifies a network interface at Layer 2. It is commonly written as six hexadecimal pairs. It is not the same as an IP address: MAC addresses support local Ethernet delivery, while IP addresses support logical addressing and routing.",
        ],
        graphic: "switch",
      },
      {
        heading: "A switch learns from source addresses",
        paragraphs: [
          "When a frame enters a port, the switch records the source MAC address and associates it with that port and VLAN. When a later frame is addressed to that MAC, the switch forwards it only toward the learned port.",
          "If the destination is unknown, the switch floods the frame within that VLAN. Broadcast frames are also flooded within the VLAN. Learned entries age out, so a device that moves can eventually be relearned on a different port.",
        ],
        bullets: [
          "Known unicast: forward toward the learned destination port.",
          "Unknown unicast: flood within the VLAN while the destination is unknown.",
          "Broadcast: deliver throughout the VLAN.",
          "Multicast: treatment depends on multicast configuration such as IGMP snooping.",
        ],
      },
      {
        heading: "LLDP is the neighbor introduction",
        paragraphs: [
          "LLDP stands for Link Layer Discovery Protocol. A device advertises facts about itself to its directly connected neighbor, potentially including system name, port identity, management address, capabilities, and power information.",
          "LLDP does not discover the entire route across a network. It describes the device on the other end of a direct link. That makes it excellent for validating switch-to-switch uplinks, identifying an endpoint on a mystery port, and documenting what is actually connected.",
        ],
      },
    ],
    examples: [
      { title: "Finding a mislabeled decoder", text: "Look up the decoder's MAC address in the switch table, identify the learned port, and compare LLDP neighbor data and patching against the drawings." },
      { title: "Redundant Dante interfaces", text: "Primary and secondary interfaces have different MAC addresses and must land on the intended isolated networks. The MAC table provides hard evidence of where each interface actually appears." },
    ],
    glossary: [
      { term: "MAC", definition: "Media Access Control address; a Layer 2 interface identifier." },
      { term: "Frame", definition: "The unit of information transported by Ethernet." },
      { term: "Flooding", definition: "Forwarding a frame to multiple ports when required or when the destination is unknown." },
      { term: "LLDP", definition: "Link Layer Discovery Protocol; direct-neighbor advertisement." },
      { term: "FCS", definition: "Frame Check Sequence used to detect frame corruption." },
    ],
    exercise: { title: "Build a three-device map", prompt: "Choose three AV endpoints. Record their MAC addresses, IP addresses, switch ports, and LLDP system names. Compare the result with the port labels and network drawing." },
    review: [
      { question: "What does a switch learn from an incoming Ethernet frame?", answer: "It learns the source MAC address and associates it with the incoming port and VLAN." },
      { question: "What happens to an unknown unicast frame?", answer: "The switch normally floods it within the relevant VLAN until it learns the destination." },
      { question: "Does LLDP show every device across the routed network?", answer: "No. LLDP describes directly connected neighbors at Layer 2." },
    ],
    next: "Next we add Layer 3: IPv4 addresses, subnet masks, local versus remote destinations, and default gateways.",
  },
  {
    number: 5,
    slug: "ipv4-subnets-and-gateways",
    title: "IPv4 Addresses, Subnets, and Gateways",
    shortTitle: "Who is local?",
    description: "Learn how an endpoint decides whether a destination is local, what a subnet mask really does, and when the default gateway becomes involved.",
    readTime: "12 min",
    publishedAt: "2026-10-10",
    objectives: [
      "Separate an IP address into network and host portions.",
      "Interpret common CIDR prefixes such as /24, /23, /25, and /16.",
      "Determine whether two addresses are in the same subnet.",
      "Explain exactly when an endpoint uses its default gateway.",
    ],
    sections: [
      {
        heading: "An address plus a boundary",
        paragraphs: [
          "An IPv4 address alone is incomplete. The subnet mask—or CIDR prefix—tells the endpoint which bits identify the network and which identify a host inside that network.",
          "In 172.16.20.45/24, the /24 means the first 24 bits identify the network. The network is 172.16.20.0, the traditional broadcast address is 172.16.20.255, and the ordinary host range is 172.16.20.1 through 172.16.20.254.",
        ],
        graphic: "subnet",
      },
      {
        heading: "Local or remote is a calculation",
        paragraphs: [
          "Before sending an IP packet, an endpoint applies its subnet mask to its own address and the destination address. If the resulting network portions match, the destination is local. The sender resolves the destination's MAC address and sends directly.",
          "If the network portions differ, the destination is remote. The endpoint still creates a packet addressed to the final remote IP, but the local Ethernet frame is addressed to the default gateway's MAC address. The router then forwards the packet toward the remote network.",
          "This is why an incorrect mask can create bizarre partial communication. Two devices may each reach some neighbors while disagreeing about whether another address is local or remote.",
        ],
      },
      {
        heading: "Useful subnet sizes",
        paragraphs: [
          "A /24 provides 256 total addresses and traditionally 254 ordinary host addresses. A /25 divides that space into two blocks of 128 addresses. A /23 combines two adjacent /24-sized ranges. A /16 contains 65,536 total addresses and is usually much larger than an AV VLAN should be.",
          "More addresses are not automatically better. Larger broadcast domains increase the reach of broadcasts and make failures harder to contain. Choose subnets from endpoint count, growth, platform behavior, operational boundaries, and multicast design—not because /16 is easy to remember.",
        ],
      },
    ],
    examples: [
      { title: "Control VLAN", text: "A processor at 172.16.20.10/24 and touchscreen at 172.16.20.50/24 communicate locally. Their gateway is irrelevant to that direct conversation." },
      { title: "Commissioning laptop", text: "A laptop at 172.16.30.200/24 cannot directly reach a device at 172.16.20.50/24. It needs a route through a gateway and a policy permitting the traffic." },
    ],
    glossary: [
      { term: "IPv4", definition: "A 32-bit logical addressing system written as four decimal octets." },
      { term: "Subnet", definition: "A defined IP network whose members share a network prefix." },
      { term: "CIDR", definition: "Prefix notation such as /24 describing how many address bits define the network." },
      { term: "Gateway", definition: "The router an endpoint uses to reach remote networks." },
      { term: "Broadcast address", definition: "The address traditionally used to reach all hosts in an IPv4 subnet." },
    ],
    exercise: { title: "Make the local/remote decision", prompt: "For a device at 192.168.40.70/24, classify 192.168.40.200, 192.168.41.20, and 8.8.8.8 as local or remote. Then identify which conversations require the gateway." },
    review: [
      { question: "Does an endpoint use its gateway to reach another device in the same subnet?", answer: "No. It resolves the local destination and sends directly." },
      { question: "What does /24 mean?", answer: "The first 24 bits of the address identify the network portion." },
      { question: "Why can a wrong subnet mask cause partial connectivity?", answer: "The endpoint may make incorrect local-versus-remote decisions for only part of the address range." },
    ],
    next: "Now we fill in the supporting services: ARP, DHCP, DNS, NTP, and the sharper clocking provided by PTP.",
  },
  {
    number: 6,
    slug: "arp-dhcp-dns-and-network-time",
    title: "ARP, DHCP, DNS, and Network Time",
    shortTitle: "The supporting services",
    description: "Connect names and IP addresses to Ethernet delivery, see how automatic addressing works, and separate ordinary clock setting from precision media synchronization.",
    readTime: "13 min",
    publishedAt: "2026-10-11",
    objectives: [
      "Explain how ARP connects IPv4 addresses to local MAC addresses.",
      "Follow the basic DHCP address-assignment exchange.",
      "Distinguish DNS name resolution from discovery protocols.",
      "Separate NTP wall-clock time from PTP media clock synchronization.",
    ],
    sections: [
      {
        heading: "ARP completes local delivery",
        paragraphs: [
          "An endpoint may know the local destination's IP address but still needs a destination MAC address for the Ethernet frame. ARP asks the local network which interface owns that IPv4 address. The owner replies, and the result is temporarily cached.",
          "For a remote destination, the sender does not ARP for the remote host. It ARPs for its default gateway, because that is the next Ethernet destination on the local network.",
        ],
        graphic: "services",
      },
      {
        heading: "DHCP supplies a usable configuration",
        paragraphs: [
          "A new DHCP client begins without a usable IPv4 configuration. The familiar sequence is Discover, Offer, Request, and Acknowledge—often shortened to DORA. The resulting lease can include an IP address, subnet mask, gateway, DNS servers, lease duration, and other options.",
          "Because the initial client does not yet know its network, DHCP begins with broadcasts. A DHCP relay can forward those requests to a server in another subnet. If the wrong DHCP server answers, devices may receive perfectly valid information for the wrong network.",
        ],
      },
      {
        heading: "DNS translates names; it does not find everything",
        paragraphs: [
          "DNS translates names such as av-core.example.com into IP addresses and can provide other records. It is a hierarchical service that may operate well beyond the local VLAN.",
          "Product discovery is often different. Dante, AirPlay, printers, and other platforms may use multicast DNS, proprietary broadcasts, or dedicated discovery services. Successful DNS resolution therefore does not prove that an AV management application will discover its endpoints across VLANs.",
        ],
      },
      {
        heading: "NTP and PTP solve different timing problems",
        paragraphs: [
          "NTP keeps computers, logs, certificates, schedules, and control systems close to ordinary clock time. PTP distributes much more precise timing for synchronized media clocks.",
          "Native Dante commonly uses PTPv1, while AES67, Q-LAN, and many broadcast systems use PTPv2 profiles. PTP version and PTP domain number are separate concepts. Multiple PTP versions or numbered domains can coexist on a VLAN, but devices synchronize only with a compatible version, profile, and domain.",
        ],
        graphic: "time",
      },
    ],
    examples: [
      { title: "Wrong DHCP scope", text: "An encoder links correctly but receives a corporate address rather than an AV address. Inspect the access VLAN, DHCP relay, and competing DHCP servers before changing the encoder." },
      { title: "Clocked but undiscovered", text: "AES67 devices may share PTP timing while a controller still cannot discover or route them. Clock synchronization, discovery, and control are separate services." },
    ],
    glossary: [
      { term: "ARP", definition: "Address Resolution Protocol; maps a local IPv4 address to a MAC address." },
      { term: "DHCP", definition: "Dynamic Host Configuration Protocol; leases IP configuration to clients." },
      { term: "DNS", definition: "Domain Name System; resolves names and related records." },
      { term: "NTP", definition: "Network Time Protocol; ordinary network clock synchronization." },
      { term: "PTP", definition: "Precision Time Protocol; high-accuracy clock synchronization used by time-sensitive systems." },
    ],
    exercise: { title: "Inspect the supporting evidence", prompt: "On a computer connected to an AV network, record its DHCP-provided address, mask, gateway, and DNS server. Inspect the ARP or neighbor table, then identify the NTP server and any PTP leader shown by the AV platform." },
    review: [
      { question: "For a remote IP destination, whose MAC address does the sender need first?", answer: "The local default gateway's MAC address." },
      { question: "What information can DHCP provide besides an IP address?", answer: "Common options include the subnet mask, gateway, DNS servers, and lease duration." },
      { question: "Are PTPv1, PTPv2, and PTP domain 2 the same kind of label?", answer: "No. v1 and v2 are protocol versions; the domain number identifies a logical clock community within a compatible PTP implementation." },
    ],
    next: "Next we divide a physical switching system into intentional Layer 2 boundaries using VLANs, access ports, and trunks.",
  },
  {
    number: 7,
    slug: "vlans-access-ports-and-trunks",
    title: "VLANs, Access Ports, and Trunks",
    shortTitle: "One switch, several networks",
    description: "Learn how VLANs create separate Layer 2 networks, how endpoints receive untagged traffic, and how trunks carry several VLANs over one link.",
    readTime: "12 min",
    publishedAt: "2026-10-12",
    objectives: [
      "Describe a VLAN as a separate Layer 2 broadcast domain.",
      "Distinguish access ports from trunk ports.",
      "Explain tagged traffic, untagged traffic, PVIDs, and native VLANs.",
      "Trace one VLAN from an endpoint across a switch uplink.",
    ],
    sections: [
      {
        heading: "One physical switch can act like several",
        paragraphs: [
          "A VLAN—Virtual Local Area Network—divides switching infrastructure into separate Layer 2 broadcast domains. Devices in different VLANs behave as though they are attached to different switches, even when they occupy adjacent physical ports.",
          "VLAN numbers are labels, not IP networks. A clean design may pair VLAN 20 with 172.16.20.0/24, but that is an administrative convention. Routing is still required when traffic needs to cross from one VLAN and subnet to another.",
        ],
        graphic: "vlan",
      },
      {
        heading: "Access ports hide the tags",
        paragraphs: [
          "An access port normally connects an ordinary endpoint to one VLAN. The endpoint sends and receives ordinary untagged Ethernet frames. The switch associates incoming untagged traffic with the configured access VLAN.",
          "The PVID—Port VLAN Identifier—is the VLAN assigned to incoming untagged traffic. Many switch interfaces set the access VLAN, PVID, and untagged membership together. Others expose them as separate controls.",
        ],
      },
      {
        heading: "Trunks carry several VLANs",
        paragraphs: [
          "A trunk commonly connects switches, routers, firewalls, wireless access points, or virtualization hosts. An 802.1Q tag identifies the VLAN belonging to each frame, allowing several logical networks to share one physical link.",
          "The same VLAN may therefore be untagged toward an endpoint and tagged across every infrastructure uplink. Both ends of the trunk must agree about the allowed VLANs and about any VLAN carried untagged.",
        ],
        bullets: [
          "Access port: normally one untagged endpoint VLAN.",
          "Trunk: multiple VLANs, normally tagged.",
          "PVID: classification applied to incoming untagged frames.",
          "Native VLAN: a VLAN intentionally carried untagged on a trunk.",
        ],
      },
      {
        heading: "Native VLAN mismatches are sneaky",
        paragraphs: [
          "If one switch treats untagged trunk traffic as VLAN 10 while the other treats it as VLAN 20, the link may remain up while traffic quietly enters the wrong network. DHCP, management, and discovery failures can appear inconsistent because only the untagged VLAN is affected.",
          "A practical BMT standard is to document every trunk's allowed VLANs and tagging state. When supported, tagging all operational VLANs across infrastructure links removes one category of ambiguity.",
        ],
      },
    ],
    examples: [
      { title: "Dante plus control", text: "A DSP control interface can use an access port in VLAN 20 while its Dante interface uses an access port in VLAN 30. Both VLANs cross the switch uplink as tagged traffic." },
      { title: "A tag-aware AV endpoint", text: "A Visionary Solutions Duet-5 encoder can act as a VLAN-aware endpoint instead of an ordinary access-port device. Its LAN1 connection can carry tagged video traffic, Dante/AES67 audio, and a separate network assigned to the LAN2 expansion port—up to three VLANs over one physical switch connection. With tagging disabled, video, audio, control, and anything plugged into LAN2 share the same flat VLAN. That can place Dante on the wrong network and let an unauthorized device plugged into the expansion port land directly on the video network. With tagging enabled, the encoder sorts each traffic type into its configured VLAN, but the connected switch port must be configured as a trunk with the same VLAN IDs permitted and tagged. This is a useful example of an endpoint that understands 802.1Q tags itself." },
      { title: "One SSID, several roles", text: "A wireless AP can assign users or private passphrases to different VLANs while transporting them over one trunk. Vendors call this PPSK, DPSK, MPSK, or similar names." },
    ],
    glossary: [
      { term: "VLAN", definition: "Virtual LAN; a separate Layer 2 broadcast domain." },
      { term: "802.1Q", definition: "The Ethernet VLAN-tagging standard." },
      { term: "Access port", definition: "A port normally presenting one untagged VLAN to an endpoint." },
      { term: "Trunk", definition: "A link carrying multiple VLANs, usually with tags." },
      { term: "PVID", definition: "The VLAN assigned to an incoming untagged frame." },
    ],
    exercise: { title: "Trace the VLAN path", prompt: "Pick one AV endpoint and trace its VLAN from endpoint port to every uplink and finally to the gateway. Record where the VLAN is untagged, where it is tagged, and whether every trunk explicitly permits it." },
    review: [
      { question: "Does a normal endpoint need to understand VLAN tags on an access port?", answer: "Usually not. The switch adds or removes the required VLAN association." },
      { question: "Can one VLAN be tagged on a trunk and untagged on an endpoint port?", answer: "Yes. Tagging describes how frames appear on a particular link." },
      { question: "Do VLANs automatically prevent routed communication?", answer: "No. Routers, ACLs, and firewall policies determine what may cross between VLANs." },
    ],
    next: "Next: inter-VLAN routing, gateways, ACLs, and firewalls—how boundaries become controlled communication paths.",
  },
  {
    number: 8,
    slug: "routing-acls-and-firewalls",
    title: "Routing, ACLs, and Firewalls",
    shortTitle: "Controlled paths between networks",
    description: "Follow a packet across VLAN boundaries, separate routing from permission, and decide whether a router, firewall, or Layer 3 switch should own each gateway.",
    readTime: "15 min",
    publishedAt: "2026-10-12",
    objectives: [
      "Explain why communication between VLANs requires a Layer 3 device.",
      "Follow a packet from an endpoint through its default gateway to another subnet.",
      "Distinguish a route from an ACL or stateful firewall policy.",
      "Decide when a Layer 3 switch should—and should not—own VLAN gateways.",
      "Prevent duplicate gateways, bypass paths, and accidental inter-VLAN routing.",
    ],
    sections: [
      {
        heading: "Switch locally; route remotely",
        paragraphs: [
          "A Layer 2 switch forwards Ethernet frames inside one VLAN. A router forwards IP packets between different networks. When an endpoint applies its subnet mask and determines that a destination is local, it ARPs for the destination device. When the destination is remote, it ARPs for the default gateway instead.",
          "Suppose a control processor at 172.16.20.50 needs an encoder at 172.16.40.60. The processor sends an IP packet addressed to the encoder inside an Ethernet frame addressed to the VLAN 20 gateway. The router removes that frame, consults its routing table, and creates a new Ethernet frame on VLAN 40. The IP source and destination normally remain the same; the Layer 2 addresses change at the routed hop.",
          "A router may be a dedicated appliance, a firewall, a Layer 3 switch, or a virtual network function. On a Layer 3 switch, the gateway for a VLAN is commonly an SVI or VE—a logical IP interface attached to that VLAN.",
        ],
        graphic: "route",
      },
      {
        heading: "A route is a path, not permission",
        paragraphs: [
          "A routing table answers where a packet should go. It does not necessarily answer whether the packet should be allowed to go there. If inter-VLAN routing is enabled without restrictions, the VLANs are organized but may not be meaningfully secured.",
          "An ACL—Access Control List—matches characteristics such as source, destination, protocol, and TCP or UDP port, then permits or denies the packet. Rule order and direction matter, and many platforms finish with an implicit deny. Document the required conversation in plain language before translating it into a vendor's syntax.",
          "A traditional ACL is often stateless: it evaluates packets independently. A stateful firewall remembers active sessions. If a management computer initiates HTTPS to an encoder, a stateful firewall can permit the encoder's replies without allowing the encoder to initiate arbitrary new connections toward the computer.",
        ],
        bullets: [
          "Route: identifies the next path toward a destination network.",
          "ACL: permits or denies traffic matching defined packet fields.",
          "Stateful firewall: evaluates policy and remembers established conversations.",
          "Least privilege: permit only the initiators, destinations, services, and directions the system requires.",
        ],
      },
      {
        heading: "The Layer 3 switch decision",
        paragraphs: [
          "A switch with Layer 3 capability can route enormous amounts of east-west traffic in hardware. That is useful in a large campus, production facility, or high-bandwidth media network when forcing every internal packet through a smaller firewall would create a bottleneck. It can also keep local services operating if the upstream security appliance is unavailable.",
          "The tradeoff is policy visibility. A firewall usually provides stronger session awareness, logging, application controls, remote-access integration, NAT, and easier security administration. For smaller AV systems, letting the firewall or router own the VLAN gateways generally creates one obvious enforcement point. Use Layer 3 switching when its performance or resilience solves a documented problem—not merely because the command exists.",
          "Ruckus FastIron router firmware is a good example: the image makes routing features available, but it does not require the ICX to become the system router. Keep only one management VE when the switch should remain Layer 2. Carry operational VLANs over tagged trunks and let the external router own their gateway addresses. Creating IP-addressed VEs in multiple VLANs gives the switch directly connected Layer 3 networks and can create an unintended path around the firewall.",
        ],
      },
      {
        heading: "Avoid gateway conflicts and bypass paths",
        paragraphs: [
          "Each VLAN needs deliberate gateway ownership. If both a firewall subinterface and a switch VE are configured with 172.16.20.1, they create a duplicate-IP conflict: ARP responses may alternate, connectivity becomes unstable, and the resulting symptoms can look random. Giving them different addresses—such as .1 and .2—avoids the duplicate but can still create two routing paths if some endpoints use one and some use the other.",
          "That second condition is especially dangerous when the firewall is supposed to enforce policy. A device manually configured to use the Layer 3 switch as its gateway may bypass the firewall. Return traffic can also take a different path from outbound traffic, creating asymmetric routing that breaks stateful inspection.",
          "Prevent this with a gateway-ownership schedule: identify one device and one gateway address for every VLAN. Do not configure VEs on access switches unless they serve a documented purpose. If several VEs are unavoidable, use ACLs or isolated VRFs and verify that they cannot become alternate gateways. Deliberate first-hop redundancy such as VRRP is different: multiple devices cooperate around one documented virtual gateway instead of accidentally competing.",
        ],
        bullets: [
          "One documented gateway owner per VLAN unless a designed redundancy protocol is used.",
          "One management VE is enough for an access switch that should not route user traffic.",
          "Endpoint gateway settings must point to the intended router or firewall.",
          "Check for duplicate IPs, alternate VEs, unexpected connected routes, and asymmetric paths during commissioning.",
        ],
      },
      {
        heading: "Document conversations, not vague access",
        paragraphs: [
          "Do not ask IT to open the AV VLAN. Create a communication matrix identifying the initiating device or subnet, destination, protocol, destination port, purpose, and whether broadcast or multicast discovery is also required. Direct control can route successfully while discovery fails because those are separate traffic flows.",
          "A useful acceptance test proves both the permitted path and the denied path. Verify that the control processor can reach the encoder on the required service, that replies return correctly, and that a guest or expansion-port device cannot initiate connections into the AV networks.",
        ],
      },
    ],
    examples: [
      { title: "Control across VLANs", text: "A processor in VLAN 20 initiates HTTPS or a vendor control session to an encoder in VLAN 40. The router provides the path; the firewall policy permits only the required initiator, destination, protocol, and service. Direct control may work even when local discovery does not cross the boundary." },
      { title: "Ruckus ICX as Layer 2 transport", text: "An ICX running router firmware has one management VE in VLAN 99. VLANs 20, 30, and 40 exist only at Layer 2 on the switch and cross a tagged uplink. The firewall owns .1 in every operational subnet, so all inter-VLAN traffic reaches the intended policy point." },
      { title: "When the core should route", text: "A large media facility may place gateway SVIs on a high-capacity Layer 3 core to keep heavy internal flows off a smaller firewall. ACLs constrain east-west access, while internet, remote-access, and higher-risk boundaries still traverse the firewall. The decision is based on measured bandwidth and security requirements." },
    ],
    glossary: [
      { term: "Router", definition: "A device or function that forwards IP packets between networks." },
      { term: "Routing table", definition: "The known destination networks and the next path toward each one." },
      { term: "SVI / VE", definition: "A logical Layer 3 interface associated with a VLAN; vendors use different names." },
      { term: "ACL", definition: "An ordered set of packet-matching permit and deny rules." },
      { term: "Stateful firewall", definition: "A policy device that tracks active conversations and their return traffic." },
      { term: "Asymmetric routing", definition: "A condition where the forward and return paths differ, potentially bypassing or confusing stateful devices." },
      { term: "VRRP", definition: "A first-hop redundancy protocol that presents one virtual gateway through multiple coordinated routers." },
    ],
    exercise: { title: "Name the gateway owner", prompt: "Choose three VLANs from a real project. For each one, record its subnet, intended gateway address, physical device that owns the gateway, every other IP-addressed VE or SVI in that VLAN, and the policy controlling traffic to the other two VLANs. Any undocumented alternate gateway is a finding." },
    review: [
      { question: "Does a VE automatically mean the switch must be the network's router?", answer: "No. A single management VE lets the switch behave as an IP endpoint. Multiple IP-addressed VEs can make it a routing path, depending on the platform and configuration." },
      { question: "What happens if a firewall and switch VE both use the same gateway IP?", answer: "They create a duplicate-IP conflict. Their ARP responses compete, producing unstable and unpredictable connectivity." },
      { question: "Why can two different gateway addresses still be a security problem?", answer: "Endpoints may use the less-restricted gateway, bypassing the intended firewall and possibly creating asymmetric routing." },
    ],
    next: "Next: multicast, IGMP snooping, and the querier—how one source reaches many receivers without turning every switch port into a fire hose.",
  },
  {
    number: 9,
    slug: "multicast-igmp-and-the-querier",
    title: "Multicast, IGMP, and the Querier",
    shortTitle: "One stream, selected receivers",
    description: "See how one source reaches many receivers, how switches learn which ports need each stream, and why snooping without a querier eventually gets weird.",
    readTime: "15 min",
    publishedAt: "2026-10-13",
    objectives: [
      "Distinguish unicast, broadcast, and multicast delivery.",
      "Explain the separate jobs performed by IGMP, IGMP snooping, and the querier.",
      "Follow one multicast stream from an encoder to selected receiver ports.",
      "Explain why snooping tables require an active querier.",
      "Identify practical multicast checks for AV commissioning.",
    ],
    sections: [
      {
        heading: "One sender, several interested receivers",
        paragraphs: [
          "With unicast, a source sends a separate copy to each receiver. A 700 Mbps encoder feeding ten decoders could therefore require 7 Gbps from the encoder. With multicast, the encoder sends one stream to a multicast group address and the network duplicates it only where paths branch toward interested receivers.",
          "A multicast address such as 239.10.10.50 identifies a group, not a physical device. The source does not need a list of every decoder. Receivers join the group when they want the stream and leave when they no longer need it.",
        ],
        graphic: "multicast",
      },
      {
        heading: "IGMP manages receiver membership",
        paragraphs: [
          "IGMP—Internet Group Management Protocol—does not carry the audio or video. It carries membership information. A decoder sends a membership report that effectively says it wants traffic for a particular multicast group.",
          "IGMPv2 supports ordinary group joins and leaves and remains common in commercial AV. IGMPv3 adds source filtering, which allows Source-Specific Multicast: a receiver can request group G specifically from source S. Seeing IGMPv3 in a switch configuration does not prove that every endpoint or AV platform is using SSM.",
        ],
      },
      {
        heading: "Snooping controls Layer 2 forwarding",
        paragraphs: [
          "A Layer 2 switch cannot learn multicast destinations through the ordinary unicast MAC-learning process. Without multicast awareness, it may flood a stream throughout the VLAN, including toward control processors, touchpanels, printers, or wireless access points that never requested it.",
          "IGMP snooping lets the switch observe membership reports and build a table of multicast groups and interested ports. The switch then forwards each stream only toward its receivers and any required inter-switch or router ports.",
        ],
        bullets: [
          "IGMP: receivers report which groups they want.",
          "IGMP snooping: switches learn which Layer 2 ports lead to those receivers.",
          "Multicast routing: a separate function that carries multicast between IP networks.",
        ],
      },
      {
        heading: "The querier keeps membership state alive",
        paragraphs: [
          "A receiver can disappear without sending a leave message. The IGMP querier periodically asks which memberships are still required. Active receivers respond, switches refresh their snooping tables, and stale entries eventually age out.",
          "Snooping without an active querier may appear to work initially. Later, memberships can expire and behavior becomes platform-dependent: streams may stop, flood, or change unpredictably. That is why 'IGMP snooping enabled' is not a complete commissioning result.",
          "The querier does not have to be the default gateway. A Layer 3-capable switch can often provide the querier function while an external firewall remains the VLAN gateway. Multiple querier-capable devices may participate in an election, but BMT should document the intended active device, its address, and any deliberate backup.",
        ],
      },
      {
        heading: "Membership belongs to a VLAN",
        paragraphs: [
          "IGMP snooping decisions are maintained per VLAN. A receiver in one VLAN cannot join a source in another through Layer 2 snooping alone. Crossing that boundary requires multicast routing, a proxy, or an application-specific gateway.",
          "For many smaller AV systems, the cleanest design keeps high-bandwidth multicast sources and receivers together while routing management and control normally. Discovery must be documented separately because control, discovery, clocking, and media may use different traffic flows.",
        ],
      },
    ],
    examples: [
      { title: "AV-over-IP channel selection", text: "A decoder selects an encoder and sends an IGMP report for that encoder's group. The access switch adds the decoder port, while the core forwards the stream only toward access switches containing interested receivers." },
      { title: "Dante multicast audio", text: "A deliberately created Dante multicast flow feeds several amplifiers. IGMP snooping limits the audio to the required ports, while clocking and discovery may still use their own multicast traffic." },
      { title: "The mystery flood", text: "A network has snooping enabled but no querier. Initial joins work, then tables age out and large streams reach unrelated ports. A 100 Mbps controller begins dropping packets even though the controller itself is healthy." },
    ],
    glossary: [
      { term: "Multicast", definition: "One transmitted stream delivered to a group of interested receivers." },
      { term: "IGMP", definition: "The IPv4 protocol receivers use to report multicast-group membership." },
      { term: "IGMP snooping", definition: "Layer 2 switch behavior that learns group membership by observing IGMP messages." },
      { term: "Querier", definition: "The device that periodically asks receivers to renew their memberships." },
      { term: "SSM", definition: "Source-Specific Multicast; membership identifies both the source and group." },
      { term: "Flooding", definition: "Forwarding traffic toward many or all ports in a VLAN." },
    ],
    exercise: { title: "Follow one stream", prompt: "Choose one multicast encoder and subscribed decoder. Record the source IP, group address, decoder switch port, snooping-table entry, active querier address, and what changes when the decoder selects another source. Confirm that an unsubscribed port is not receiving the media stream." },
    review: [
      { question: "Does IGMP snooping create multicast memberships?", answer: "No. Receivers request membership with IGMP; snooping lets switches observe those requests and build port-level forwarding state." },
      { question: "Why is the querier needed after receivers join?", answer: "Devices can disappear without sending leaves. Queries renew active memberships and allow stale entries to age out." },
      { question: "Must the IGMP querier be the VLAN's default gateway?", answer: "No. A switch may provide the querier function while a separate router or firewall remains the gateway." },
    ],
    next: "Next: QoS, latency, jitter, and packet loss—why spare average bandwidth does not guarantee clean real-time media.",
  },
  {
    number: 10,
    slug: "qos-latency-jitter-and-packet-loss",
    title: "QoS, Latency, Jitter, and Packet Loss",
    shortTitle: "Protecting real-time traffic",
    description: "Learn why available bandwidth does not guarantee clean media, how packets are prioritized, and what QoS can—and absolutely cannot—fix.",
    readTime: "15 min",
    publishedAt: "2026-10-14",
    objectives: [
      "Distinguish bandwidth, latency, jitter, and packet loss.",
      "Explain why low average utilization does not rule out congestion.",
      "Understand classification, DSCP, 802.1p/PCP, queues, and trust boundaries.",
      "Explain why packet markings matter only when the network honors them.",
      "Establish useful QoS documentation and commissioning checks.",
    ],
    sections: [
      {
        heading: "Bandwidth is capacity, not performance",
        paragraphs: [
          "A 1 Gbps link describes capacity. It does not reveal short bursts, time spent in switch buffers, dropped packets, or whether a critical packet is waiting behind a large transfer.",
          "Several encoders can transmit at nearly the same moment and briefly exceed an outgoing interface's line rate. Packets collect in its buffer and are discarded if the buffer fills. A five-minute utilization graph may still look comfortable. This short-duration congestion is called a microburst.",
          "Oversubscription occurs when the possible incoming load exceeds an outgoing link. Document endpoint speeds, stream rates, simultaneous flows, traffic paths, uplink capacity, and headroom—not just the switch port count.",
        ],
        graphic: "qos",
      },
      {
        heading: "Latency is the total travel time",
        paragraphs: [
          "Latency includes processing, propagation, serialization, and queuing delay. A device must inspect a packet; the interface must place every bit on the wire; the signal must travel; and the packet may have to wait behind other traffic.",
          "A 1,500-byte packet contains roughly 12,000 bits before additional Ethernet overhead. Serialization alone takes about 120 microseconds at 100 Mbps, 12 microseconds at 1 Gbps, and 1.2 microseconds at 10 Gbps. Within a building, variable queuing and device processing often matter more than propagation distance.",
        ],
      },
      {
        heading: "Jitter is inconsistent delay",
        paragraphs: [
          "Jitter is variation in packet arrival time. Real-time receivers use a buffer to release unevenly arriving packets at a steady rate. A larger buffer tolerates more variation but adds latency; a smaller buffer reduces latency but gives the network less room for error.",
          "That is why a lower Dante latency setting is not automatically better. The correct setting is one the complete path can meet consistently, including every switch hop and congested interface.",
        ],
      },
      {
        heading: "Packet loss misses the deadline",
        paragraphs: [
          "Packets may be lost because of congested queues, bad links, failing optics, wireless interference, endpoint overload, multicast errors, or loops. TCP can request missing data again, but real-time UDP media often cannot wait for retransmission.",
          "The receiver may conceal the loss, repeat old information, mute, freeze, show artifacts, or drop the frame. Increasing error, discard, queue-drop, or late-packet counters is evidence; 'it feels networky' remains more of a spiritual diagnosis.",
        ],
      },
      {
        heading: "QoS is a complete handling chain",
        paragraphs: [
          "QoS classifies traffic, marks it, decides where markings are trusted, maps each class into a hardware queue, and schedules those queues during contention. If the interface is idle, priority and ordinary packets both leave immediately.",
          "DSCP is a six-bit Layer 3 marking in the IP header. Dante commonly uses DSCP 56 for time-critical PTP event traffic and 46 for real-time audio, but every platform's current guidance must be verified. PCP is the three-bit priority field in an 802.1Q tag and exists only while that Ethernet frame is tagged.",
          "A marking is only a label. Every switch in the path must trust or intentionally rewrite it, map it to the intended queue, and schedule that queue correctly. Strict priority is useful for small amounts of critical traffic, but misplacing a large stream there can starve everything below it.",
        ],
        bullets: [
          "Classify the traffic.",
          "Mark it with DSCP or PCP where appropriate.",
          "Define the trust boundary.",
          "Map markings into hardware queues.",
          "Schedule and monitor the queues under load.",
        ],
      },
      {
        heading: "QoS cannot repeal math",
        paragraphs: [
          "If two sustained 700 Mbps streams must cross a 1 Gbps uplink, QoS cannot fit 1.4 Gbps through the pipe. It may protect clock and control packets, but some video must queue or drop.",
          "The real correction may be a faster uplink, lower stream rates, fewer simultaneous flows, different source placement, or an appropriate link-aggregation design. QoS decides who goes first during contention; it does not manufacture capacity.",
        ],
      },
    ],
    examples: [
      { title: "Dante clock and audio", text: "PTP uses little bandwidth but is highly delay-sensitive. Audio uses more bandwidth but has a configured latency allowance. Confirm the endpoint markings, queue mappings, trunk behavior, and late-packet counters across the entire path." },
      { title: "AV-over-IP uplink", text: "A remote access switch has a 1 Gbps uplink while two 700 Mbps video streams need to cross it. Priority can protect control and clocking, but the sustained oversubscription still requires an architectural fix." },
      { title: "Q-SYS mixed traffic", text: "A Q-SYS deployment can include PTP, real-time audio, control, camera video, management, and corporate data. Marking the entire AV VLAN as highest priority defeats classification; apply the platform's current traffic-class guidance consistently." },
    ],
    glossary: [
      { term: "Bandwidth", definition: "The maximum data-carrying capacity of a link." },
      { term: "Latency", definition: "Time required for data to travel from source to destination." },
      { term: "Jitter", definition: "Variation in packet-arrival delay." },
      { term: "Packet loss", definition: "Packets that fail to reach the receiver in usable time." },
      { term: "DSCP", definition: "A Layer 3 traffic-class marking in an IP packet." },
      { term: "PCP", definition: "The three-bit priority marking inside an 802.1Q tag." },
      { term: "Trust boundary", definition: "The point where the network accepts or rewrites endpoint markings." },
      { term: "Microburst", definition: "A brief traffic burst capable of filling an interface buffer despite low average utilization." },
    ],
    exercise: { title: "Follow the priority", prompt: "Choose one real-time AV endpoint. Record its required DSCP values, whether the access switch trusts them, their hardware-queue mappings, whether uplinks preserve them, and the interface or queue-drop counters during normal operation." },
    review: [
      { question: "Can QoS solve a sustained 1.4 Gbps load on a 1 Gbps uplink?", answer: "No. It can protect important traffic, but the sustained load must be reduced or the link upgraded." },
      { question: "What is the difference between DSCP and a switch queue?", answer: "DSCP is a label in the packet. The switch must map that label to a queue and give the queue appropriate service." },
      { question: "Why can low average utilization still produce packet loss?", answer: "Short microbursts can exceed an outgoing interface's capacity and fill its buffers between monitoring samples." },
    ],
    next: "Next: Wi-Fi fundamentals—channels, airtime, roaming, and why a screen full of signal bars does not prove a healthy wireless network.",
  },
  {
    number: 11,
    slug: "wifi-channels-airtime-and-roaming",
    title: "Wi-Fi Fundamentals: Channels, Airtime, and Roaming",
    shortTitle: "The shared radio network",
    description: "Understand channels, airtime, signal quality, adaptive data rates, and why a client with full bars can still cling to the wrong access point.",
    readTime: "16 min",
    publishedAt: "2026-10-14",
    objectives: [
      "Explain why Wi-Fi capacity is based on shared airtime rather than only Mbps.",
      "Distinguish the practical characteristics of 2.4, 5, and 6 GHz.",
      "Understand channel width, co-channel contention, and adjacent-channel interference.",
      "Interpret RSSI, noise floor, SNR, negotiated rate, retries, and channel utilization.",
      "Explain how client roaming works and how sticky-client problems are corrected.",
    ],
    sections: [
      {
        heading: "Wi-Fi is shared and half-duplex",
        paragraphs: [
          "A switched Ethernet endpoint normally has a dedicated full-duplex link. Wi-Fi is a shared radio system. Devices using the same channel listen before transmitting and contend for opportunities to speak. The access point, its clients, nearby APs on the same channel, their clients, and detectable neighboring networks all consume the same airtime.",
          "A slow client can reduce performance for everyone because it occupies the channel longer to move the same payload. Airtime is also consumed by beacons, acknowledgments, probe traffic, management frames, retransmissions, and protocol overhead. The advertised link rate is therefore not the same as usable application throughput.",
        ],
        graphic: "wifi",
      },
      {
        heading: "Choose the band intentionally",
        paragraphs: [
          "The 2.4 GHz band travels farther and penetrates common materials better, but it has limited capacity, heavy interference, and many legacy or IoT clients. In North America, channels 1, 6, and 11 are the usual non-overlapping 20 MHz choices. Forty-megahertz operation in 2.4 GHz generally consumes too much of the available spectrum.",
          "Five gigahertz offers more channels and is the practical performance band for many commercial deployments. Some channels use DFS—Dynamic Frequency Selection—and must vacate when radar is detected. DFS can add useful capacity, but client support and the operational effect of a channel change must be considered.",
          "Six gigahertz, used by Wi-Fi 6E and Wi-Fi 7 equipment, provides large amounts of cleaner spectrum but shorter effective coverage and weaker obstacle penetration. Only compatible clients can use it, and 6 GHz operation requires newer security such as WPA3 or Enhanced Open rather than WPA2-only service.",
        ],
      },
      {
        heading: "Wider channels are not free capacity",
        paragraphs: [
          "Common channel widths are 20, 40, 80, and 160 MHz, with additional options on newer platforms. A wider channel can give one client a higher peak rate, but it consumes more spectrum and leaves fewer independent channels for neighboring APs.",
          "Dense offices, hotels, schools, and venues often gain more total capacity from several narrower channels than from a few enormous ones. Twenty megahertz is the sane default in 2.4 GHz; 20 or 40 MHz is common in dense 5 GHz designs; wider 6 GHz channels depend on client needs and AP density.",
          "Nearby APs on the same channel normally hear one another and take turns, creating co-channel contention. Partially overlapping channels can corrupt frames without orderly coordination, producing adjacent-channel interference and retransmissions.",
        ],
      },
      {
        heading: "Signal bars do not measure network health",
        paragraphs: [
          "RSSI—Received Signal Strength Indicator—is commonly shown in dBm. Because the numbers are negative, -55 dBm is stronger than -70 dBm. Around -67 dBm is a common planning target for reliable roaming applications, but the required target depends on client capability, data rate, and application.",
          "The noise floor represents background radio energy. SNR—Signal-to-Noise Ratio—compares the desired signal with that noise. A -60 dBm signal over a -90 dBm noise floor has 30 dB SNR. The same -60 dBm signal over -68 dBm noise has only 8 dB SNR and will likely perform badly despite displaying strong bars.",
          "Clients adapt their modulation and coding scheme to conditions. Poor signal quality leads to lower negotiated rates, longer transmissions, and more retries. Commissioning should therefore review RSSI, SNR, channel utilization, negotiated rates, and retry percentages together.",
        ],
      },
      {
        heading: "The client normally decides when to roam",
        paragraphs: [
          "Multiple APs can advertise the same SSID, but the client normally chooses its AP and decides when to leave. The infrastructure can help with proper coverage overlap, transmit-power control, minimum data rates, and standards such as 802.11k neighbor reports, 802.11v transition suggestions, and 802.11r fast transition. The client still has the final vote in most deployments.",
          "An AP can transmit more strongly than a phone, tablet, or small AV endpoint. The client hears the AP and shows several bars, but the AP may not reliably hear the client's weaker return signal. Coverage must be engineered as a two-way conversation around the weakest important client.",
        ],
      },
      {
        heading: "Correct sticky clients by shaping the RF cells",
        paragraphs: [
          "A sticky client remains associated with a distant AP even when a closer AP offers better service. Start by balancing transmit power so the old AP stops appearing attractive far outside its intended cell. Avoid running every radio at maximum power, and do not let 2.4 GHz coverage overwhelm the preferred 5 GHz cell.",
          "Disable unnecessarily low legacy data rates so clients cannot maintain extremely slow connections from several rooms away. In a surveyed commercial environment, minimum basic rates such as 12 or 18 Mbps may be appropriate, but raising them without confirming overlap can create dead zones.",
          "Enable 802.11k and 802.11v where supported, and test 802.11r with the actual client fleet because some older AV and IoT devices implement it poorly. Minimum-RSSI or forced-roam features can disconnect a client that refuses to move, but they should be the final nudge—not the foundation of the design.",
          "Ruckus commonly exposes forced-roaming behavior through SmartRoam, though exact settings vary by controller and software release. A practical investigation compares the client's associated AP, band, AP-measured RSSI, negotiated rate, retry percentage, neighboring AP power, enabled roaming assistance, minimum data rates, and SSID/VLAN consistency before changing thresholds.",
        ],
        bullets: [
          "Shape overlapping cells with sensible AP placement and transmit power.",
          "Remove legacy low rates only after verifying coverage.",
          "Use 802.11k/v to inform and encourage capable clients.",
          "Use 802.11r only after compatibility testing.",
          "Apply minimum-RSSI or SmartRoam thresholds cautiously.",
          "Keep SSID, security, and VLAN assignment consistent across roaming APs.",
        ],
      },
    ],
    examples: [
      { title: "Wireless presentation", text: "The presentation receiver may be wired while the laptop path is wireless. Poor SNR, retries, channel congestion, or roaming can cause video stutter even when the presentation appliance and wired AV network are healthy." },
      { title: "Sticky Q-SYS control tablet", text: "A tablet remains attached to a hallway AP at -76 dBm while standing under the room AP. Inspect the AP association, AP-measured RSSI, retries, channel use, transmit power, 802.11k/v support, minimum rates, and SmartRoam policy before adding another access point." },
      { title: "Fixed wireless camera", text: "A camera may advertise a high peak PHY rate while competing for airtime and retransmitting during interference. For fixed, high-duty-cycle AV endpoints, wired Ethernet remains preferable when practical." },
    ],
    glossary: [
      { term: "AP", definition: "Access point; the infrastructure radio connecting wireless clients to the network." },
      { term: "SSID / BSSID", definition: "The network name and the MAC identity of a specific AP radio serving it." },
      { term: "RSSI", definition: "Received Signal Strength Indicator, commonly reported in dBm." },
      { term: "SNR", definition: "Signal-to-Noise Ratio; desired signal strength compared with the noise floor." },
      { term: "MCS", definition: "The modulation and coding method selected for a wireless transmission." },
      { term: "DFS", definition: "Dynamic Frequency Selection used on certain 5 GHz channels shared with radar." },
      { term: "Airtime", definition: "The shared time available for devices to transmit on a channel." },
      { term: "Sticky client", definition: "A client that remains associated with a poor AP instead of roaming to a better one." },
    ],
    exercise: { title: "Diagnose the bars", prompt: "Inspect one conference room with a controller or survey tool. Record the associated AP and BSSID, band, channel, width, client RSSI, noise floor or SNR, negotiated rates, retries, channel utilization, and other APs heard on the same channel. Decide whether the limiting factor is coverage, noise, contention, client capability, roaming, or the wired uplink." },
    review: [
      { question: "Why can a slow Wi-Fi client affect faster clients?", answer: "All devices share airtime. A slow client occupies the channel longer and may require more retransmissions." },
      { question: "Why can strong RSSI coexist with poor performance?", answer: "RSSI measures signal strength, not noise, airtime congestion, interference, retries, or available throughput." },
      { question: "Does the access point decide when a client roams?", answer: "Usually not. The client normally decides, while the network supplies information, assistance, and sometimes a carefully configured disconnect threshold." },
    ],
    next: "Next: Wi-Fi security and identity—WPA2/WPA3, 802.1X, RADIUS, and assigning different VLANs from one SSID with PPSK, DPSK, or MPSK.",
  },
  {
    number: 12,
    slug: "wifi-security-identity-and-private-keys",
    title: "Wi-Fi Security and Identity",
    shortTitle: "One SSID, different access",
    description: "Separate authentication, encryption, and authorization; then see how 802.1X, RADIUS, and private passphrases place wireless clients into the right AV policy.",
    readTime: "14 min",
    publishedAt: "2026-10-15",
    objectives: [
      "Separate authentication, encryption, and authorization.",
      "Explain WPA-Personal, WPA-Enterprise, 802.1X, and RADIUS at an AV-engineering level.",
      "Describe how PPSK, DPSK, or MPSK credentials can assign different policies from one SSID.",
      "Trace a wireless AV client from successful login through VLAN assignment, DHCP, and access policy.",
    ],
    sections: [
      {
        heading: "Three jobs hide behind Wi-Fi security",
        paragraphs: [
          "Authentication proves that a device or user may connect. Encryption protects traffic across the radio link. Authorization decides what the authenticated client may reach afterward. These jobs are related but not interchangeable.",
          "A guest can authenticate successfully and still be prohibited from reaching a Q-SYS Core. That is not a contradiction; it is authorization doing its job. Wi-Fi encryption also protects only the wireless hop, so application protections such as HTTPS still matter.",
        ],
        graphic: "security",
      },
      {
        heading: "Personal and Enterprise solve identity differently",
        paragraphs: [
          "WPA2-Personal and WPA3-Personal use a passphrase-based model. WPA3-Personal uses SAE for stronger resistance to captured-password guessing and requires protected management frames. A WPA2/WPA3 transition network supports older clients, but those clients still connect with their older protection.",
          "WPA2-Enterprise and WPA3-Enterprise use 802.1X so an individual device or user can present credentials. The client is the supplicant, the AP or controller is the authenticator controlling admission, and an authentication server—usually reached through RADIUS—evaluates the identity and returns a decision.",
          "RADIUS carries authentication and policy exchanges; it does not transport the tablet's ongoing control or video traffic. EAP-TLS can use certificates instead of reusable user passwords, but certificate enrollment, renewal, and revocation must have a clear owner.",
        ],
      },
      {
        heading: "One SSID can lead to different VLANs",
        paragraphs: [
          "PPSK, DPSK, and MPSK are vendor names for families of private or multiple pre-shared-key features. One SSID accepts several passphrases, and each recognized credential can map a device or group to a VLAN, role, expiration rule, or access policy. Ruckus commonly calls this DPSK; other vendors use names such as PPSK, MPSK, or iPSK.",
          "A room tablet, technician, and temporary device can therefore join the same visible SSID while receiving different access. The client normally does not tag its own wireless traffic; the wireless infrastructure applies the resulting policy. Exact capabilities, WPA2/WPA3 support, device binding, and roaming behavior vary by platform and software release.",
        ],
        bullets: [
          "Room tablet credential → AV-control VLAN or role.",
          "Technician credential → restricted service policy.",
          "Guest credential → internet-only policy.",
          "Revoke one key without changing every device in the building.",
        ],
      },
      {
        heading: "The assigned VLAN still needs a complete path",
        paragraphs: [
          "Password-to-VLAN mapping does not create the rest of the network. In a locally bridged design, the AP uplink and every required switch link must carry the assigned VLAN. The VLAN also needs DHCP, an appropriate gateway, and firewall or ACL rules. In a tunneled design, client traffic may travel to a wireless controller or gateway before entering its policy domain.",
          "When a client connects but cannot control the room, identify the last successful step: association, authentication, VLAN assignment, DHCP, routing, firewall policy, discovery, or the AV application. A self-assigned 169.254 address after successful authentication points toward DHCP or VLAN transport—not another password reset.",
        ],
      },
    ],
    examples: [
      { title: "Q-SYS control tablet", text: "Assign the room tablet an individual credential mapped to an AV-control policy. Permit the required Core and support traffic without granting unrestricted access to every switch and device-management interface." },
      { title: "Wireless presentation guest", text: "A guest laptop can have internet access yet fail to discover a wired presentation receiver because of client isolation, cross-VLAN discovery, or firewall policy. Document and permit the required flows instead of opening the entire AV network." },
    ],
    glossary: [
      { term: "PSK", definition: "Pre-shared key used for passphrase-based Wi-Fi access." },
      { term: "SAE", definition: "Simultaneous Authentication of Equals, used by WPA3-Personal." },
      { term: "802.1X", definition: "Framework that controls admission to wired or wireless networks." },
      { term: "RADIUS", definition: "Protocol commonly used between network infrastructure and an authentication service." },
      { term: "PPSK / DPSK / MPSK", definition: "Vendor-specific families of private or multiple passphrase features that can apply per-device or per-group policy." },
      { term: "EAP-TLS", definition: "Certificate-based authentication method used within 802.1X deployments." },
    ],
    exercise: { title: "Follow the successful login", prompt: "A tablet connects with its private key and the controller assigns VLAN 20, but it receives 169.254.x.x. Verify VLAN 20 across the AP's actual forwarding path, then check DHCP scope, relay, gateway, and policy. Record which step first fails." },
    review: [
      { question: "Does sharing one SSID guarantee that clients share one VLAN?", answer: "No. Identity or credential policy can assign different VLANs or roles from the same SSID." },
      { question: "Does RADIUS carry the client's normal AV traffic?", answer: "No. It carries authentication, authorization, and potentially accounting exchanges." },
      { question: "Why can authentication succeed while room control still fails?", answer: "A later dependency can fail: VLAN transport, DHCP, routing, firewall policy, discovery, or the application." },
    ],
    next: "Next: the AV engineer's identity primer—LDAP, Active Directory, Entra ID, Kerberos, and the few integration details we actually need to own.",
  },
  {
    number: 13,
    slug: "identity-for-av-ldap-ad-entra-and-kerberos",
    title: "Identity for AV: LDAP, AD, Entra, and Kerberos",
    shortTitle: "Know the integration boundary",
    description: "Understand enough enterprise identity to specify and troubleshoot AV logins, group-based roles, and cloud access—without becoming the client's domain administrator.",
    readTime: "10 min",
    publishedAt: "2026-10-15",
    objectives: [
      "Distinguish a directory, LDAP, Active Directory Domain Services, and Microsoft Entra ID.",
      "Recognize where Kerberos, DNS, time, certificates, and group membership affect an AV integration.",
      "Translate directory groups into useful AV application roles.",
      "Define the information BMT needs while leaving directory administration with the client's IT owner.",
    ],
    sections: [
      {
        heading: "The four names perform different jobs",
        paragraphs: [
          "A directory stores structured objects such as users, groups, computers, and service accounts. LDAP is a standard protocol applications can use to search and read a directory. Active Directory Domain Services—AD DS—is Microsoft's traditional on-premises directory and domain platform; LDAP is only one of the services it provides.",
          "Microsoft Entra ID is a cloud identity provider used by Microsoft 365, Azure, and web applications. It commonly uses modern sign-in protocols such as OpenID Connect, OAuth 2.0, and SAML. Entra ID is not simply an AD domain controller hosted in the cloud, and it does not natively provide ordinary LDAP access.",
        ],
        graphic: "identity",
      },
      {
        heading: "What an AV platform usually needs",
        paragraphs: [
          "An on-premises AV management server offering LDAP integration may use a limited service account to find users and read group membership from AD DS. The application then maps approved directory groups to local roles such as administrator, support technician, or operator.",
          "A cloud or browser application may instead redirect the user to Entra ID and receive a signed token after authentication. BMT Network Manager Web follows this modern model through Microsoft sign-in and Graph permissions; it is not an LDAP client.",
          "Authentication proves identity. Authorization decides what that identity may do. If a user can sign in but receives access denied, the likely failure is group lookup, role mapping, consent, or application policy—not the user's password.",
        ],
        bullets: [
          "Define the supported identity source and sign-in method.",
          "Map named client-owned groups to AV roles.",
          "Use least-privilege service accounts where required.",
          "Keep credentials out of drawings and closeout PDFs.",
        ],
      },
      {
        heading: "Kerberos matters mainly through its dependencies",
        paragraphs: [
          "Kerberos is the ticket-based authentication system widely used inside AD domains. A client first receives a ticket-granting ticket, then obtains service-specific tickets without sending its password to every server. An AV engineer rarely configures the Kerberos infrastructure, but should recognize its dependencies.",
          "Kerberos depends heavily on correct DNS, service naming, and synchronized time. A domain-integrated AV server can therefore reject valid users when DNS points somewhere unhelpful, the clock is wrong, or a service name does not match. Capture the evidence and bring the client's identity administrator into the right part of the problem.",
        ],
      },
      {
        heading: "BMT's ownership line",
        paragraphs: [
          "BMT should define what the AV application requires, verify network reachability, configure supported integration fields, map approved groups to roles, and test acceptance and rejection. The client's IT team should own domain controllers, directory structure, identity lifecycle, certificate authorities, and organization-wide security policy unless those services are explicitly within BMT's scope.",
          "Record server names, identity method, encrypted connection requirement, approved groups, role mappings, service-account owner, certificate owner, and renewal expectations. Do not record passwords. This is enough to engineer a dependable integration without adopting someone else's forest and all the squirrels living in it.",
        ],
      },
    ],
    examples: [
      { title: "LDAP-backed AV monitoring", text: "The platform finds the user but denies access. Network reachability, the bind account, and the directory search already worked; inspect group membership, nested-group support, and the group-to-role mapping next." },
      { title: "BMT Network Manager Web", text: "Microsoft sign-in succeeds but project files remain unavailable. Investigate Entra application configuration, token scope, Graph permission, consent, and the user's file access—not LDAP settings or an on-premises domain controller." },
    ],
    glossary: [
      { term: "Directory", definition: "Structured store of users, groups, devices, services, and related attributes." },
      { term: "LDAP", definition: "Protocol used by applications to access directory information." },
      { term: "AD DS", definition: "Microsoft's traditional domain and directory service." },
      { term: "Entra ID", definition: "Microsoft's cloud identity and access-management service." },
      { term: "Kerberos", definition: "Ticket-based authentication protocol used extensively in AD domains." },
      { term: "IdP", definition: "Identity provider that authenticates identities for applications." },
    ],
    exercise: { title: "Find the actual failed step", prompt: "An AV server's LDAP connection test succeeds and it can find the user's name, but login returns not authorized. List what this proves, then inspect the expected group, membership lookup, nested-group behavior, and application role mapping before touching the user's password." },
    review: [
      { question: "Is LDAP the same thing as Active Directory?", answer: "No. LDAP is a protocol; AD DS is a directory and domain platform that supports LDAP among several other services." },
      { question: "Is Entra ID simply an AD domain controller in Microsoft's cloud?", answer: "No. It is a cloud identity provider built around modern application authentication, not a native LDAP and traditional domain replacement." },
      { question: "What identity information should BMT own in the AV documentation?", answer: "The required method, server or provider, encrypted connection, approved groups, role mappings, service-account owner, certificate owner, and renewal expectations—never the actual passwords." },
    ],
    next: "Next: SNMP and syslog in real AV systems—what to monitor, what the numbers mean, and how to preserve evidence before someone power-cycles the crime scene.",
  },
  ...additionalLessons,
];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
