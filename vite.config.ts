import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked, type Tokens } from 'marked';

/** Repository name drives the GitHub Pages base path; override with VITE_BASE when needed. */
const REPO_NAME = 'optiv-fairr-practice';

/**
 * Renders docs/business-plan.md to HTML at build time and exposes it as the
 * virtual module `virtual:business-plan` with { html, sections }.
 */
function businessPlanPlugin(): Plugin {
  const id = 'virtual:business-plan';
  const resolvedId = '\0' + id;
  const mdPath = resolve(__dirname, 'docs/business-plan.md');
  return {
    name: 'business-plan-markdown',
    resolveId(source) {
      return source === id ? resolvedId : null;
    },
    load(source) {
      if (source !== resolvedId) return null;
      this.addWatchFile(mdPath);
      const md = readFileSync(mdPath, 'utf8');
      const sections: Array<{ id: string; text: string; level: number }> = [];
      const slug = (s: string) =>
        s
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      const renderer = new marked.Renderer();
      renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
        const text = renderer.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, '');
        const anchor = slug(plain);
        if (depth === 2 || depth === 3) sections.push({ id: anchor, text: plain, level: depth });
        return `<h${depth} id="${anchor}">${text}</h${depth}>`;
      };
      renderer.table = ({ header, rows }: Tokens.Table) => {
        const th = header.map((c) => `<th align="${c.align ?? 'left'}">${renderer.parser.parseInline(c.tokens)}</th>`).join('');
        const body = rows
          .map((r) => `<tr>${r.map((c) => `<td align="${c.align ?? 'left'}">${renderer.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
          .join('');
        return `<div class="table-scroll"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
      };
      const html = marked.parse(md, { renderer, gfm: true }) as string;
      return `export const html = ${JSON.stringify(html)};\nexport const sections = ${JSON.stringify(sections)};`;
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE ?? `/${REPO_NAME}/`,
  plugins: [react(), businessPlanPlugin()],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
