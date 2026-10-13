export type LessonSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  graphic?: "layers" | "physical" | "switch" | "subnet" | "services" | "time" | "vlan";
};

export type Lesson = {
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
];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
