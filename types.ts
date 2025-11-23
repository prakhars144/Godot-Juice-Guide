
export enum Category {
  INTRO = 'Introduction',
  VISUALS = 'Visual Feedback',
  CAMERA = 'Camera Tricks',
  AUDIO = 'Audio Design',
  INPUT = 'Input & Control',
}

export interface Section {
  id: string;
  title: string;
  category: Category;
  content: string; // Markdown supported
  codeSnippet?: string;
  demoType?: 'intro' | 'squash' | 'shake' | 'particles' | 'flash' | 'persistence' | 'audio' | 'coyote' | 'hitstop' | 'buffer' | 'ghost' | 'text' | 'lookahead' | 'tilt' | 'shockwave' | 'ui' | 'none';
  imagePlaceholder?: string; // Fallback if no interactive demo
}

export interface JuiceConfig {
  squash: boolean;
  shake: boolean;
  particles: boolean;
  flash: boolean;
  sound: boolean;
}
