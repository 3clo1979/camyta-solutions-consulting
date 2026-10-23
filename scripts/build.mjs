import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'content.js', 'robots.txt', '_headers', 'assets']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Built static preview in dist/. No deployment performed.');
