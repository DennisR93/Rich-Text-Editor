import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { uploadImage } from '../utils/image-upload-service';

export const ImageUploadPaste = Extension.create({
    name: 'imageUploadPaste',

    addProseMirrorPlugins() {
        const editor = this.editor;
        return [
            new Plugin({
                key: new PluginKey('imageUploadPaste'),
                props: {
                    handlePaste: (_view, event) => {
                        const files = event.clipboardData?.files;
                        const html = event.clipboardData?.getData('text/html');

                        // 1. Handle direct file paste (e.g. screenshot or copied image file)
                        if (files && files.length > 0) {
                            const images = Array.from(files).filter(file => file.type.startsWith('image/'));

                            if (images.length > 0) {
                                event.preventDefault();

                                (async () => {
                                    for (const file of images) {
                                        try {
                                            // Insert placeholder or loading state if needed
                                            const imageUrl = await uploadImage(file);
                                            editor.chain().focus().setImage({ src: imageUrl }).run();
                                        } catch (error) {
                                            console.error('Failed to upload pasted file:', error);
                                            // Fallback: insert as local data URL so user sees something
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                if (typeof e.target?.result === 'string') {
                                                    editor.chain().focus().setImage({ src: e.target.result }).run();
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }
                                })();
                                return true;
                            }
                        }

                        // 2. Handle HTML paste with images (e.g. copied from web page)
                        if (html && html.includes('<img')) {
                            event.preventDefault();

                            (async () => {
                                try {
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(html, 'text/html');
                                    const images = doc.querySelectorAll('img');

                                    for (const img of images) {
                                        const src = img.getAttribute('src');
                                        // Skip if already Imgur or Data URI
                                        if (src && !src.includes('imgur.com') && !src.startsWith('data:')) {
                                            try {
                                                // Try to fetch the image to upload it
                                                const response = await fetch(src);
                                                const blob = await response.blob();
                                                const file = new File([blob], 'pasted-image.png', { type: blob.type });
                                                const newUrl = await uploadImage(file);
                                                img.setAttribute('src', newUrl);
                                            } catch (e) {
                                                console.warn('Failed to upload pasted image (likely CORS), keeping original URL:', src);
                                                // We keep the original src, so it still displays (if browser allows)
                                            }
                                        }
                                    }

                                    const content = doc.body.innerHTML;
                                    editor.commands.insertContent(content);

                                } catch (e) {
                                    console.error('Error handling HTML paste:', e);
                                    // Fallback: just insert the original HTML
                                    if (html) {
                                        editor.commands.insertContent(html);
                                    }
                                }
                            })();

                            return true;
                        }
                        return false;
                    },
                },
            }),
        ];
    },
});
