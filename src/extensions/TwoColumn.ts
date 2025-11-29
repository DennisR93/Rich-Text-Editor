import { Node, mergeAttributes } from '@tiptap/core';

export const TwoColContainer = Node.create({
    name: 'twoColContainer',
    group: 'block',
    content: 'twoColColumn twoColColumn', // Must contain exactly two columns
    defining: true,
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div.two-col-container' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'two-col-container' }), 0];
    },
});

export const TwoColColumn = Node.create({
    name: 'twoColColumn',
    content: 'block+', // Must contain blocks (paragraphs, etc.)
    defining: true,
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div.two-col-column' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'two-col-column' }), 0];
    },
});
