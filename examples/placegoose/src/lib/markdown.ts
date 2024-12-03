import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

/**
 * Markdown is a simple way to serve lightly-formatted text content,
 * especially for docs. Marked is a popular and highly-extensible
 * compiler. **It does not sanitize html!**
 * A plugin is required for syntax highlighting
 * @see https://www.npmjs.com/package/marked-highlight
 */

const marked = new Marked(
  markedHighlight({
    highlight: (code) => {
      // https://prismjs.com/#basic-usage-node
      return Prism.highlight(code, Prism.languages.javascript, "typescript");
    },
  }),
);

/**
 * Marked doesn't recognize any tokens as id attributes. To
 * allow links to headings, override the default header rendering.
 * The #{id-value} pattern is a markdown standard.
 */

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      // Match headings ending with an "#{id-value}"
      const idMatch = text.match(/\{#([\w-]+)\}$/);

      const idAttribute = idMatch ? `id="${idMatch[1]}"` : "";

      const content = idMatch ? text.replace(/\s*\{#([\w-]+)\}$/, "") : text;

      return `<h${depth} ${idAttribute}>${content}</h${depth}>`;
    },
  },
});

/** @returns Unsanitized html compiled from the markdown source */
export function mdToHtml(markdown: string) {
  return marked.parse(markdown);
}
