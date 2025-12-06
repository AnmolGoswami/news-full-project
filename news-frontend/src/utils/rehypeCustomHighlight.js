import { visit } from 'unist-util-visit';

export function rehypeCustomHighlight() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const matches = node.value.match(/==([^=]+)==\[([^\]]+)\]/g);
      if (matches) {
        const children = [];
        let lastIndex = 0;

        node.value.replace(/==([^=]+)==\[([^\]]+)\]/g, (match, text, color, offset) => {
          if (offset > lastIndex) {
            children.push({ type: 'text', value: node.value.slice(lastIndex, offset) });
          }
          children.push({
            type: 'element',
            tagName: 'mark',
            properties: { style: `background-color: ${color}` },
            children: [{ type: 'text', value: text }],
          });
          lastIndex = offset + match.length;
        });

        if (lastIndex < node.value.length) {
          children.push({ type: 'text', value: node.value.slice(lastIndex) });
        }

        parent.children.splice(index, 1, ...children);
      }
    });
  };
}