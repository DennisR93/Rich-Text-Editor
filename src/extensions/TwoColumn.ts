import { Node, mergeAttributes } from '@tiptap/core';

export const TwoColContainer = Node.create({
    name: 'twoColContainer',
    group: 'block',
    content: 'twoColColumnLeft twoColColumnRight', // Must contain exactly left then right column
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

export const TwoColColumnLeft = Node.create({
    name: 'twoColColumnLeft',
    content: 'block+', // Must contain blocks (paragraphs, etc.)
    defining: true,
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div.two-col-column-left' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'two-col-column-left' }), 0];
    },
});

export const TwoColColumnRight = Node.create({
    name: 'twoColColumnRight',
    content: 'block+', // Must contain blocks (paragraphs, etc.)
    defining: true,
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div.two-col-column-right' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'two-col-column-right' }), 0];
    },
});
