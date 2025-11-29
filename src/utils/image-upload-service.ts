/**
 * Uploads an image to Imgur and returns the URL.
 * @param file The image file to upload.
 * @returns A Promise that resolves to the image URL.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // Get API Key from environment variables
    // Get API Key from environment variables and sanitize it (remove quotes/spaces)
    const rawKey = import.meta.env.VITE_IMGBB_API_KEY || '';
    const API_KEY = rawKey.replace(/['"\s]/g, '');

    if (!API_KEY) {
        console.warn('Missing VITE_IMGBB_API_KEY in .env file.');
        throw new Error('Missing ImgBB API Key');
    }

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?expiration=600&key=${API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload to ImgBB');
        }

        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error('ImgBB upload error:', error);
        throw error;
    }
};
