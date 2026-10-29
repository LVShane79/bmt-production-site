export type AudioLesson = {
  number: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  readTime: string;
  publishedAt: string;
  objectives: string[];
  parts: { markdown: string; graphic?: "waveform" | "room" | "polar" }[];
};

export const audioLessons: AudioLesson[] = [
  {
    number: 1, slug: "audio-101-what-sound-is", title: "Audio 101: What Sound Is", shortTitle: "Sound fundamentals", readTime: "12 min", publishedAt: "2026-10-29",
    description: "Start with sound as a travelling pressure variation, then connect frequency, wavelength, amplitude, and the way voices differ from test tones.",
    objectives: ["Describe sound as a traveling pressure variation.", "Connect frequency, period, and wavelength.", "Distinguish sound pressure from perceived loudness.", "Explain why a voice contains more than one frequency."],
    parts: [
      { markdown: `## Sound begins with movement

A talker’s vocal folds vibrate. A loudspeaker’s diaphragm moves. Each creates small pressure changes that travel through the surrounding air. Areas of slightly higher pressure alternate with areas of slightly lower pressure. Reaching an ear, these variations can produce the experience of hearing.

Air does not stream across a room from talker to listener. Air particles move back and forth locally while the disturbance travels through them, rather like people passing a message down a line.

Sound needs a medium, such as air, water, or a solid. Commercial AV usually focuses on airborne sound, but structure-borne vibration matters too. A bumped table can carry vibration into a microphone mount, producing a thump.

A microphone changes sound into an electrical signal. A loudspeaker performs the opposite conversion. Equipment between them may change level, frequency balance, timing, or routing.

Understand the acoustic event before assuming an equipment setting is responsible. [\[1.1\]](https://openstax.org/books/physics/pages/14-1-speed-of-sound-frequency-and-wavelength)

## Reading a waveform

A waveform plots a changing quantity against time. For airborne sound, the vertical axis can represent pressure variation above and below the surrounding air pressure. The horizontal axis represents time. The center line represents the reference around which sound-pressure changes occur—not an absence of air pressure. Positive and negative parts show the direction of variation relative to that reference.

A sine wave is a smooth, repeating shape associated with one frequency. Speech rarely looks so simple, but this model makes the vocabulary clear.` },
      { graphic: "waveform", markdown: `## Frequency, period, and wavelength

Frequency is the number of complete cycles occurring each second. Its unit is the hertz, abbreviated Hz. A 100 Hz tone completes 100 cycles each second; a 1,000 Hz tone completes 1,000. For simple tones, higher frequency generally means higher perceived pitch.

Period is the time taken for one complete cycle. Frequency and period describe the same repetition from opposite directions. More cycles per second means less time per cycle. A 100 Hz tone has a period of one-hundredth of a second. A 1,000 Hz tone has a period of one-thousandth of a second.

Wavelength is the distance traveled during one cycle. In the same medium under the same conditions, a higher-frequency sound has a shorter wavelength. A lower-frequency sound has a longer wavelength. At about 20°C, sound travels through air at roughly 343 meters per second, giving a 1,000 Hz tone a wavelength of about 34 centimeters. A doorway, tabletop, or room therefore interacts differently with different frequencies.

Frequency is a rate, period is a duration, and wavelength is a distance. These distinctions will matter when studying rooms, arrays, and timing. [\[1.1\]](https://openstax.org/books/physics/pages/14-1-speed-of-sound-frequency-and-wavelength)

## Amplitude, pressure, and loudness

Amplitude describes the size of a variation. On our pressure waveform, a larger amplitude means a greater pressure change. When comparing measurements, also notice whether amplitude means peak value or an effective measure called RMS (root mean square). Different measures should not be treated as interchangeable.

Sound pressure is a physical quantity measured in pascals. Loudness is a listener’s perception. They are related, but they are not the same thing. Frequency content, duration, background noise, and the listener’s hearing all influence perceived loudness. Two sounds with similar measured levels need not seem equally loud or equally clear. [\[1.2\]](https://openstax.org/books/college-physics-2e/pages/17-3-sound-intensity-and-sound-level)

Audio levels are often expressed in decibels, written dB. A decibel describes a logarithmic ratio rather than an ordinary count. The reference matters: dB SPL describes sound-pressure level relative to an acoustic reference; a digital level uses a different reference. A number followed only by “dB” may be incomplete information.

For now, remember the practical lesson: ask what is being measured and what the reference is. Do not assume that a digital meter reading directly tells you the sound-pressure level at a listener’s seat.

Doubling pressure amplitude is about +6 dB; doubling power is about +3 dB. Neither automatically means “twice as loud.” We will develop the math later. [\[1.4\]](https://support.biamp.com/General/Audio/Decibels)

## Why voices do not sound like test tones

A sustained voiced sound can contain a fundamental frequency plus harmonics at whole-number multiples of that fundamental. The relative strengths of those components help shape its character. The vocal tract further shapes the spectrum, emphasizing some regions and reducing others.

Speech also contains noise-like components, such as the airflow in “s” and “f.” These are not neatly described as a single repeating tone. A complete voice is a changing combination of periodic and nonperiodic sounds.

“More level” is not necessarily “more intelligibility.” Turning up a muffled voice does not restore missing speech detail. [\[1.3\]](https://www.animations.physics.unsw.edu.au/jw/timbre-spectrum.htm)

## In a conference room

A remote participant says, “I can hear the meeting, but I cannot understand the words.” Before increasing the entire system level, separate the possibilities. Is the speech too quiet? Is background noise masking it? Are important speech components being altered? Is the microphone capturing too much room sound?

These possibilities call for different investigations. Describe the symptom before choosing a control.

## Try it

At a comfortable speaking level, hum a low note and then a higher note. Do not strain or try to reach an extreme pitch. Notice that changing pitch does not require deliberately making the sound louder.

Next, say the same short sentence softly and then at your normal conversational level. Keep the wording and position unchanged. You have mainly changed level, although real voices also change tone when effort changes. This is an observation exercise, not a calibrated measurement. Stop if speaking or humming feels uncomfortable.

## Troubleshooting habit

Replace “the audio is bad” with a specific observation: “speech is quiet,” “consonants are unclear,” or “there is a low rumble.” Clear descriptions narrow the next test.

## Recap and check yourself

1. If frequency increases, what happens to period?
2. In unchanged air conditions, which has the longer wavelength: a low tone or a high tone?
3. Is sound pressure identical to loudness?

**Answers:** 1. Period decreases. 2. The low tone. 3. No. Sound pressure is physical; loudness is perceptual.

## Further reading

- [1.1 OpenStax: Speed of Sound, Frequency, and Wavelength](https://openstax.org/books/physics/pages/14-1-speed-of-sound-frequency-and-wavelength)
- [1.2 OpenStax: Sound Intensity and Sound Level](https://openstax.org/books/college-physics-2e/pages/17-3-sound-intensity-and-sound-level)
- [1.3 UNSW Physics: Spectrum, harmonics, and timbre](https://www.animations.physics.unsw.edu.au/jw/timbre-spectrum.htm)
- [1.4 Biamp: Decibels](https://support.biamp.com/General/Audio/Decibels)` }
    ]
  },
  {
    number: 2, slug: "how-sound-behaves-in-a-room", title: "How Sound Behaves in a Room", shortTitle: "Room acoustics", readTime: "13 min", publishedAt: "2026-10-29",
    description: "Learn how direct sound, reflections, microphone distance, reverberation, phase, and polarity shape speech intelligibility.",
    objectives: ["Distinguish direct sound from reflected sound.", "Explain reflection, absorption, diffusion, and reverberation.", "Relate microphone distance and room sound to speech intelligibility.", "Describe the difference between phase and polarity."],
    parts: [
      { markdown: `## One source, many arrival paths

When a person speaks in a room, some sound travels directly to the listener or microphone. This is direct sound. Other sound reaches walls, glazing, furniture, the ceiling, and the floor before arriving. Those indirect paths produce reflected sound.

Reflected paths are longer, so their sound arrives later. Surfaces also change the sound. The microphone receives the talker’s voice combined with the room’s contribution.

Early reflections arrive soon after the direct sound. Later reflections become more numerous and overlap. Timing, strength, direction, and frequency content affect what we hear. Some reflections support audibility; others obscure speech or create unwanted coloration.

Room behavior changes with frequency. A surface absorbing high-frequency energy may absorb very little low-frequency energy. “Soft” is not a complete acoustic specification.` },
      { graphic: "room", markdown: `## Reflection, absorption, and diffusion

Reflection sends sound energy back into the room. A large, smooth surface can produce a strong reflection in a particular direction.

Absorption removes some energy from the reflected sound, typically converting it into heat through losses in the material or assembly. Absorption is frequency-dependent, and installation details matter.

Diffusion spreads reflected energy across directions rather than concentrating it into a strong, mirror-like reflection. Diffusion does not mean that sound has disappeared.

Surfaces combine these behaviors, and some energy may transmit through them. Treatment for reflections within a room is not equivalent to construction that reduces transmission between rooms.

## Reverberation is not the same as an echo

Reverberation is the continuing, overlapping sound that decays after the source stops. In a lively room, the end of one syllable can overlap the beginning of the next. Speech may remain audible while becoming harder to understand.

An echo is a delayed repetition that is perceived as a separate event. Whether a reflection is heard as a distinct echo depends on more than delay alone; level, signal content, and the listening situation matter too. Avoid relying on one universal time threshold to classify every room.

Reverberation is often described using decay-time measurements, which vary with frequency. A phone recording or listening exercise can reveal symptoms without providing a reliable acoustic specification. Background noise is another part of the picture. Ventilation, neighboring activity, and equipment noise can mask speech. Reducing reverberation will not necessarily remove those noises; increasing speech level will not necessarily solve excessive reverberation. [\[2.2\]](https://handbook.ashrae.org/Handbooks/F25/IP/F25_Ch08/F25_Ch08_ip.aspx)

## Why microphone distance matters

Moving a microphone closer to a talker generally increases the direct voice relative to the surrounding room sound and background noise. This is often more valuable than adding electronic gain after a distant microphone.

Gain raises the wanted voice and the unwanted sound already captured together. It cannot independently bring the talker closer. Likewise, a directional microphone can favor some directions, but it cannot erase a reverberant room.

Distance effects depend on the source, room, microphone, and placement. Simple free-field rules are not promises for every seat. Seek a useful balance of direct speech and unwanted sound while preserving coverage. [\[2.1\]](https://service.shure.com/articles/en_US/Knowledge/critical-distance-and-microphone-placement) [\[2.4\]](https://support.biamp.com/Tesira/Programming/Noise_Reduction_and_Dereverberation)

## In a conference room

A table microphone sounds clear when someone leans toward it but distant when the same person sits back. Raising gain makes the room noise more obvious without restoring clarity.

That points toward a capture problem, not necessarily insufficient output level. Compare positions, listening for the balance between the immediate voice and its trailing room sound.

## Recognize acoustic feedback

Feedback occurs when amplified microphone sound returns through a loudspeaker and is captured again. Repeated circulation can produce ringing or howling. If unexpected feedback occurs, reduce or mute the affected path, then investigate levels and placement. Never deliberately provoke loud feedback as a test. [\[2.5\]](https://www.shure.com/en-IN/insights/how-to-control-feedback-in-a-sound-system)

## Phase and polarity are different

When two versions of a sound combine, their relative timing matters. At a particular frequency, the relationship between their cycles is called a phase relationship. They may reinforce one another, partly cancel, or fall somewhere between those outcomes.

A delayed copy has different phase relationships at different frequencies. Combining direct sound with a strong reflection can create frequency-response peaks and dips called comb filtering. Moving a microphone or changing a reflection path changes the pattern.

Polarity describes the sign or direction of a signal. Reversing polarity turns a waveform upside down: positive becomes negative and negative becomes positive. It does not introduce a time delay. For a single sine wave, polarity inversion resembles a half-cycle phase shift, but that does not make polarity inversion equivalent to delaying a complex voice signal.

Do not assume that a polarity switch will fix an arbitrary timing problem. First establish which signals or acoustic paths are combining and how they arrive. [\[2.3\]](https://www.dpamicrophones.com/mic-university/technology/polarity-phase-and-delay/)

## A brief note on arrays

Loudspeaker and microphone arrays use spacing and timing to create directional behavior. Results depend on wavelength and geometry. Placing two devices together does not guarantee better coverage or rejection. Array alignment requires methods beyond this introduction.

## Try it

Compare a furnished room and a less furnished space where conversation will not disturb anyone. Speak the same short sentence comfortably, then pause. Does the sound stop cleanly or linger?

Do not shout, generate test tones, or clap near anyone’s ears. Optional phone recordings should use similar positions. Automatic processing may affect results: recordings are listening aids, not calibrated measurements.

## Troubleshooting habit

Change one thing at a time. A new position, a different speaking level, and a gain adjustment made together leave you unable to tell which change helped.

## Recap and check yourself

1. Does diffusion necessarily remove sound energy?
2. Why might adding gain fail to clarify a distant microphone?
3. Does polarity reversal create a time delay?

**Answers:** 1. No; it redistributes reflected energy. 2. Gain also raises captured room sound and noise. 3. No; it reverses the waveform’s sign.

## Further reading

- [2.1 Shure: Critical Distance and Microphone Placement](https://service.shure.com/articles/en_US/Knowledge/critical-distance-and-microphone-placement)
- [2.2 ASHRAE: Sound and Vibration, Room Acoustics](https://handbook.ashrae.org/Handbooks/F25/IP/F25_Ch08/F25_Ch08_ip.aspx)
- [2.3 DPA Microphones: Polarity, phase, and delay](https://www.dpamicrophones.com/mic-university/technology/polarity-phase-and-delay/)
- [2.4 Biamp: Noise Reduction and Dereverberation](https://support.biamp.com/Tesira/Programming/Noise_Reduction_and_Dereverberation)
- [2.5 Shure: How to Control Feedback in a Sound System](https://www.shure.com/en-IN/insights/how-to-control-feedback-in-a-sound-system)` }
    ]
  },
  {
    number: 3, slug: "how-microphones-turn-sound-into-an-electrical-signal", title: "How Microphones Turn Sound into an Electrical Signal", shortTitle: "Microphone fundamentals", readTime: "14 min", publishedAt: "2026-10-29",
    description: "Understand microphone transducers, polar patterns, placement, sensitivity, gain, and model-specific power checks.",
    objectives: ["Describe moving-coil, condenser, and ribbon microphone operation.", "Interpret basic polar-pattern information without treating it as a guarantee.", "Distinguish sensitivity from quality and gain.", "Apply safe, model-specific checks before connecting a microphone."],
    parts: [
      { markdown: `## A microphone is a transducer

A microphone is a transducer: it converts sound into an electrical signal. In many microphones, sound moves a thin diaphragm. The operating principle determines how that movement becomes a signal.

A microphone input usually provides preamplification before further processing. Some products integrate microphones, converters, processing, and a digital interface.

A microphone sold for speech still captures other sounds. Design, placement, and surroundings matter.

## Moving-coil dynamic microphones

Sound moves a moving-coil microphone’s diaphragm and attached coil within a magnetic field, generating a signal through electromagnetic induction.

This element needs no external power for conversion. A complete product may nevertheless contain powered electronics. Check its documentation.

Common in handheld applications, moving-coil designs vary in polar pattern, clarity, and handling-noise performance. [\[3.1\]](https://service.shure.com/articles/en_US/Knowledge/difference-between-a-dynamic-and-condenser-microphone)

## Condenser microphones

A condenser microphone’s diaphragm and another conductive surface form a capacitor. Sound changes their spacing and capacitance; circuitry converts those changes into a usable signal.

Some designs require an externally supplied polarizing voltage; electret designs retain an electric charge in a material. Electret microphones still generally need power for their associated electronics.

Power may come from phantom power, a battery, a dedicated supply, or an integrated device, depending on the product.

Condenser designs appear in goosenecks, boundary microphones, and conference-room arrays. [\[3.1\]](https://service.shure.com/articles/en_US/Knowledge/difference-between-a-dynamic-and-condenser-microphone)

## Ribbon microphones

Sound moves a ribbon microphone’s thin conductive ribbon within a magnetic field, generating an electrical signal. The ribbon is the moving element, without a separate coil.

Ribbons belong to the electromagnetic dynamic family, although “dynamic” often means moving-coil in product discussions. Many conventional ribbons have figure-eight patterns. Do not infer every model’s pattern or power requirements from “ribbon”: active and passive designs differ.

Never test microphones by blowing into them or tapping their grilles: this can create objectionable sound or stress sensitive elements.

## What a polar pattern tells you

A polar pattern describes relative sensitivity to sound arriving from different directions. It is not a drawing of a microphone’s maximum pickup distance.

- **Omnidirectional:** broadly sensitive around the microphone.
- **Cardioid:** favors the front and reduces response toward the rear.
- **Supercardioid and hypercardioid:** more focused front pickup, with rear pickup and rejection directions different from a cardioid.
- **Figure-eight:** sensitive to front and rear, with reduced response at the sides.

Actual patterns vary with frequency; manufacturers may show several traces. Strong rejection in one direction at one frequency may weaken at another. Off-axis sound may also have a different tonal balance.` },
      { graphic: "polar", markdown: `The intended “front” may face out of the end or side. Grille appearance alone does not reliably identify the speaking direction. [\[3.3\]](https://www.shure.com/en-US/insights/microphone-directionality-polar-pattern-basics)

## Placement and proximity effect

Many directional pressure-gradient microphones exhibit proximity effect: low-frequency response increases as the source gets very close. Omnidirectional pressure microphones generally do not exhibit this same effect. Design choices and processing can change how strongly it appears.

Closer placement may improve the direct-to-room balance while emphasizing breath noise, mouth sounds, handling noise, or proximity effect. Balance these factors rather than pursuing minimum distance. [\[3.4\]](https://www.dpamicrophones.com/mic-university/background-knowledge/proximity-effect-in-microphones-explained/)

## Sensitivity, gain, and power

Sensitivity describes electrical output for a specified acoustic input under stated conditions. Higher sensitivity means more output for the same reference sound pressure—not necessarily better quality, useful range, or room-noise rejection.

Gain is amplification applied to a signal. Two microphones may need different preamplifier gain to produce similar downstream levels. Compare their performance at appropriately matched listening levels; otherwise, “louder” can be mistaken for “better.”

Phantom power supplies DC power through a compatible balanced microphone connection. It is not an audio boost or a general cure for a quiet signal. Some microphones require it; others do not.

Before connecting unfamiliar equipment, verify the microphone’s required power, the input’s capabilities, and the cable or adapter arrangement. Follow the manufacturers’ connection procedure and mute the audio path as directed to avoid audible transients. Do not assume phantom power is universally safe or universally harmful to ribbon microphones. Model, wiring, and condition matter. If compatibility is uncertain, leave power off and obtain the relevant documentation before proceeding. [\[3.2\]](https://royerlabs.com/faqs/) [\[3.5\]](https://www.analog.com/en/resources/analog-dialogue/articles/understanding-microphone-sensitivity.html)

## In a conference room

A microphone sounds thin when addressed from the side but clear from its intended front. Increasing gain makes the thin sound louder. Check orientation, placement, and pattern information before changing equalization.

## Try it

Using the polar-pattern diagram, imagine a talker in front of a microphone and a noise source behind it. Which pattern suggests rear rejection? What would you still need to verify before choosing a real product? Include frequency-dependent behavior and the room’s reflections in your answer.

Optionally, record one sentence from two speaking positions using an already working device. Keep your voice comfortable and settings unchanged. Compare level, tone, and room sound. A phone’s microphones and automatic processing can obscure the cause; do not infer its precise pattern.

## Troubleshooting habit

Before changing processing, check the physical facts: correct microphone, intended orientation, suitable position, secure connection, and verified power requirements.

## Recap and check yourself

1. Does higher sensitivity mean better room-noise rejection?
2. Is a polar pattern identical at every frequency?
3. Should every ribbon microphone receive the same phantom-power advice?

**Answers:** 1. No. 2. No; consult frequency-specific information. 3. No; verify the model and connection requirements.

## Further reading

- [3.1 Shure: Dynamic and condenser microphones](https://service.shure.com/articles/en_US/Knowledge/difference-between-a-dynamic-and-condenser-microphone)
- [3.2 Royer Labs: Ribbon microphone phantom power FAQs](https://royerlabs.com/faqs/)
- [3.3 Shure: Microphone Directionality and Polar Pattern Basics](https://www.shure.com/en-US/insights/microphone-directionality-polar-pattern-basics)
- [3.4 DPA Microphones: Proximity effect in microphones explained](https://www.dpamicrophones.com/mic-university/background-knowledge/proximity-effect-in-microphones-explained/)
- [3.5 Analog Devices: Understanding Microphone Sensitivity](https://www.analog.com/en/resources/analog-dialogue/articles/understanding-microphone-sensitivity.html)` }
    ]
  }
];

export function getAudioLesson(slug: string) { return audioLessons.find((lesson) => lesson.slug === slug); }
