// Built-in background images for the Manna verse card (bundled in the app).
// Add more by saving an image (about 9:16) in assets/images/manna/ and adding a line below.

// Photos made for Manna (also used by 'Auto' when there are no online backgrounds)
export const MANNA_IMAGES: { id: string; source: number }[] = [
  { id: 'manna-01', source: require('../../assets/images/manna/manna-01.jpg') },
  { id: 'manna-02', source: require('../../assets/images/manna/manna-02.jpg') },
  { id: 'manna-03', source: require('../../assets/images/manna/manna-03.jpg') },
  { id: 'manna-04', source: require('../../assets/images/manna/manna-04.jpg') },
  { id: 'manna-05', source: require('../../assets/images/manna/manna-05.jpg') },
  { id: 'manna-06', source: require('../../assets/images/manna/manna-06.jpg') },
  { id: 'manna-07', source: require('../../assets/images/manna/manna-07.jpg') },
  { id: 'manna-08', source: require('../../assets/images/manna/manna-08.jpg') },
  { id: 'manna-09', source: require('../../assets/images/manna/manna-09.jpg') },
  { id: 'manna-10', source: require('../../assets/images/manna/manna-10.jpg') },
  { id: 'manna-11', source: require('../../assets/images/manna/manna-11.jpg') },
  { id: 'manna-12', source: require('../../assets/images/manna/manna-12.jpg') },
  { id: 'manna-13', source: require('../../assets/images/manna/manna-13.jpg') },
  { id: 'manna-14', source: require('../../assets/images/manna/manna-14.jpg') },
  { id: 'manna-15', source: require('../../assets/images/manna/manna-15.jpg') },
];

// The prayer card images
const PRAYER_IMAGES: { id: string; source: number }[] = [
  { id: 'jericho', source: require('../../assets/images/cards/jericho.jpg') },
  { id: 'deliverance-short', source: require('../../assets/images/cards/deliverance-short.jpg') },
  { id: 'deliverance-long', source: require('../../assets/images/cards/deliverance-long.jpg') },
  { id: 'rosary-mother', source: require('../../assets/images/cards/rosary-mother.jpg') },
  { id: 'atmosphere', source: require('../../assets/images/cards/atmosphere.jpg') },
  { id: 'st-michael', source: require('../../assets/images/cards/st-michael.jpg') },
  { id: 'journey', source: require('../../assets/images/cards/journey.jpg') },
];

// Order in the background slider (after 'Auto')
export const BUILT_IN_BACKGROUNDS = [...MANNA_IMAGES, ...PRAYER_IMAGES];
