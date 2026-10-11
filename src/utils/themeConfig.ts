import type { ThemeMode } from '../types/weather';

export interface ThemeDefinition {
  id: ThemeMode;
  name: string;
  tagline: string;
  description: string;
  previewGradient: string;
  accentColor: string;
  badgeBg: string;
  iconName: 'sparkles' | 'moon' | 'sunset' | 'zap' | 'shield' | 'sun' | 'cloud-sun';
}

export const THEME_LIST: ThemeDefinition[] = [
  {
    id: 'aurora',
    name: 'Northern Aurora',
    tagline: 'Luminous Emerald & Violet',
    description: 'Ethereal northern lights with glowing emerald, cyan, and violet mesh glow.',
    previewGradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    iconName: 'sparkles',
  },
  {
    id: 'midnight',
    name: 'Cyber Midnight',
    tagline: 'Deep Sapphire & Cobalt',
    description: 'Deep oceanic midnight canvas with high-tech sapphire and cobalt electric auras.',
    previewGradient: 'linear-gradient(135deg, #2563eb 0%, #0284c7 50%, #1e1b4b 100%)',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    iconName: 'moon',
  },
  {
    id: 'sunset',
    name: 'Twilight Dusk',
    tagline: 'Warm Amber & Violet',
    description: 'Radiant golden hour sunset with warm amber, fiery rose, and mystical dusk violet.',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #7c3aed 100%)',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconName: 'sunset',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'Electric Magenta & Cyan',
    description: 'Futuristic night matrix with ultraviolet, neon magenta, and laser cyan glow.',
    previewGradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)',
    accentColor: '#ec4899',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    iconName: 'zap',
  },
  {
    id: 'obsidian',
    name: 'OLED Obsidian',
    tagline: 'Pure Pitch Black & Crystal',
    description: 'Ultra-dark minimalist luxury with crystalline borders and zero distraction.',
    previewGradient: 'linear-gradient(135deg, #334155 0%, #0f172a 50%, #030508 100%)',
    accentColor: '#94a3b8',
    badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
    iconName: 'shield',
  },
  {
    id: 'auto',
    name: 'Weather Reactive',
    tagline: 'Live Atmospheric Sync',
    description: 'Automatically shifts color palettes in real-time matching the local sky and weather.',
    previewGradient: 'linear-gradient(135deg, #0284c7 0%, #f59e0b 50%, #8b5cf6 100%)',
    accentColor: '#38bdf8',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    iconName: 'cloud-sun',
  },
  {
    id: 'light',
    name: 'Frost Daylight',
    tagline: 'Crisp Glass Light Mode',
    description: 'Bright and airy daylight theme with soft frosted glass and sky reflections.',
    previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #e0e7ff 50%, #ffffff 100%)',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-100 text-sky-700 border-sky-200',
    iconName: 'sun',
  },
];
