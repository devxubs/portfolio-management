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

export type CreateProjectDTO = Omit<Project, 'id' | 'created_at' | 'updated_at'>;

export type UpdateProjectDTO = Partial<CreateProjectDTO>;
