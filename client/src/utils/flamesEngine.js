/**
 * Client-Side FLAMES Algorithm and Metadata Engine
 * FLAMES:
 * F - Friendship (🤝)
 * L - Love (❤️)
 * A - Affection (😊)
 * M - Marriage (💍)
 * E - Enemy (⚔️)
 * S - Sibling (👨‍👩‍👧‍👦)
 */

export const FLAMES_CONFIG = {
  F: {
    code: 'F',
    name: 'Friendship',
    icon: '🤝',
    symbolName: 'handshake',
    themeColor: '#0ea5e9',
    gradientClass: 'bg-primary',
    gradientStyle: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    badge: 'BFFs Forever 🌟',
    score: 88,
    quote: 'True friends are like stars; you don\'t always see them, but you know they\'re always there.',
    advice: 'Plan an epic trip together, share hilarious memes, and cherish this unbreakable bond!',
    vibe: 'Laughs, Trust & Adventures'
  },
  L: {
    code: 'L',
    name: 'Love',
    icon: '❤️',
    symbolName: 'heart',
    themeColor: '#f43f5e',
    gradientClass: 'bg-danger',
    gradientStyle: 'linear-gradient(135deg, #ff1744 0%, #ff5252 50%, #ff80ab 100%)',
    badge: 'True Love Match 💘',
    score: 96,
    quote: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.',
    advice: 'Send a sweet text right now! Chemistry like this doesn\'t happen every day.',
    vibe: 'Butterflies, Passion & Sparks'
  },
  A: {
    code: 'A',
    name: 'Affection',
    icon: '😊',
    symbolName: 'smiling face',
    themeColor: '#ec4899',
    gradientClass: 'bg-warning',
    gradientStyle: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    badge: 'Sweet & Fond 🥰',
    score: 84,
    quote: 'Affection is that gentle golden light that warms the soul without burning.',
    advice: 'Give compliments freely and share a warm cup of coffee or sweet treat together.',
    vibe: 'Warmth, Comfort & Sweetness'
  },
  M: {
    code: 'M',
    name: 'Marriage',
    icon: '💍',
    symbolName: 'ring',
    themeColor: '#8b5cf6',
    gradientClass: 'bg-info',
    gradientStyle: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    badge: 'Soulmate Destiny 👰🤵',
    score: 99,
    quote: 'A successful marriage requires falling in love many times, always with the same person.',
    advice: 'Start picking wedding songs! You two are built for a lifelong adventure together.',
    vibe: 'Commitment, Eternity & Magic'
  },
  E: {
    code: 'E',
    name: 'Enemy',
    icon: '⚔️',
    symbolName: 'crossed swords',
    themeColor: '#ef4444',
    gradientClass: 'bg-dark',
    gradientStyle: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
    badge: 'Fierce Rivals 💥',
    score: 28,
    quote: 'Keep your friends close, but keep your witty sparring partner even closer!',
    advice: 'Channel that fiery tension into friendly competition (like board games or Mario Kart)!',
    vibe: 'Sparks, Rivalry & Fire'
  },
  S: {
    code: 'S',
    name: 'Sibling',
    icon: '👨‍👩‍👧‍👦',
    symbolName: 'family icon',
    themeColor: '#10b981',
    gradientClass: 'bg-success',
    gradientStyle: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    badge: 'Sibling Synergy 🍕',
    score: 78,
    quote: 'Siblings: children of the same parents, each of whom is perfectly normal until they get together.',
    advice: 'Never split the last slice of pizza without arguing first. It\'s tradition!',
    vibe: 'Protective, Teasing & Loyal'
  }
};

export const FLAMES_KEYS = ['F', 'L', 'A', 'M', 'E', 'S'];

/**
 * Client-side calculation engine
 */
export function calculateFlamesLocally(name1, name2) {
  const clean1 = (name1 || '').trim().replace(/[^a-zA-Z]/g, '');
  const clean2 = (name2 || '').trim().replace(/[^a-zA-Z]/g, '');

  if (clean1.length < 2 || clean2.length < 2) {
    throw new Error('Please enter at least 2 alphabet characters for each name.');
  }

  const arr1 = clean1.toLowerCase().split('');
  const arr2 = clean2.toLowerCase().split('');

  const matched = [];
  const remaining1 = [...arr1];
  const remaining2 = [...arr2];

  for (let i = remaining1.length - 1; i >= 0; i--) {
    const char = remaining1[i];
    const matchIdx = remaining2.indexOf(char);
    if (matchIdx !== -1) {
      matched.push(char);
      remaining1.splice(i, 1);
      remaining2.splice(matchIdx, 1);
    }
  }

  const remainingCount = remaining1.length + remaining2.length;
  let currentFlames = [...FLAMES_KEYS];
  const steps = [];

  if (remainingCount === 0) {
    return {
      name1: name1.trim(),
      name2: name2.trim(),
      cleanedName1: clean1,
      cleanedName2: clean2,
      matchedLetters: matched,
      remainingLetters1: remaining1.join(''),
      remainingLetters2: remaining2.join(''),
      remainingCount: 0,
      isPerfectMatch: true,
      eliminationSteps: [],
      resultKey: 'L',
      resultName: 'Love',
      result: FLAMES_CONFIG['L']
    };
  }

  let startIndex = 0;
  let stepNum = 1;

  while (currentFlames.length > 1) {
    const removeIdx = (startIndex + remainingCount - 1) % currentFlames.length;
    const eliminated = currentFlames[removeIdx];
    currentFlames.splice(removeIdx, 1);
    startIndex = removeIdx % currentFlames.length;

    steps.push({
      step: stepNum++,
      eliminatedLetter: eliminated,
      eliminatedName: FLAMES_CONFIG[eliminated].name,
      lettersRemaining: [...currentFlames],
      cutPosition: removeIdx
    });
  }

  const finalKey = currentFlames[0];
  const resultMeta = FLAMES_CONFIG[finalKey];

  return {
    name1: name1.trim(),
    name2: name2.trim(),
    cleanedName1: clean1,
    cleanedName2: clean2,
    matchedLetters: matched,
    remainingLetters1: remaining1.join(''),
    remainingLetters2: remaining2.join(''),
    remainingCount,
    isPerfectMatch: false,
    eliminationSteps: steps,
    resultKey: finalKey,
    resultName: resultMeta.name,
    result: resultMeta
  };
}
