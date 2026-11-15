export type Lang = 'ml' | 'en';
type T = Record<Lang, string>;

// A prayer can be written as "blocks", each styled by its nature:
//   text        – normal prayer text (blank line = new paragraph)
//   instruction – guidance for the person praying, in italics
//   heading     – a small section title
//   litany      – a bulleted list of invocations, with an optional response after each
//   verse       – a Bible verse, shown big with a quotation mark (like the Manna card)
export type Block =
  | { type: 'text' | 'instruction' | 'heading'; text: T }
  | { type: 'litany'; items: T[]; response?: T }
  | { type: 'verse'; text: T; ref?: T };

export type Prayer = {
  id: string;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  image?: number | { uri: string }; // card background: require('...') here, or a web address when downloaded
  showTitle?: boolean;          // show the prayer name on the card (default: true)
  bannerFocus?: string;         // which part of the image the prayer page banner shows, e.g. '20%' (0% = top, default)
  note?: Record<Lang, string>;  // short note after the prayer, e.g. "This prayer may be repeated."
  verse?: { text: Record<Lang, string>; ref: Record<Lang, string> }; // Bible verse shown after the prayer
  blocks?: Block[];             // styled content (used instead of body/note/verse when present)
};

// The blocks to show for a prayer: its own blocks, or ones built from body / note / verse
export function blocksFor(p: Prayer): Block[] {
  if (p.blocks?.length) return p.blocks;
  const out: Block[] = [];
  if (p.body.ml || p.body.en) out.push({ type: 'text', text: p.body });
  if (p.note && (p.note.ml || p.note.en)) out.push({ type: 'instruction', text: p.note });
  if (p.verse && (p.verse.text.ml || p.verse.text.en)) out.push({ type: 'verse', text: p.verse.text, ref: p.verse.ref });
  return out;
}

// Card backgrounds live in assets/images. To add one:
//   1. Save the image (about 900 × 1287) in assets/images/
//   2. Add  image: require('../../assets/images/<file>'),  to the prayer below
// Prayers without an image get a plain red placeholder card.

