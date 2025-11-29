/**
 * Optimizes an image file by resizing it and converting it to WebP.
 * @param file The image file to optimize.
 * @param maxWidth The maximum width of the image (default: 800px).
 * @param quality The quality of the WebP image (0 to 1, default: 0.8).
 * @returns A Promise that resolves to the optimized image as a Base64 string.
 */
export const optimizeImage = (file: File, maxWidth = 400, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP
                const dataUrl = canvas.toDataURL('image/webp', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
