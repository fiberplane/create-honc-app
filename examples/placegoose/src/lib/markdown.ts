import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

// https://www.npmjs.com/package/marked-highlight
const marked = new Marked(
  markedHighlight({
    highlight: (code) => {
      // https://prismjs.com/#basic-usage-node
      return Prism.highlight(code, Prism.languages.javascript, "typescript");
    },
  }),
);

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const idMatch = text.match(/\{#([\w-]+)\}$/);

      const idAttribute = idMatch
        ? `id="${idMatch[1]}"`
        : "";

      const content = idMatch
        ? text.replace(/\s*\{#([\w-]+)\}$/, '')
        : text;

      return `<h${depth} ${idAttribute}>${content}</h${depth}>`
    }
  }
})

export function mdToHtml(markdown: string) {
  return marked.parse(markdown);
}