export const PRAYERS: Prayer[] = [
//   prayer Card 1
  {
    id: 'jericho',
    title: { ml: 'ജെറിക്കോ പ്രാർത്ഥന', en: 'Jericho Prayer' },
    body: { ml: '', en: '' },
    image: require('../../assets/images/cards/jericho.jpg'),
  },
//   prayer Card 2
  {
    id: 'deliverance-short',
    title: { ml: 'ചെറിയ വിടുതൽ പ്രാർത്ഥന', en: 'Deliverance Prayer Short' },
    body: {
      ml: `കർത്താവായ ഈശോയേ, അങ്ങു കുരിശിൽ ചിന്തിയ തിരുരക്തത്തിന്റെ യോഗ്യതയാലും കുരിശിലെ വിജയത്താലും അങ്ങയോടു ഐക്യപ്പെട്ടു പ്രാർത്ഥിക്കുന്ന എന്നെയും എന്റെ കുടുംബത്തെയും (സമൂഹം) ബന്ധുമിത്രാദികളെയും ഭവനങ്ങളെയും പരിസരത്തെയും അങ്ങയുടെ തിരുരക്തം കൊണ്ട് പൊതിഞ്ഞു, എല്ലാ പൈശാചിക ശക്തികളുടെ ആക്രമണങ്ങളിൽ നിന്നും സംരക്ഷിക്കണമേ. ഞങ്ങളെ ഉപദ്രവിക്കുന്ന എല്ലാ അന്ധകാര ശക്തികളെയും, ദുഷ്ട പിശാചുക്കളെയും അവയുടെ പ്രവർത്തനങ്ങളെയും, കർത്താവായ യേശുവേ അങ്ങയുടെ നാമത്തിൽ ബന്ധിച്ചു ഞങ്ങളെ രക്ഷിക്കണമേ ആമേൻ`,
      en: `Lord Jesus, by the merits of the Precious Blood You shed on the Cross and by Your victory on the Cross, cover me, who pray in union with You, my family (community), my relatives and friends, our homes and our surroundings with Your Precious Blood, and protect us from every attack of the evil powers. Lord Jesus, in Your name, bind all the powers of darkness, the evil spirits and all their works that trouble us, and save us. Amen.`,
    },
    image: require('../../assets/images/cards/deliverance-short.jpg'),
  },
  //   prayer Card 3
  {
    id: 'deliverance-long',
    title: { ml: 'വലിയ വിടുതൽ പ്രാർത്ഥന', en: 'Deliverance Prayer Long' },
    body: {
      ml: `കർത്താവായ ഈശോയേ, ഞങ്ങളുടെ ജീവിതത്തിലെ ബന്ധനങ്ങൾ മാറ്റി, അവിടുത്തെ തിരുരക്തം ഒഴുക്കി, പരിശുദ്ധ അമ്മയുടെ വിമലഹൃദയത്തിന്റെ യോഗ്യതയാൽ, കോടാനുകോടി മാലാഖമാരുടെയും, സ്വർഗ്ഗീയ മധ്യസ്ഥരുടെയും, രക്ത സാക്ഷികളുടെയും, വേദസാക്ഷികളുടെയും, സഹായവും സംരക്ഷണവും നൽകി അങ്ങയുടെ നാമത്തിൽ പിതാവിനോട് ചോദിക്കുന്ന ഈ കാര്യം (ആവശ്യം പറയുക) സാധിച്ചു തരണമേ

ആവർത്തിച്ചു ചൊല്ലാവുന്നതാണ്

വചനം: നിങ്ങൾ എന്റെ നാമത്തിൽ ആവശ്യപെടുന്നതെന്തും പിതാവ് പുത്രനിൽ മഹത്വ പെടാൻ വേണ്ടി ഞാൻ പ്രവർത്തിക്കും (യോഹന്നാൻ 14:13)`,
      en: `Lord Jesus, remove the bondages in our lives and pour out Your Precious Blood. Through the merits of the Immaculate Heart of our Blessed Mother, and with the help and protection of the countless angels, the heavenly intercessors, the martyrs and the confessors of the faith, grant us this intention (state your need), which we ask of the Father in Your name.

This prayer may be repeated.

Word of God: "Whatever you ask in my name, I will do, so that the Father may be glorified in the Son." (John 14:13)`,
    },
    image: require('../../assets/images/cards/deliverance-long.jpg'),
  },
  //   prayer Card 4
  {
    id: 'rosary-mother',
    title: { ml: 'ദൈവ മാതാവിനോടുള്ള ജപമാല പ്രാർത്ഥന', en: 'Rosary to the Mother of God' },
    body: { ml: '', en: '' },
    image: require('../../assets/images/cards/rosary-mother.jpg'),
  },
  //   prayer Card 5
  {
    id: 'atmosphere',
    title: { ml: 'അന്തരീക്ഷ വിശുദ്ധീകരണ പ്രാർത്ഥന', en: 'Prayer for Purifying the Atmosphere' },
    body: { ml: '', en: '' },
    image: require('../../assets/images/cards/atmosphere.jpg'),
  },
  //   prayer Card 6
  {
    id: 'st-michael',
    title: { ml: 'വി. മിഖായേൽ മാലാഖയോടുള്ള പ്രാർത്ഥന', en: 'Prayer to St. Michael the Archangel' },
    body: { ml: '', en: '' },
    image: require('../../assets/images/cards/st-michael.jpg'),
},
//   prayer Card 7
{
    id: 'journey',
    title: { ml: 'യാത്ര ആരംഭിക്കും മുമ്പുള്ള പ്രാർത്ഥന', en: 'Prayer Before a Journey' },
    body: { ml: '', en: '' },
    image: require('../../assets/images/cards/journey.jpg'),
  },
];

export const DEFAULT_FAVOURITES = ['jericho', 'deliverance-short', 'atmosphere', 'st-michael'];

export const getPrayer = (id: string) => PRAYERS.find(p => p.id === id);