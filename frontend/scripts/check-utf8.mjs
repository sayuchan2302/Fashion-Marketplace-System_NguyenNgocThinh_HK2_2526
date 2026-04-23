import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_TARGETS = ['src'];
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md']);
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.idea', '.vscode', 'coverage']);

const CHECKS = [
  {
    name: 'replacement-character',
    regex: /\uFFFD/gu,
  },
  {
    name: 'mojibake-sequence',
    regex: /[\u00C2\u00C3\u00C4\u00C6\u00E1\u00E2][\u00A0-\u00BF]/gu,
  },
];

const MAX_HITS_PER_FILE = 5;

const toPosixPath = (inputPath) => inputPath.split(path.sep).join('/');

const isSkippableDir = (name) => IGNORE_DIRS.has(name.toLowerCase());

const shouldScanFile = (filename) => SCAN_EXTENSIONS.has(path.extname(filename).toLowerCase());

const hasBinaryByte = (buffer) => {
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] === 0) return true;
  }
  return false;
};

const buildLineOffsets = (content) => {
  const offsets = [0];
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
};

const indexToLine = (offsets, index) => {
  let left = 0;
  let right = offsets.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = offsets[mid];
    const next = offsets[mid + 1] ?? Number.POSITIVE_INFINITY;
    if (index >= current && index < next) {
      return mid + 1;
    }
    if (index < current) right = mid - 1;
    else left = mid + 1;
  }
  return 1;
};

const collectFiles = async (targetPath, output) => {
  const stats = await fs.stat(targetPath);
  if (stats.isFile()) {
    if (shouldScanFile(targetPath)) output.push(targetPath);
    return;
  }

  if (!stats.isDirectory()) return;

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      if (!isSkippableDir(entry.name)) {
        await collectFiles(entryPath, output);
      }
      return;
    }
    if (entry.isFile() && shouldScanFile(entry.name)) {
      output.push(entryPath);
    }
  }));
};

const analyzeFile = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  if (hasBinaryByte(buffer)) return [];

  const content = buffer.toString('utf8');
  const lineOffsets = buildLineOffsets(content);
  const findings = [];

  for (const check of CHECKS) {
    const regex = new RegExp(check.regex.source, check.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      findings.push({
        check: check.name,
        line: indexToLine(lineOffsets, match.index),
        snippet: match[0],
      });
      if (findings.length >= MAX_HITS_PER_FILE) break;
    }
    if (findings.length >= MAX_HITS_PER_FILE) break;
  }

  return findings;
};

const run = async () => {
  const targets = process.argv.slice(2);
  const roots = (targets.length ? targets : DEFAULT_TARGETS).map((item) => path.resolve(process.cwd(), item));
  const files = [];

  for (const root of roots) {
    try {
      await collectFiles(root, files);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`UTF-8 check: cannot scan ${toPosixPath(root)}: ${error.message}`);
      } else {
        console.error(`UTF-8 check: cannot scan ${toPosixPath(root)}.`);
      }
      process.exitCode = 1;
      return;
    }
  }

  const uniqueFiles = [...new Set(files)];
  const issues = [];

  for (const file of uniqueFiles) {
    const findings = await analyzeFile(file);
    if (findings.length) {
      issues.push({
        file,
        findings,
      });
    }
  }

  if (!issues.length) {
    console.log(`UTF-8 check passed (${uniqueFiles.length} files scanned).`);
    return;
  }

  console.error('UTF-8 check failed. Potential mojibake detected:');
  issues.forEach((issue) => {
    const relativePath = toPosixPath(path.relative(process.cwd(), issue.file));
    console.error(`- ${relativePath}`);
    issue.findings.forEach((finding) => {
      console.error(`  line ${finding.line} [${finding.check}] -> ${JSON.stringify(finding.snippet)}`);
    });
  });
  process.exitCode = 1;
};

await run();
