type GraphicKind = "layers" | "physical" | "switch" | "subnet" | "services" | "time" | "vlan" | "route" | "multicast" | "qos" | "wifi" | "security" | "identity";

type Props = {
  kind: GraphicKind;
  figure?: string;
  compact?: boolean;
};

const Node = ({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect className="lesson-svg-node" width="112" height="55" rx="2" />
    <circle className="lesson-svg-led" cx="14" cy="14" r="3" />
    <text className="lesson-svg-label" x="14" y="34">{label}</text>
    {sub && <text className="lesson-svg-sub" x="14" y="47">{sub}</text>}
  </g>
);

function Layers() {
  return <>
    {["7  APPLICATION", "6  PRESENTATION", "5  SESSION", "4  TRANSPORT", "3  NETWORK", "2  DATA LINK", "1  PHYSICAL"].map((label, index) => (
      <g transform={`translate(52 ${35 + index * 42})`} key={label}>
        <rect className={index > 3 ? "lesson-svg-layer active" : "lesson-svg-layer"} width={276} height="31" rx="2" />
        <text className="lesson-svg-label" x="14" y="20">{label}</text>
      </g>
    ))}
    <path className="lesson-svg-flow" d="M365 50v250" />
    <path className="lesson-svg-arrow" d="M358 292l7 10 7-10" />
    <text className="lesson-svg-note" x="383" y="92">ENCAPSULATE</text>
    <text className="lesson-svg-note" x="383" y="272">TROUBLESHOOT</text>
  </>;
}

function Physical() {
  return <>
    <Node x={30} y={62} label="SWITCH A" sub="SFP+ / DOM" />
    <Node x={358} y={62} label="SWITCH B" sub="SFP+ / DOM" />
    <path className="lesson-svg-fiber fiber-a" d="M142 79C220 28 288 28 358 79" />
    <path className="lesson-svg-fiber fiber-b" d="M142 99c78 51 146 51 216 0" />
    <text className="lesson-svg-label" x="220" y="53">TX → RX</text>
    <text className="lesson-svg-label" x="220" y="142">RX ← TX</text>
    <g transform="translate(74 206)">
      <rect className="lesson-svg-poe" width="350" height="66" rx="2" />
      <text className="lesson-svg-label" x="18" y="27">PoE POWER PATH</text>
      <text className="lesson-svg-sub" x="18" y="47">PSE  →  CABLE LOSS  →  PD</text>
      <circle className="lesson-svg-led" cx="320" cy="33" r="9" />
    </g>
  </>;
}

function Switch() {
  return <>
    <Node x={22} y={52} label="ENCODER" sub="MAC …:21" />
    <Node x={366} y={52} label="DECODER" sub="MAC …:7A" />
    <g transform="translate(187 142)">
      <rect className="lesson-svg-switch" width="164" height="82" rx="3" />
      <text className="lesson-svg-label" x="17" y="24">ACCESS SWITCH</text>
      {[0,1,2,3,4,5].map((n) => <rect className="lesson-svg-port" x={17+n*22} y="44" width="14" height="15" key={n} />)}
      <text className="lesson-svg-sub" x="17" y="74">MAC TABLE / LLDP</text>
    </g>
    <path className="lesson-svg-flow" d="M134 90l86 52M398 107l-65 35" />
    <text className="lesson-svg-note" x="32" y="284">LEARN SOURCE · FORWARD DESTINATION</text>
  </>;
}

function Subnet() {
  return <>
    <text className="lesson-svg-address" x="40" y="80">172.16.20.45</text>
    <text className="lesson-svg-prefix" x="380" y="80">/24</text>
    <g transform="translate(40 106)">
      <rect className="lesson-svg-network" width="310" height="56" />
      <rect className="lesson-svg-host" x="310" width="116" height="56" />
      <text className="lesson-svg-label" x="18" y="34">NETWORK</text>
      <text className="lesson-svg-label dark" x="328" y="34">HOST</text>
    </g>
    <Node x={40} y={216} label="LOCAL" sub="SEND DIRECT" />
    <Node x={354} y={216} label="REMOTE" sub="USE GATEWAY" />
    <path className="lesson-svg-flow" d="M152 243h202" />
  </>;
}

function Services() {
  return <>
    <Node x={198} y={25} label="ENDPOINT" sub="NEEDS CONTEXT" />
    <Node x={35} y={135} label="ARP" sub="IP → MAC" />
    <Node x={199} y={135} label="DHCP" sub="LEASE CONFIG" />
    <Node x={363} y={135} label="DNS" sub="NAME → IP" />
    <Node x={117} y={245} label="NTP" sub="WALL CLOCK" />
    <Node x={281} y={245} label="PTP" sub="MEDIA CLOCK" />
    <path className="lesson-svg-flow" d="M253 80v35M237 80l-90 55M274 80l145 55M227 190l-54 55M310 190l27 55" />
  </>;
}

function Time() {
  return <>
    <g transform="translate(62 54)">
      <circle className="lesson-svg-clock" cx="86" cy="86" r="72" />
      <path className="lesson-svg-hand" d="M86 86V39M86 86l34 20" />
      <text className="lesson-svg-label" x="63" y="183">PTPv1</text>
      <text className="lesson-svg-sub" x="49" y="199">NATIVE DANTE</text>
    </g>
    <g transform="translate(304 54)">
      <circle className="lesson-svg-clock alt" cx="86" cy="86" r="72" />
      <path className="lesson-svg-hand" d="M86 86V49M86 86l-28 31" />
      <text className="lesson-svg-label" x="63" y="183">PTPv2</text>
      <text className="lesson-svg-sub" x="48" y="199">AES67 / Q-LAN</text>
    </g>
    <text className="lesson-svg-note" x="153" y="301">COEXISTENCE ≠ INTEROPERABILITY</text>
  </>;
}

function Vlan() {
  return <>
    <Node x={21} y={54} label="CONTROL" sub="UNTAGGED / 20" />
    <Node x={21} y={222} label="DANTE" sub="UNTAGGED / 30" />
    <g transform="translate(190 126)">
      <rect className="lesson-svg-switch" width="150" height="85" rx="3" />
      <text className="lesson-svg-label" x="16" y="25">SWITCH A</text>
      <text className="lesson-svg-sub" x="16" y="54">20  30  40</text>
      <text className="lesson-svg-sub" x="16" y="70">TAGGED →</text>
    </g>
    <g transform="translate(382 126)">
      <rect className="lesson-svg-switch" width="125" height="85" rx="3" />
      <text className="lesson-svg-label" x="16" y="25">SWITCH B</text>
      <text className="lesson-svg-sub" x="16" y="54">20  30  40</text>
      <text className="lesson-svg-sub" x="16" y="70">← TAGGED</text>
    </g>
    <path className="lesson-svg-vlan vlan-20" d="M133 82l57 70M340 150h42" />
    <path className="lesson-svg-vlan vlan-30" d="M133 250l57-62M340 188h42" />
    <text className="lesson-svg-note" x="174" y="304">ONE LINK · MULTIPLE LOGICAL NETWORKS</text>
  </>;
}

function Route() {
  return <>
    <Node x={20} y={45} label="CONTROL" sub="VLAN 20 / .50" />
    <Node x={408} y={45} label="ENCODER" sub="VLAN 40 / .60" />
    <g transform="translate(193 124)">
      <rect className="lesson-svg-switch" width="154" height="92" rx="3" />
      <text className="lesson-svg-label" x="17" y="26">GATEWAY</text>
      <text className="lesson-svg-sub" x="17" y="53">ROUTE → POLICY</text>
      <text className="lesson-svg-sub" x="17" y="72">.20.1  /  .40.1</text>
    </g>
    <path className="lesson-svg-vlan vlan-20" d="M132 73l91 51" />
    <path className="lesson-svg-vlan vlan-30" d="M317 124l91-51" />
    <path className="lesson-svg-flow" d="M270 216v48" />
    <path className="lesson-svg-arrow" d="M263 255l7 10 7-10" />
    <text className="lesson-svg-note" x="154" y="292">PATH ≠ PERMISSION · ONE GATEWAY OWNER</text>
  </>;
}

function Multicast() {
  return <>
    <Node x={22} y={129} label="ENCODER" sub="239.10.10.50" />
    <g transform="translate(194 114)">
      <rect className="lesson-svg-switch" width="150" height="86" rx="3" />
      <text className="lesson-svg-label" x="16" y="25">IGMP SWITCH</text>
      <text className="lesson-svg-sub" x="16" y="52">SNOOP TABLE</text>
      <text className="lesson-svg-sub" x="16" y="69">QUERIER ACTIVE</text>
    </g>
    <Node x={405} y={35} label="RX A" sub="JOINED" />
    <Node x={405} y={130} label="RX B" sub="JOINED" />
    <Node x={405} y={237} label="RX C" sub="NOT JOINED" />
    <path className="lesson-svg-vlan vlan-20" d="M134 157h60M344 143l61-70M344 157h61" />
    <path className="lesson-svg-flow" d="M344 171l61 94" />
    <text className="lesson-svg-note" x="167" y="292">ONE STREAM · INTERESTED PORTS ONLY</text>
  </>;
}

function Qos() {
  return <>
    <Node x={22} y={44} label="PTP" sub="DSCP 56" />
    <Node x={22} y={142} label="AUDIO" sub="DSCP 46" />
    <Node x={22} y={240} label="DATA" sub="BEST EFFORT" />
    <g transform="translate(195 103)">
      <rect className="lesson-svg-switch" width="150" height="118" rx="3" />
      <text className="lesson-svg-label" x="16" y="25">QoS POLICY</text>
      <text className="lesson-svg-sub" x="16" y="52">CLASSIFY</text>
      <text className="lesson-svg-sub" x="16" y="70">MAP → QUEUE</text>
      <text className="lesson-svg-sub" x="16" y="88">SCHEDULE</text>
    </g>
    <g transform="translate(402 72)">
      <rect className="lesson-svg-poe" width="105" height="48" rx="2" />
      <rect className="lesson-svg-poe" y="65" width="105" height="48" rx="2" />
      <rect className="lesson-svg-poe" y="130" width="105" height="48" rx="2" />
      <text className="lesson-svg-label" x="17" y="29">QUEUE 1</text>
      <text className="lesson-svg-label" x="17" y="94">QUEUE 2</text>
      <text className="lesson-svg-label" x="17" y="159">QUEUE 3</text>
    </g>
    <path className="lesson-svg-vlan vlan-20" d="M134 72l61 58M345 129l57-33" />
    <path className="lesson-svg-vlan vlan-30" d="M134 170h61M345 163h57" />
    <path className="lesson-svg-flow" d="M134 268l61-66M345 197l57 29" />
    <text className="lesson-svg-note" x="163" y="315">PRIORITY MANAGES CONTENTION · NOT CAPACITY</text>
  </>;
}

function Wifi() {
  return <>
    <g transform="translate(48 111)">
      <circle className="lesson-svg-clock" cx="70" cy="70" r="58" />
      <circle className="lesson-svg-led" cx="70" cy="70" r="7" />
      <path className="lesson-svg-flow" d="M70 70l44-34M70 70l-48 18M70 70l38 42" />
      <text className="lesson-svg-label" x="42" y="151">AP 01</text>
      <text className="lesson-svg-sub" x="25" y="168">CH 36 · 5 GHz</text>
    </g>
    <g transform="translate(357 111)">
      <circle className="lesson-svg-clock alt" cx="70" cy="70" r="58" />
      <circle className="lesson-svg-led" cx="70" cy="70" r="7" />
      <path className="lesson-svg-flow" d="M70 70l-39-35M70 70l49 15M70 70l-34 44" />
      <text className="lesson-svg-label" x="42" y="151">AP 02</text>
      <text className="lesson-svg-sub" x="25" y="168">CH 44 · 5 GHz</text>
    </g>
    <Node x={214} y={33} label="TABLET" sub="CLIENT DECIDES" />
    <path className="lesson-svg-vlan vlan-20" d="M247 88l-93 61" />
    <path className="lesson-svg-flow" d="M290 88l101 61" />
    <text className="lesson-svg-note" x="168" y="284">RSSI + SNR + AIRTIME + RETRIES</text>
    <text className="lesson-svg-note" x="183" y="305">SHAPE CELLS · ASSIST ROAMING</text>
  </>;
}

function Security() {
  return <>
    <Node x={24} y={40} label="ROOM TABLET" sub="PRIVATE KEY A" />
    <Node x={24} y={142} label="TECHNICIAN" sub="PRIVATE KEY B" />
    <Node x={24} y={244} label="GUEST" sub="PRIVATE KEY C" />
    <g transform="translate(208 116)">
      <rect className="lesson-svg-switch" width="128" height="112" rx="3" />
      <text className="lesson-svg-label" x="18" y="26">ONE SSID</text>
      <text className="lesson-svg-sub" x="18" y="54">IDENTIFY KEY</text>
      <text className="lesson-svg-sub" x="18" y="73">APPLY ROLE</text>
      <text className="lesson-svg-sub" x="18" y="92">ASSIGN VLAN</text>
    </g>
    <Node x={398} y={40} label="AV CONTROL" sub="VLAN 20" />
    <Node x={398} y={142} label="SERVICE" sub="VLAN 60" />
    <Node x={398} y={244} label="INTERNET" sub="VLAN 80" />
    <path className="lesson-svg-vlan vlan-20" d="M136 67l72 72M336 139l62-72" />
    <path className="lesson-svg-vlan vlan-30" d="M136 169h72M336 169h62" />
    <path className="lesson-svg-flow" d="M136 271l72-66M336 205l62 66" />
    <text className="lesson-svg-note" x="151" y="322">AUTHENTICATE → ASSIGN → ENFORCE</text>
  </>;
}

function Identity() {
  return <>
    <g transform="translate(24 52)">
      <rect className="lesson-svg-switch" width="150" height="105" rx="3" />
      <text className="lesson-svg-label" x="18" y="27">AD DS</text>
      <text className="lesson-svg-sub" x="18" y="55">LDAP · GROUPS</text>
      <text className="lesson-svg-sub" x="18" y="76">KERBEROS · DNS</text>
    </g>
    <g transform="translate(24 207)">
      <rect className="lesson-svg-switch" width="150" height="82" rx="3" />
      <text className="lesson-svg-label" x="18" y="27">ENTRA ID</text>
      <text className="lesson-svg-sub" x="18" y="55">OIDC · TOKENS</text>
    </g>
    <g transform="translate(222 113)">
      <rect className="lesson-svg-poe" width="133" height="104" rx="2" />
      <text className="lesson-svg-label" x="17" y="27">IDENTITY</text>
      <text className="lesson-svg-sub" x="17" y="55">USER / DEVICE</text>
      <text className="lesson-svg-sub" x="17" y="76">GROUP / CLAIM</text>
    </g>
    <Node x={404} y={78} label="AV ADMIN" sub="FULL ACCESS" />
    <Node x={404} y={216} label="OPERATOR" sub="ROOM CONTROL" />
    <path className="lesson-svg-vlan vlan-20" d="M174 105l48 40M174 248l48-54M355 145l49-39" />
    <path className="lesson-svg-flow" d="M355 191l49 52" />
    <text className="lesson-svg-note" x="150" y="322">IDENTITY → GROUP → AV ROLE</text>
  </>;
}

export function LessonGraphic({ kind, figure = "01", compact = false }: Props) {
  const content = {
    layers: <Layers />,
    physical: <Physical />,
    switch: <Switch />,
    subnet: <Subnet />,
    services: <Services />,
    time: <Time />,
    vlan: <Vlan />,
    route: <Route />,
    multicast: <Multicast />,
    qos: <Qos />,
    wifi: <Wifi />,
    security: <Security />,
    identity: <Identity />,
  }[kind];

  return (
    <figure className={`lesson-graphic${compact ? " lesson-graphic-compact" : ""}`} aria-hidden="true">
      <div className="lesson-graphic-grid" />
      <span className="lesson-graphic-coord">A&nbsp;&nbsp;B&nbsp;&nbsp;C&nbsp;&nbsp;D&nbsp;&nbsp;E</span>
      <svg viewBox="0 0 540 340" role="presentation">{content}</svg>
      <figcaption><span>FIG. {figure}</span><strong>{kind.toUpperCase()} / IT FOR AV</strong><i>BMT LEARNING SERIES</i></figcaption>
    </figure>
  );
}
