import { create } from 'zustand';

export type MediaType = 'photo' | 'video' | 'vector' | 'png';
export type StatusType = 'idle' | 'processing' | 'done' | 'error';

export interface MediaFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  type: MediaType;
  mimeType?: string;
}

export interface MetadataResult {
  id: string;
  fileId: string;
  file: MediaFile;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  colors: string[];
  modelRelease: boolean;
  propertyRelease: boolean;
  score: number;
  platforms: string[];
  createdAt: Date;
  status: StatusType;
}

interface AppStore {
  // Upload
  pendingFiles: MediaFile[];
  addFiles: (files: MediaFile[]) => void;
  removeFile: (id: string) => void;
  clearPending: () => void;

  // Results
  results: MetadataResult[];
  addResult: (result: MetadataResult) => void;
  updateResult: (id: string, partial: Partial<MetadataResult>) => void;
  deleteResult: (id: string) => void;

  // Active result for detail view
  activeResultId: string | null;
  setActiveResult: (id: string | null) => void;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  setGenerating: (val: boolean) => void;
  setProgress: (val: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  pendingFiles: [],
  addFiles: (files) =>
    set((s) => ({ pendingFiles: [...s.pendingFiles, ...files] })),
  removeFile: (id) =>
    set((s) => ({ pendingFiles: s.pendingFiles.filter((f) => f.id !== id) })),
  clearPending: () => set({ pendingFiles: [] }),

  results: MOCK_RESULTS,
  addResult: (result) =>
    set((s) => ({ results: [result, ...s.results] })),
  updateResult: (id, partial) =>
    set((s) => ({
      results: s.results.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    })),
  deleteResult: (id) =>
    set((s) => ({ results: s.results.filter((r) => r.id !== id) })),

  activeResultId: null,
  setActiveResult: (id) => set({ activeResultId: id }),

  isGenerating: false,
  generationProgress: 0,
  setGenerating: (val) => set({ isGenerating: val }),
  setProgress: (val) => set({ generationProgress: val }),
}));

// ── Mock seed data ──────────────────────────────────────────
const MOCK_RESULTS: MetadataResult[] = [
  {
    id: '1',
    fileId: 'f1',
    file: { id: 'f1', uri: '', name: 'mountain-sunset-landscape.jpg', size: 4400000, type: 'photo' },
    title: 'Aerial view of tropical mountain landscape at golden sunset',
    description: 'Beautiful aerial perspective of a lush tropical mountain range bathed in warm golden sunset light, with dramatic cloud formations over the valley below.',
    category: 'Nature & Landscapes',
    keywords: ['mountain', 'sunset', 'tropical', 'aerial', 'landscape', 'nature', 'golden hour', 'clouds', 'valley', 'drone view', 'travel', 'scenic', 'panorama', 'wilderness'],
    colors: ['#D4853A', '#E8B86D', '#2C5F3E', '#7BA68A', '#4A7BAA', '#1A2B45'],
    modelRelease: false,
    propertyRelease: false,
    score: 88,
    platforms: ['Shutterstock', 'Adobe Stock', 'Getty Images'],
    createdAt: new Date(),
    status: 'done',
  },
  {
    id: '2',
    fileId: 'f2',
    file: { id: 'f2', uri: '', name: 'abstract-business-vector.eps', size: 820000, type: 'vector' },
    title: 'Abstract modern business infographic vector set',
    description: 'Clean minimal vector illustration set for business presentations, featuring geometric shapes and bold lines.',
    category: 'Business & Finance',
    keywords: ['abstract', 'business', 'vector', 'geometric', 'minimal', 'infographic', 'presentation', 'modern', 'corporate', 'design'],
    colors: ['#1D9E75', '#5DCAA5', '#0F6E56'],
    modelRelease: false,
    propertyRelease: false,
    score: 91,
    platforms: ['Shutterstock', 'Adobe Stock'],
    createdAt: new Date(Date.now() - 3600000 * 5),
    status: 'done',
  },
  {
    id: '3',
    fileId: 'f3',
    file: { id: 'f3', uri: '', name: 'food-photography-bowl.mp4', size: 48000000, type: 'video' },
    title: '',
    description: '',
    category: '',
    keywords: [],
    colors: [],
    modelRelease: false,
    propertyRelease: false,
    score: 0,
    platforms: [],
    createdAt: new Date(Date.now() - 3600000 * 2),
    status: 'processing',
  },
  {
    id: '4',
    fileId: 'f4',
    file: { id: 'f4', uri: '', name: 'colorful-flowers-spring.jpg', size: 6100000, type: 'photo' },
    title: 'Vibrant spring flowers in full bloom close-up macro',
    description: 'A stunning macro photograph of colorful spring flowers in full bloom, showcasing intricate petal details and vivid color palette.',
    category: 'Nature & Landscapes',
    keywords: ['flowers', 'spring', 'macro', 'colorful', 'bloom', 'petal', 'nature', 'garden', 'floral', 'pink', 'botanical', 'close-up', 'vibrant', 'beautiful'],
    colors: ['#F4C0D1', '#ED93B1', '#D4537E', '#FAC775', '#5DCAA5'],
    modelRelease: false,
    propertyRelease: false,
    score: 95,
    platforms: ['Shutterstock', 'Adobe Stock', 'Getty Images', 'Alamy'],
    createdAt: new Date(Date.now() - 3600000 * 24),
    status: 'done',
  },
  {
    id: '5',
    fileId: 'f5',
    file: { id: 'f5', uri: '', name: 'portrait-woman-studio.jpg', size: 5400000, type: 'photo' },
    title: 'Professional studio portrait of young woman with soft lighting',
    description: 'High-quality studio portrait of a young woman with professional soft box lighting, suitable for commercial and editorial use.',
    category: 'People & Portraits',
    keywords: ['portrait', 'woman', 'studio', 'professional', 'model', 'lighting', 'beauty', 'female', 'headshot', 'commercial', 'editorial', 'soft light'],
    colors: ['#FBEAF0', '#ED93B1', '#D4537E', '#4B1528'],
    modelRelease: true,
    propertyRelease: false,
    score: 89,
    platforms: ['Shutterstock', 'Getty Images'],
    createdAt: new Date(Date.now() - 3600000 * 72),
    status: 'done',
  },
];
