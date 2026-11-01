import { newBlock, type Block, type BlockType, type EventType, type Settings } from "./settings-shared";

type Preset = {
  label: string;
  /** example shown as the name field's placeholder — never inserted as the real name */
  nameHint: string;
  badge: string;
  line1: string;
  line2: string;
  tagline: string;
  subtitle: string;
  button: string;
  countdown: string;
  eventTitle: string;
  eventSubtitle: string;
  dress: string;
  dressNote: string;
  agendaBadge: string;
  agendaTitle: string;
  steps: [time: string, title: string, text: string][];
  galleryTitle: string;
  gallerySubtitle: string;
  rsvpTitle: string;
  rsvpSubtitle: string;
  footerTitle: string;
  footerText: string;
};

export const PRESETS: Record<EventType, Preset> = {
  general: {
    label: "General event",
    nameHint: "Our Event",
    badge: "You're invited",
    line1: "Join us for",
    line2: "{name}",
    tagline: "★ Save the date ★",
    subtitle: "We'd love to celebrate with you. Please let us know if you can make it.",
    button: "RSVP Now",
    countdown: "Countdown to the event",
    eventTitle: "Event Details",
    eventSubtitle: "Everything you need to know before you arrive.",
    dress: "Smart casual",
    dressNote: "Dress comfortably",
    agendaBadge: "Schedule",
    agendaTitle: "Event Schedule",
    steps: [
      ["6:00 PM", "Arrival & welcome", "Drinks and a warm welcome as guests arrive."],
      ["7:00 PM", "Main event", "The highlight of the evening."],
      ["8:00 PM", "Dinner & celebration", "Food, music and time to mingle."],
    ],
    galleryTitle: "Highlights",
    gallerySubtitle: "A few moments to look forward to.",
    rsvpTitle: "RSVP",
    rsvpSubtitle: "Please let us know if you can join us.",
    footerTitle: "{name}",
    footerText: "We can't wait to see you there!",
  },
  birthday: {
    label: "Birthday",
    nameHint: "Sam's Birthday Party",
    badge: "You're invited",
    line1: "Let's celebrate",
    line2: "{name}",
    tagline: "★ Another year, another reason to party ★",
    subtitle: "Join us for cake, laughs and good company. Please let us know if you can make it.",
    button: "RSVP to the Party",
    countdown: "Counting down to the party",
    eventTitle: "Party Details",
    eventSubtitle: "Here's everything you need to know.",
    dress: "Come as you are",
    dressNote: "Party outfits welcome!",
    agendaBadge: "Party plan",
    agendaTitle: "Birthday Schedule",
    steps: [
      ["3:00 PM", "Arrival & welcome drinks", "Say hello, grab a drink and settle in."],
      ["4:00 PM", "Games & fun", "Music, games and plenty of laughs."],
      ["5:00 PM", "Cake & candles", "Make a wish and sing along!"],
    ],
    galleryTitle: "Birthday memories",
    gallerySubtitle: "A little look back at the fun.",
    rsvpTitle: "Will you join the party?",
    rsvpSubtitle: "Let us know so we can plan enough cake!",
    footerTitle: "{name}",
    footerText: "Thank you for celebrating with us!",
  },
  anniversary: {
    label: "Anniversary",
    nameHint: "Our 10th Anniversary",
    badge: "Save the date",
    line1: "Celebrating",
    line2: "{name}",
    tagline: "★ Years of love and laughter ★",
    subtitle: "Join us as we mark another milestone together. Your company would mean the world.",
    button: "RSVP",
    countdown: "Counting down to our celebration",
    eventTitle: "Celebration Details",
    eventSubtitle: "Everything you need for the evening.",
    dress: "Cocktail attire",
    dressNote: "Elegant, but comfortable",
    agendaBadge: "The evening",
    agendaTitle: "Anniversary Program",
    steps: [
      ["6:30 PM", "Welcome drinks", "Toast to the occasion as guests arrive."],
      ["7:30 PM", "Dinner & speeches", "A shared meal and a few kind words."],
      ["9:00 PM", "Dancing & dessert", "Celebrate the night away."],
    ],
    galleryTitle: "Our story so far",
    gallerySubtitle: "A few favourite moments along the way.",
    rsvpTitle: "Will you celebrate with us?",
    rsvpSubtitle: "Kindly let us know if you can join.",
    footerTitle: "{name}",
    footerText: "Thank you for being part of our story.",
  },
  wedding: {
    label: "Wedding",
    nameHint: "Alex & Jordan's Wedding",
    badge: "Together with their families",
    line1: "You are invited to the wedding of",
    line2: "{name}",
    tagline: "★ Two hearts, one celebration ★",
    subtitle: "We would be honoured to have you with us on our special day. Kindly reply below.",
    button: "RSVP",
    countdown: "Until we say “I do”",
    eventTitle: "Wedding Details",
    eventSubtitle: "All the details for the big day.",
    dress: "Formal attire",
    dressNote: "Please avoid white",
    agendaBadge: "Order of the day",
    agendaTitle: "Wedding Schedule",
    steps: [
      ["2:00 PM", "Guest arrival", "Please be seated ten minutes before the ceremony."],
      ["2:30 PM", "Ceremony", "We exchange our vows."],
      ["4:00 PM", "Reception", "Dinner, speeches and dancing."],
    ],
    galleryTitle: "Our journey",
    gallerySubtitle: "A few moments we treasure.",
    rsvpTitle: "Kindly reply",
    rsvpSubtitle: "Please let us know if you can attend and how many will be joining.",
    footerTitle: "{name}",
    footerText: "With love and gratitude.",
  },
  christmas: {
    label: "Christmas",
    nameHint: "Our Christmas Party",
    badge: "Season's greetings",
    line1: "You're invited to",
    line2: "{name}",
    tagline: "★ Merry & bright ★",
    subtitle: "Join us for festive food, cheerful company and holiday spirit.",
    button: "RSVP",
    countdown: "Days until Christmas cheer",
    eventTitle: "Festive Details",
    eventSubtitle: "Everything you need for a merry evening.",
    dress: "Festive & cosy",
    dressNote: "Holiday jumpers encouraged",
    agendaBadge: "The festivities",
    agendaTitle: "Christmas Schedule",
    steps: [
      ["5:00 PM", "Welcome & mulled drinks", "Warm up with something festive."],
      ["6:00 PM", "Holiday dinner", "Good food and good company."],
      ["7:30 PM", "Carols & gift swap", "Sing along and swap a surprise."],
    ],
    galleryTitle: "Festive memories",
    gallerySubtitle: "A peek at the holiday fun.",
    rsvpTitle: "Will you be there?",
    rsvpSubtitle: "Let us know so we can set a place at the table.",
    footerTitle: "{name}",
    footerText: "Wishing you a very merry Christmas!",
  },
  "new-year": {
    label: "New Year",
    nameHint: "New Year's Eve Party",
    badge: "Ring in the new year",
    line1: "Join us for",
    line2: "{name}",
    tagline: "★ Out with the old, in with the new ★",
    subtitle: "Count down to midnight with great people, good music and a toast to what's next.",
    button: "RSVP",
    countdown: "Countdown to midnight",
    eventTitle: "Party Details",
    eventSubtitle: "All you need for a night to remember.",
    dress: "Glitz & glam",
    dressNote: "Sparkle encouraged",
    agendaBadge: "The night",
    agendaTitle: "New Year Schedule",
    steps: [
      ["8:00 PM", "Doors open", "Welcome drinks and canapés."],
      ["10:00 PM", "Music & dancing", "Warm up the dance floor."],
      ["12:00 AM", "Midnight countdown", "Toast, cheers and fireworks!"],
    ],
    galleryTitle: "Last year's highlights",
    gallerySubtitle: "A little look back before we start again.",
    rsvpTitle: "Are you in?",
    rsvpSubtitle: "Reply so we can save your spot for the countdown.",
    footerTitle: "{name}",
    footerText: "Happy New Year — here's to an amazing one!",
  },
  "baby-shower": {
    label: "Baby shower",
    nameHint: "Baby Shower for Taylor",
    badge: "A little one is on the way",
    line1: "Join us for a baby shower honouring",
    line2: "{name}",
    tagline: "★ Showered with love ★",
    subtitle: "Come share in the joy with games, treats and sweet wishes for the new arrival.",
    button: "RSVP",
    countdown: "Until the baby shower",
    eventTitle: "Shower Details",
    eventSubtitle: "Everything you need to know.",
    dress: "Pastel & comfy",
    dressNote: "Soft colours welcome",
    agendaBadge: "The afternoon",
    agendaTitle: "Shower Schedule",
    steps: [
      ["2:00 PM", "Welcome & refreshments", "Mingle over snacks and drinks."],
      ["3:00 PM", "Games & activities", "A few sweet baby-themed games."],
      ["4:00 PM", "Gifts & cake", "Open gifts and share dessert."],
    ],
    galleryTitle: "Sweet moments",
    gallerySubtitle: "A glimpse of the journey so far.",
    rsvpTitle: "Will you shower us with love?",
    rsvpSubtitle: "Please reply so we can plan for everyone.",
    footerTitle: "{name}",
    footerText: "Thank you for celebrating with us!",
  },
  graduation: {
    label: "Graduation",
    nameHint: "Jamie's Graduation Party",
    badge: "Congratulations, graduate",
    line1: "Celebrate with us at",
    line2: "{name}",
    tagline: "★ Hard work pays off ★",
    subtitle: "Help us toast a big achievement and the exciting chapter ahead.",
    button: "RSVP",
    countdown: "Until the celebration",
    eventTitle: "Celebration Details",
    eventSubtitle: "Everything you need to know.",
    dress: "Smart casual",
    dressNote: "Caps and gowns optional",
    agendaBadge: "The day",
    agendaTitle: "Graduation Schedule",
    steps: [
      ["1:00 PM", "Guests arrive", "Welcome drinks and photos."],
      ["2:00 PM", "Speeches & toasts", "Words of pride and thanks."],
      ["3:00 PM", "Lunch & celebration", "Food, music and congratulations."],
    ],
    galleryTitle: "The journey",
    gallerySubtitle: "From first day to graduation day.",
    rsvpTitle: "Will you celebrate with us?",
    rsvpSubtitle: "Please let us know if you can join.",
    footerTitle: "{name}",
    footerText: "Thank you for supporting us along the way.",
  },
  housewarming: {
    label: "Housewarming",
    nameHint: "Our Housewarming",
    badge: "Come see the new place",
    line1: "You're invited to",
    line2: "{name}",
    tagline: "★ Home sweet home ★",
    subtitle: "Stop by for a tour, some snacks and good company in our new space.",
    button: "RSVP",
    countdown: "Until the housewarming",
    eventTitle: "Housewarming Details",
    eventSubtitle: "Come over and make yourself at home.",
    dress: "Casual",
    dressNote: "Come as you are",
    agendaBadge: "The afternoon",
    agendaTitle: "Open House",
    steps: [
      ["4:00 PM", "Doors open", "Come on in and take the tour."],
      ["5:00 PM", "Food & drinks", "Nibbles, drinks and conversation."],
      ["7:00 PM", "Wind down", "Linger as long as you like."],
    ],
    galleryTitle: "A peek inside",
    gallerySubtitle: "Some of our favourite corners.",
    rsvpTitle: "Will you stop by?",
    rsvpSubtitle: "Let us know so we can have enough snacks.",
    footerTitle: "{name}",
    footerText: "Our door is always open to you.",
  },
  corporate: {
    label: "Corporate event",
    nameHint: "Annual Company Event",
    badge: "Registration open",
    line1: "Please join us for",
    line2: "{name}",
    tagline: "★ Connect, learn and celebrate ★",
    subtitle: "An opportunity to meet colleagues and partners. Please confirm your attendance below.",
    button: "Register to attend",
    countdown: "Time until the event",
    eventTitle: "Event Information",
    eventSubtitle: "Logistics and key details for attendees.",
    dress: "Business casual",
    dressNote: "Name badges provided on arrival",
    agendaBadge: "Programme",
    agendaTitle: "Event Agenda",
    steps: [
      ["9:00 AM", "Registration & coffee", "Collect your badge and meet fellow attendees."],
      ["10:00 AM", "Welcome & keynote", "Opening remarks and the main presentation."],
      ["12:30 PM", "Lunch & networking", "Connect with colleagues and partners."],
    ],
    galleryTitle: "Past events",
    gallerySubtitle: "Highlights from previous gatherings.",
    rsvpTitle: "Register your attendance",
    rsvpSubtitle: "Please confirm so we can plan seating and catering.",
    footerTitle: "{name}",
    footerText: "We look forward to seeing you.",
  },
};

