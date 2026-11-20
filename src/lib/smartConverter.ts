import {
  COMPOUND_NAMES,
  COMMON_NAMES,
  ADDRESS_TERMS,
  EGYPTIAN_LOCATIONS,
  REVERSE_NAMES,
  REVERSE_ADDRESS_TERMS,
  REVERSE_LOCATIONS,
  normalizeKey,
} from './dictionary';

// Detect whether text is predominantly Arabic or English
export function detectLanguage(text: string): 'ar' | 'en' {
  if (!text || !text.trim()) return 'ar';
  
  // Count Arabic characters
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicMatches = text.match(arabicRegex);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;

  // Count Latin characters
  const latinRegex = /[a-zA-Z]/g;
  const latinMatches = text.match(latinRegex);
  const latinCount = latinMatches ? latinMatches.length : 0;

  if (arabicCount > 0 && arabicCount >= latinCount) {
    return 'ar';
  }
  return 'en';
}

// Clean and normalize Arabic text for lookup
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْـ]/g, '') // remove tashkeel and tatweel
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

// Fallback phonetic transliteration: Arabic to English (Egyptian dialect favored)
export function phoneticallyTransliterateArToEn(word: string): string {
  // Strip tashkeel
  const clean = word.replace(/[ًٌٍَُِّْـ]/g, '');
  if (!clean) return word;

  // Check if starts with 'ال'
  let prefix = '';
  let rest = clean;
  if (clean.startsWith('ال') && clean.length > 2) {
    prefix = 'El ';
    rest = clean.slice(2);
  }

  const charMap: Record<string, string> = {
    'ا': 'a',
    'أ': 'a',
    'إ': 'e',
    'آ': 'aa',
    'ب': 'b',
    'ت': 't',
    'ث': 'th',
    'ج': 'g', // Egyptian 'g'
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'z',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'd',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'k',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y',
    'ى': 'a',
    'ة': 'a',
    'ء': '',
    'ئ': 'e',
    'ؤ': 'o',
  };

  let result = '';
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    result += charMap[ch] !== undefined ? charMap[ch] : ch;
  }

  // Capitalize properly
  const formatted = result.charAt(0).toUpperCase() + result.slice(1);
  return prefix + formatted;
}

// Fallback phonetic transliteration: English to Arabic
export function phoneticallyTransliterateEnToAr(word: string): string {
  const lower = word.toLowerCase();
  if (!lower) return word;

  // Handle 'el ' or 'al ' prefix
  if (lower.startsWith('el ') || lower.startsWith('al ')) {
    return 'ال' + phoneticallyTransliterateEnToAr(lower.slice(3));
  }
  if (lower.startsWith('el-') || lower.startsWith('al-')) {
    return 'ال' + phoneticallyTransliterateEnToAr(lower.slice(3));
  }

  // Character and diphthong replacement
  let res = lower
    .replace(/sh/g, 'ش')
    .replace(/ch/g, 'تش')
    .replace(/th/g, 'ث')
    .replace(/kh/g, 'خ')
    .replace(/gh/g, 'غ')
    .replace(/ph/g, 'ف')
    .replace(/ee/g, 'ي')
    .replace(/oo/g, 'و')
    .replace(/ou/g, 'و')
    .replace(/aa/g, 'ا')
    '';

  const map: Record<string, string> = {
    'a': 'ا',
    'b': 'ب',
    'c': 'ك',
    'd': 'د',
    'e': 'ي',
    'f': 'ف',
    'g': 'ج',
    'h': 'ه',
    'i': 'ي',
    'j': 'ج',
    'k': 'ك',
    'l': 'ل',
    'm': 'م',
    'n': 'ن',
    'o': 'و',
    'p': 'ب',
    'q': 'ق',
    'r': 'ر',
    's': 'س',
    't': 'ت',
    'u': 'و',
    'v': 'ف',
    'w': 'و',
    'x': 'كس',
    'y': 'ي',
    'z': 'ز',
  };

  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    if (map[ch]) {
      res += map[ch];
    } else {
      res += ch;
    }
  }

  return res;
}

