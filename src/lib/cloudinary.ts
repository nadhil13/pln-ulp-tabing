// Cloudinary configuration for PLN Inventory System
const CLOUD_NAME = 'dr5lqvvhy';
const UPLOAD_PRESET = 'pln_inventory_upload';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload an image file to Cloudinary using unsigned upload
 * @param file - The File object to upload
 * @returns The secure URL of the uploaded image, or null if upload fails
 */
export async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'pln-inventory'); // Organize uploads in a folder

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', errorData);
      return null;
    }

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of File objects to upload
 * @returns Array of secure URLs for successfully uploaded images
 */
export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
}
