import fs from 'fs';
import path from 'path';

// Import the icon modules directly and read their exported `__iconNode`
// data, rather than regex-scraping the source — lucide pretty-prints long
// entries across several lines, which no simple pattern survives.
const DIR = path.resolve(process.env.HOME, 'Documents/schoolapp/mayuri/node_modules/lucide-react/dist/esm/icons');

const WANT = ['home','calendar','message-square','bell','user','check-circle','x','users','credit-card',
  'file-text','camera','trending-up','qr-code','indian-rupee','shield','user-plus','chevron-left',
  'chevron-right','clock','user-check','book-open','settings','rss','lock','heart','bar-chart-3',
  'file-spreadsheet','file-edit','trending-down','wallet','sparkles','image'];

// Alias modules (`export { default } from './other.js'`) don't re-export
// __iconNode, so follow the alias to the module that defines it.
async function nodesFor(name, depth = 0) {
  const mod = await import(path.join(DIR, name + '.js'));
  if (mod.__iconNode) return mod.__iconNode;
  if (depth > 5) return null;
  const m = fs.readFileSync(path.join(DIR, name + '.js'), 'utf8')
    .match(/export \{ default \} from '\.\/([a-z0-9-]+)\.js'/);
  return m ? nodesFor(m[1], depth + 1) : null;
}

const out = {};
for (const name of WANT) {
  const nodes = await nodesFor(name);
  if (!nodes) { console.error('SKIP', name); continue; }
  out[name] = nodes.map(([tag, attrs]) =>
    `<${tag} ${Object.entries(attrs)
      .filter(([k]) => k !== 'key')
      .map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
}
fs.writeFileSync('icons.json', JSON.stringify(out, null, 1));
console.log('wrote', Object.keys(out).length, 'icons');