// Smart Arabic -> English Converter
export function convertArabicToEnglish(text: string): string {
  if (!text || !text.trim()) return '';

  // Process line by line to preserve formatting
  const lines = text.split('\n');
  const convertedLines = lines.map((line) => {
    let currentLine = line;

    // 1. First, check full address or multi-word phrase in EGYPTIAN_LOCATIONS
    for (const [ar, en] of Object.entries(EGYPTIAN_LOCATIONS)) {
      const regex = new RegExp(`(^|\\b|\\s|،|,)${escapeRegExp(ar)}(\\b|\\s|،|,|$)`, 'g');
      if (regex.test(currentLine)) {
        currentLine = currentLine.replace(regex, `$1${en}$2`);
      }
    }

    // 2. Check compound names (e.g. عبد الرحمن, نور الدين)
    for (const [ar, en] of Object.entries(COMPOUND_NAMES)) {
      const regex = new RegExp(`(^|\\b|\\s|،|,)${escapeRegExp(ar)}(\\b|\\s|،|,|$)`, 'g');
      if (regex.test(currentLine)) {
        currentLine = currentLine.replace(regex, `$1${en}$2`);
      }
    }

    // 3. Handle structural address terms (e.g. شارع عباس العقاد -> Abbas El Akkad Street)
    // Note: In Arabic, "شارع X" becomes "X Street" in English
    const streetRegex = /(?:شارع|ش\.|ش)\s+([A-Za-z0-9\s]+|[\u0600-\u06FF\s]+?)(?=،|,|\n|$)/g;
    currentLine = currentLine.replace(streetRegex, (_match, name) => {
      const trimmed = name.trim();
      const translatedName = convertWordOrNameArToEn(trimmed);
      return `${translatedName} Street`;
    });

    const squareRegex = /(?:ميدان)\s+([A-Za-z0-9\s]+|[\u0600-\u06FF\s]+?)(?=،|,|\n|$)/g;
    currentLine = currentLine.replace(squareRegex, (_match, name) => {
      const trimmed = name.trim();
      const translatedName = convertWordOrNameArToEn(trimmed);
      return `${translatedName} Square`;
    });

    const roadRegex = /(?:طريق)\s+([A-Za-z0-9\s]+|[\u0600-\u06FF\s]+?)(?=،|,|\n|$)/g;
    currentLine = currentLine.replace(roadRegex, (_match, name) => {
      const trimmed = name.trim();
      const translatedName = convertWordOrNameArToEn(trimmed);
      return `${translatedName} Road`;
    });

    // 4. Translate remaining standalone address terms
    for (const [ar, en] of Object.entries(ADDRESS_TERMS)) {
      const regex = new RegExp(`(^|\\b|\\s|،|,)${escapeRegExp(ar)}(\\b|\\s|،|,|$)`, 'g');
      currentLine = currentLine.replace(regex, `$1${en}$2`);
    }

    // 5. Tokenize remaining words and convert names / nouns
    // Split by commas, whitespace, punctuation
    const tokens = currentLine.split(/([\s،,.:;!؟?()\-]+)/);
    const convertedTokens = tokens.map((token) => {
      // If punctuation or whitespace, keep as is (convert Arabic comma to English comma)
      if (/^[\s،,.:;!؟?()\-]+$/.test(token)) {
        return token.replace(/،/g, ',').replace(/؟/g, '?');
      }
      return convertWordOrNameArToEn(token);
    });

    return convertedTokens.join('');
  });

  return convertedLines.join('\n');
}