const PLACEHOLDER_NAMES = new Set<string>(["", "Our Event", ...Object.values(PRESETS).map((x) => x.nameHint)]);

/** true while the event name is empty or one of the built-in examples */
export const isPlaceholderName = (name: string) => PLACEHOLDER_NAMES.has(name.trim());

export const EVENT_TYPE_OPTIONS = (Object.entries(PRESETS) as [EventType, Preset][]).map(([k, p]) => [k, p.label] as const);

/** Fill the text of the standard sections from a preset. Layout, colours, images and stickers are kept. */
export function applyPreset(s: Settings, type: EventType): Settings {
  const p = PRESETS[type];
  // never invent a name: placeholder names are cleared so the user has to type the real one
  const name = isPlaceholderName(s.name) ? "" : s.name;

  const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
  const newId = () => {
    let n = used.length + 1;
    while (used.includes(`b${n}`)) n++;
    used.push(`b${n}`);
    return `b${n}`;
  };

  // fill blocks of each type, in order, from a queue of patches ({} keeps a block as it is)
  const fill = (blocks: Block[], queues: Partial<Record<BlockType, Partial<Block>[]>>) => {
    const left = Object.fromEntries(Object.entries(queues).map(([k, v]) => [k, [...(v ?? [])]])) as Record<string, Partial<Block>[]>;
    return blocks.map((b) => ({ ...b, ...(left[b.type]?.shift() ?? {}) }));
  };

  const sections = s.sections.map((sec) => {
    switch (sec.id) {
      case "hero":
        return {
          ...sec,
          blocks: fill(sec.blocks, {
            badge: [{ text: p.badge, icon: "" }],
            heading: [{ text: p.line1 }, { text: p.line2 }],
            script: [{ text: p.tagline }],
            text: [{ text: p.subtitle }],
            button: [{ text: p.button }],
          }),
        };
      case "countdown":
        return { ...sec, blocks: fill(sec.blocks, { countdown: [{ text: p.countdown }] }) };
      case "event":
        return {
          ...sec,
          blocks: fill(sec.blocks, {
            heading: [{ text: p.eventTitle }],
            text: [{ text: p.eventSubtitle }],
            card: [{}, {}, { text2: p.dress, text3: p.dressNote }],
          }),
        };
      case "agenda": {
        const rest = fill(sec.blocks.filter((b) => b.type !== "step"), { badge: [{ text: p.agendaBadge }], heading: [{ text: p.agendaTitle }] });
        const steps = p.steps.map(([time, title, text]) => ({ ...newBlock("step", newId()), text: time, text2: title, text3: text }));
        return { ...sec, blocks: [...rest, ...steps] };
      }
      case "gallery":
        return { ...sec, blocks: fill(sec.blocks, { heading: [{ text: p.galleryTitle }], text: [{ text: p.gallerySubtitle }] }) };
      case "rsvp":
        return { ...sec, blocks: fill(sec.blocks, { rsvp: [{ text: p.rsvpTitle, text2: p.rsvpSubtitle }] }) };
      case "footer":
        return { ...sec, blocks: fill(sec.blocks, { heading: [{ text: p.footerTitle }], text: [{ text: p.footerText }] }) };
      default:
        return sec;
    }
  });

  return { ...s, name, eventType: type, sections };
}
