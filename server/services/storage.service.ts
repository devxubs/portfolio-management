import { getSupabaseClient } from './supabase.client';
import path from 'path';

export const BUCKET_NAME = 'portfolio-projects';

export class StorageService {
  /**
   * Upload an image file to Supabase Storage bucket 'portfolio-projects'
   * Returns { image_url, image_path }
   */
  async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'covers'
  ): Promise<{ image_url: string; image_path: string }> {
    const ext = path.extname(originalName) || '.png';
    const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sanitizedName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const fileName = `${sanitizedName}-${timestamp}-${randomStr}${cleanExt}`;
    const filePath = `${folder}/${fileName}`;

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        // Ensure bucket exists if needed
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase storage upload error:', uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        return {
          image_url: publicUrlData.publicUrl,
          image_path: filePath,
        };
      } catch (err) {
        console.warn('Falling back to direct data-url storage:', err);
      }
    }

    // Fallback: Store as base64 data URI for instant sandbox preview
    const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return {
      image_url: base64Data,
      image_path: filePath,
    };
  }

  /**
   * Delete an image from Supabase Storage
   */
  async deleteImage(filePath: string): Promise<boolean> {
    if (!filePath) return true;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (error) {
          console.warn('Failed to delete image from Supabase storage:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.warn('Error deleting from Supabase storage:', err);
        return false;
      }
    }

    return true;
  }
}

export const storageService = new StorageService();
