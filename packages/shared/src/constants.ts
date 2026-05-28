import type { TranslationLanguage } from './types';

export const languages: TranslationLanguage[] = [
  { key: 'en', title: 'English',    flag: '🇬🇧' },
  { key: 'fr', title: 'French',     flag: '🇫🇷' },
  { key: 'es', title: 'Spanish',    flag: '🇪🇸' },
  { key: 'de', title: 'German',     flag: '🇩🇪' },
  { key: 'it', title: 'Italian',    flag: '🇮🇹' },
  { key: 'jp', title: 'Japanese',   flag: '🇯🇵' },
  { key: 'pt', title: 'Portuguese', flag: '🇵🇹' },
  { key: 'ar', title: 'Arabic',     flag: '🇸🇦' },
  { key: 'zh', title: 'Chinese',    flag: '🇨🇳' },
  { key: 'ko', title: 'Korean',     flag: '🇰🇷' },
];

export const categories = [
  { value: 'technology', title: 'Technology' },
  { value: 'lifestyle',  title: 'Lifestyle' },
  { value: 'business',   title: 'Business' },
  { value: 'design',     title: 'Design' },
  { value: 'innovation', title: 'Innovation' },
  { value: 'education',  title: 'Education' },
];