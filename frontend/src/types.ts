export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string;
  image_path: string;
  category: string;
  technologies: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  status: 'draft' | 'published';
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ProjectFormData = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string;
  image_path: string;
  category: string;
  custom_category: string;
  technologies: string[];
  live_url: string;
  github_url: string;
  featured: boolean;
  status: 'draft' | 'published';
  display_order: number;
};

export const PREDEFINED_CATEGORIES = [
  'Web App',
  'SaaS',
  'E-commerce',
  'Dashboard',
  'Mobile App',
  'Other',
] as const;

export const POPULAR_TECHNOLOGIES = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'Supabase',
  'PostgreSQL',
  'MongoDB',
  'Prisma',
  'Docker',
  'GraphQL',
  'Redis',
  'Python',
  'Vue.js',
  'AWS',
  'Firebase',
] as const;