// Convert single word or individual name Arabic -> English
function convertWordOrNameArToEn(word: string): string {
  const trimmed = word.trim();
  if (!trimmed) return word;

  // Direct exact match in COMMON_NAMES
  if (COMMON_NAMES[trimmed]) {
    return COMMON_NAMES[trimmed];
  }

  // Direct match in EGYPTIAN_LOCATIONS
  if (EGYPTIAN_LOCATIONS[trimmed]) {
    return EGYPTIAN_LOCATIONS[trimmed];
  }

  // Direct match in ADDRESS_TERMS
  if (ADDRESS_TERMS[trimmed]) {
    return ADDRESS_TERMS[trimmed];
  }

  // Check normalized form in common names
  const norm = normalizeArabic(trimmed);
  for (const [ar, en] of Object.entries(COMMON_NAMES)) {
    if (normalizeArabic(ar) === norm) {
      return en;
    }
  }

  // Check if word has "ال" prefix (family name or location like الغوري -> El Ghoury)
  if (trimmed.startsWith('ال') && trimmed.length > 2) {
    const base = trimmed.slice(2);
    if (COMMON_NAMES[trimmed]) return COMMON_NAMES[trimmed];
    if (COMMON_NAMES[base]) return `El ${COMMON_NAMES[base]}`;
    // Check if base is in locations
    if (EGYPTIAN_LOCATIONS[base]) return `El ${EGYPTIAN_LOCATIONS[base]}`;
  }

  // If already English or numbers, leave intact
  if (/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
    return trimmed;
  }

  // Fallback to phonetic transliteration
  return phoneticallyTransliterateArToEn(trimmed);
}

// Smart English -> Arabic Converter
export function convertEnglishToArabic(text: string): string {
  if (!text || !text.trim()) return '';

  const lines = text.split('\n');
  const convertedLines = lines.map((line) => {
    let currentLine = line;

    // 1. Check locations first (e.g. Cairo, Nasr City, Heliopolis)
    for (const [normEn, ar] of Object.entries(REVERSE_LOCATIONS)) {
      const regex = new RegExp(`(^|\\b|\\s|,)${escapeRegExp(normEn)}(\\b|\\s|,|$)`, 'gi');
      if (regex.test(currentLine)) {
        currentLine = currentLine.replace(regex, `$1${ar}$2`);
      }
    }

    // 2. Handle patterns like "X Street" -> "شارع X", "X Road" -> "طريق X", "X Square" -> "ميدان X"
    const streetEnRegex = /(^|[,\s،])([A-Za-z0-9\u0600-\u06FF]+(?:\s+[A-Za-z0-9\u0600-\u06FF]+)*)\s+(?:Street|St\.|St)\b/gi;
    currentLine = currentLine.replace(streetEnRegex, (_match, prefix, name) => {
      const trimmed = name.trim();
      const convertedName = convertWordOrNameEnToAr(trimmed);
      return `${prefix}شارع ${convertedName}`;
    });

    const squareEnRegex = /(^|[,\s،])([A-Za-z0-9\u0600-\u06FF]+(?:\s+[A-Za-z0-9\u0600-\u06FF]+)*)\s+(?:Square|Sq\.|Sq)\b/gi;
    currentLine = currentLine.replace(squareEnRegex, (_match, prefix, name) => {
      const trimmed = name.trim();
      const convertedName = convertWordOrNameEnToAr(trimmed);
      return `${prefix}ميدان ${convertedName}`;
    });

    const roadEnRegex = /(^|[,\s،])([A-Za-z0-9\u0600-\u06FF]+(?:\s+[A-Za-z0-9\u0600-\u06FF]+)*)\s+(?:Road|Rd\.|Rd)\b/gi;
    currentLine = currentLine.replace(roadEnRegex, (_match, prefix, name) => {
      const trimmed = name.trim();
      const convertedName = convertWordOrNameEnToAr(trimmed);
      return `${prefix}طريق ${convertedName}`;
    });

    // 3. Check compound names (e.g. Abdelrahman Mohamed Ahmed El Ghoury)
    // Try matching multi-word chunks in REVERSE_NAMES
    for (const [normEn, ar] of Object.entries(REVERSE_NAMES)) {
      if (normEn.includes(' ')) {
        const regex = new RegExp(`(^|\\b|\\s|,)${escapeRegExp(normEn)}(\\b|\\s|,|$)`, 'gi');
        if (regex.test(currentLine)) {
          currentLine = currentLine.replace(regex, `$1${ar}$2`);
        }
      }
    }

    // 4. Check address terms (Building, Floor, Apartment, etc.)
    for (const [normEn, ar] of Object.entries(REVERSE_ADDRESS_TERMS)) {
      const regex = new RegExp(`(^|\\b|\\s|,)${escapeRegExp(normEn)}(\\b|\\s|,|$)`, 'gi');
      currentLine = currentLine.replace(regex, `$1${ar}$2`);
    }

    // 5. Tokenize remaining words and convert names
    const tokens = currentLine.split(/([\s,.:;!?()\-]+)/);
    const convertedTokens = tokens.map((token) => {
      if (/^[\s,.:;!?()\-]+$/.test(token)) {
        // Convert English comma to Arabic comma when converting to Arabic
        return token.replace(/,/g, '،').replace(/\?/g, '؟');
      }
      return convertWordOrNameEnToAr(token);
    });

    let res = convertedTokens.join('');
    // Normalize spacing around Arabic comma: "، "
    res = res.replace(/\s*،\s*/g, '، ');
    return res;
  });

  return convertedLines.join('\n');
}

