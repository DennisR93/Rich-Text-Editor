import { Extension } from '@tiptap/core';

export interface DirectionOptions {
    types: string[];
    defaultDirection: 'ltr' | 'rtl' | 'auto';
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        direction: {
            /**
             * Set the text direction
             */
            setDirection: (direction: 'ltr' | 'rtl' | 'auto') => ReturnType;
            /**
             * Unset the text direction
             */
            unsetDirection: () => ReturnType;
        }
    }
}

export const Direction = Extension.create<DirectionOptions>({
    name: 'direction',

    addOptions() {
        return {
            types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'twoColColumn'],
            defaultDirection: 'auto',
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    dir: {
                        default: null,
                        parseHTML: element => element.getAttribute('dir'),
                        renderHTML: attributes => {
                            if (!attributes.dir) {
                                return {};
                            }
                            return { dir: attributes.dir };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setDirection: (direction) => ({ commands }) => {
                return this.options.types.every(type => commands.updateAttributes(type, { dir: direction }));
            },
            unsetDirection: () => ({ commands }) => {
                return this.options.types.every(type => commands.resetAttributes(type, 'dir'));
            },
        };
    },
});
