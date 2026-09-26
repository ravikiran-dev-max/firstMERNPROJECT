/**
 * FLAMES Calculation Engine with Step-by-Step Breakdown
 * FLAMES Meaning:
 * F - Friendship (🤝)
 * L - Love (❤️)
 * A - Affection (😊)
 * M - Marriage (💍)
 * E - Enemy (⚔️)
 * S - Sibling (👨‍👩‍👧‍👦)
 */

export const FLAMES_MAP = {
  F: {
    code: 'F',
    name: 'Friendship',
    icon: '🤝',
    color: '#0ea5e9', // Sky blue
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    badge: 'Best Friends Forever',
    score: 88,
    tagline: 'A bond stronger than steel and sweeter than honey!',
    description: 'You two share an undeniable chemistry of trust, endless laughs, and late-night talks. A friendship that could last lifetimes!',
    funFact: 'Best friends are the siblings destiny forgot to give us.'
  },
  L: {
    code: 'L',
    name: 'Love',
    icon: '❤️',
    color: '#f43f5e', // Rose red
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
    badge: 'Cupid Approved',
    score: 96,
    tagline: 'Sparks fly, hearts race, and butterflies dance!',
    description: 'There is electric romance in the air! You two have the stars aligned for a deep, passionate, and unforgettable love story.',
    funFact: 'When you gaze into each other\'s eyes, heart rates literally synchronize!'
  },
  A: {
    code: 'A',
    name: 'Affection',
    icon: '😊',
    color: '#ec4899', // Pink
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    badge: 'Pure Warmth & Care',
    score: 82,
    tagline: 'Gentle warmth, sweet smiles, and genuine fondness!',
    description: 'Your connection is pure tenderness and mutual respect. You make each other smile effortlessly and bring immense comfort to each other.',
    funFact: 'A gentle gesture of affection releases oxytocin, the natural cuddle hormone.'
  },
  M: {
    code: 'M',
    name: 'Marriage',
    icon: '💍',
    color: '#8b5cf6', // Violet
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    badge: 'Soulmate Destination',
    score: 99,
    tagline: 'Ring the bells, your destiny is written in the stars!',
    description: 'A lifelong partnership made in heaven! Compatibility, commitment, and timeless companionship are definitely in your cosmic cards.',
    funFact: 'The tradition of the wedding ring on the fourth finger connects directly to the Vena Amoris ("Vein of Love").'
  },
  E: {
    code: 'E',
    name: 'Enemy',
    icon: '⚔️',
    color: '#ef4444', // Red-Orange
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    badge: 'Spicy Rivals',
    score: 25,
    tagline: 'Dramatic tension, epic rivalry, or hidden sparks?',
    description: 'Watch out! You two clash like lightning and thunder. But remember: the line between fierce rivals and legendary dynamic duos is razor-thin!',
    funFact: 'Enemies-to-lovers is statistically one of the most popular relationship tropes!'
  },
  S: {
    code: 'S',
    name: 'Sibling',
    icon: '👨‍👩‍👧‍👦',
    color: '#10b981', // Emerald green
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    badge: 'Family Vibe',
    score: 75,
    tagline: 'Wholesome banter, unconditional teasing, and protective love!',
    description: 'You share that warm, squabbling, and deeply protective connection typical of siblings. You will steal each other\'s snacks but always have each other\'s back!',
    funFact: 'Sibling banter builds the sharpest wit and deepest loyalty.'
  }
};

/**
 * Validates names for FLAMES calculation
 */
export function validateNames(name1, name2) {
  if (!name1 || !name2) {
    return { valid: false, error: 'Both names are required!' };
  }

  const clean1 = name1.trim().replace(/[^a-zA-Z]/g, '');
  const clean2 = name2.trim().replace(/[^a-zA-Z]/g, '');

  if (clean1.length === 0 || clean2.length === 0) {
    return { valid: false, error: 'Please enter valid names containing alphabets.' };
  }

  if (clean1.length < 2 || clean2.length < 2) {
    return { valid: false, error: 'Names must have at least 2 alphabet characters each.' };
  }

  return { valid: true, clean1, clean2 };
}

/**
 * Calculates FLAMES with step-by-step audit
 */
export function calculateFlames(name1, name2) {
  const validation = validateNames(name1, name2);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const orig1 = name1.trim();
  const orig2 = name2.trim();
  const arr1 = validation.clean1.toLowerCase().split('');
  const arr2 = validation.clean2.toLowerCase().split('');

  // Cross-cancelling letters
  const matchedLetters = [];
  const remaining1 = [...arr1];
  const remaining2 = [...arr2];

  for (let i = remaining1.length - 1; i >= 0; i--) {
    const char = remaining1[i];
    const matchIdx = remaining2.indexOf(char);
    if (matchIdx !== -1) {
      matchedLetters.push(char);
      remaining1.splice(i, 1);
      remaining2.splice(matchIdx, 1);
    }
  }

  const remainingCount = remaining1.length + remaining2.length;
  const flameLetters = ['F', 'L', 'A', 'M', 'E', 'S'];
  const eliminationSteps = [];

  let currentFlames = [...flameLetters];
  let startIndex = 0;

  // Handle case where remainingCount is 0 (identical names or exact anagrams)
  if (remainingCount === 0) {
    // Perfect match / Soulmate Love
    const resultMeta = FLAMES_MAP['L'];
    return {
      name1: orig1,
      name2: orig2,
      cleanedName1: validation.clean1,
      cleanedName2: validation.clean2,
      matchedLetters,
      remaining1: remaining1.join(''),
      remaining2: remaining2.join(''),
      remainingCount: 0,
      isPerfectMatch: true,
      eliminationSteps: [
        {
          step: 1,
          lettersRemaining: ['L'],
          eliminatedLetter: null,
          reason: 'Count is 0: Perfect Anagram / Complete Harmony Soulmate Match!'
        }
      ],
      resultKey: 'L',
      resultName: 'Love',
      result: resultMeta
    };
  }

  let stepCount = 1;
  while (currentFlames.length > 1) {
    const removeIndex = (startIndex + remainingCount - 1) % currentFlames.length;
    const eliminated = currentFlames[removeIndex];
    
    currentFlames.splice(removeIndex, 1);
    startIndex = removeIndex % currentFlames.length;

    eliminationSteps.push({
      step: stepCount++,
      eliminatedLetter: eliminated,
      eliminatedName: FLAMES_MAP[eliminated].name,
      lettersRemaining: [...currentFlames],
      cutPosition: removeIndex
    });
  }

  const finalKey = currentFlames[0];
  const resultMeta = FLAMES_MAP[finalKey];

  return {
    name1: orig1,
    name2: orig2,
    cleanedName1: validation.clean1,
    cleanedName2: validation.clean2,
    matchedLetters,
    remaining1: remaining1.join(''),
    remaining2: remaining2.join(''),
    remainingCount,
    isPerfectMatch: false,
    eliminationSteps,
    resultKey: finalKey,
    resultName: resultMeta.name,
    result: resultMeta
  };
}
