export const compressImage = async (file: File): Promise<File> => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Skip small images (e.g. < 500KB)
    if (file.size < 500 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(file); // Fallback to original
                return;
            }

            // Calculate new dimensions (Max 1920px)
            const MAX_DIMENSION = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height *= MAX_DIMENSION / width;
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width *= MAX_DIMENSION / height;
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.8 quality
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file); // Fallback
                    return;
                }

                // If compressed blob is actually larger (rare but possible with PNG->JPEG), use original
                if (blob.size > file.size) {
                    resolve(file);
                    return;
                }

                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                resolve(compressedFile);
            }, 'image/jpeg', 0.8);
        };

        img.onerror = (error) => reject(error);
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
};