// Convert single word or individual name English -> Arabic
function convertWordOrNameEnToAr(word: string): string {
  const trimmed = word.trim();
  if (!trimmed) return word;

  const norm = normalizeKey(trimmed);

  // Check in reverse names
  if (REVERSE_NAMES[norm]) {
    return REVERSE_NAMES[norm];
  }

  // Check in reverse locations
  if (REVERSE_LOCATIONS[norm]) {
    return REVERSE_LOCATIONS[norm];
  }

  // Check in reverse address terms
  if (REVERSE_ADDRESS_TERMS[norm]) {
    return REVERSE_ADDRESS_TERMS[norm];
  }

  // Check if starts with "El " or "El-" or "Al " (e.g. El Ghoury -> الغوري)
  if (norm.startsWith('el ') || norm.startsWith('al ')) {
    const base = norm.slice(3);
    if (REVERSE_NAMES[base]) {
      return 'ال' + REVERSE_NAMES[base];
    }
  }

  // If already Arabic, keep as is
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed;
  }

  // If numbers, keep
  if (/^[0-9]+$/.test(trimmed)) {
    return trimmed;
  }

  // Fallback to phonetic transliteration
  return phoneticallyTransliterateEnToAr(trimmed);
}

// Helper to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Smart Local Converter Wrapper
export function smartConvertLocal(
  text: string,
  sourceLang: 'ar' | 'en',
  targetLang: 'ar' | 'en'
): string {
  if (!text || !text.trim()) return '';
  if (sourceLang === targetLang) return text;

  if (sourceLang === 'ar' && targetLang === 'en') {
    return convertArabicToEnglish(text);
  } else if (sourceLang === 'en' && targetLang === 'ar') {
    return convertEnglishToArabic(text);
  }

  return text;
}

// Unified Converter with AI API Support + Intelligent Offline Fallback
export interface ConvertResponse {
  result: string;
  source: 'ai' | 'engine';
  model?: string;
  error?: string;
}

export async function convertText(
  text: string,
  sourceLang: 'ar' | 'en',
  targetLang: 'ar' | 'en',
  options?: {
    customApiKey?: string;
    apiProvider?: 'gemini' | 'openai' | 'groq' | 'auto';
  }
): Promise<ConvertResponse> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { result: '', source: 'engine' };
  }

  // Attempt serverless AI call
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options?.customApiKey) {
      headers['X-Custom-API-Key'] = options.customApiKey;
    }
    if (options?.apiProvider) {
      headers['X-API-Provider'] = options.apiProvider;
    }

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: trimmed,
        sourceLang,
        targetLang,
        context: 'natural-converter',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.result) {
        return {
          result: data.result.trim(),
          source: data.source || 'ai',
          model: data.model,
        };
      }
    }
  } catch (_e) {
    // Network or serverless route unavailable - smoothly proceed to offline engine
  }

  // Intelligent offline fallback engine
  const localResult = smartConvertLocal(trimmed, sourceLang, targetLang);
  return {
    result: localResult,
    source: 'engine',
  };
}
