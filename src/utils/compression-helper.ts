import LZString from 'lz-string';

export const compressString = (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const compressed = LZString.compressToBase64(data);
            resolve(compressed);
        } catch (e) {
            reject(e);
        }
    });
};

export const decompressString = (base64Data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const decompressed = LZString.decompressFromBase64(base64Data);
            if (decompressed === null) {
                reject(new Error('Decompression failed or returned null'));
            } else {
                resolve(decompressed);
            }
        } catch (e) {
            reject(e);
        }
    });
};
