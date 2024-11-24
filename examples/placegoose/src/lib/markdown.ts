import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

// https://www.npmjs.com/package/marked-highlight
const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight: (code) => {
      // https://prismjs.com/#basic-usage-node
      return Prism.highlight(code, Prism.languages.javascript, "typescript");
    },
  }),
);

export function mdToHtml(markdown: string) {
  return marked.parse(markdown);
}
