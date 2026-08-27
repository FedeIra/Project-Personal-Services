// External Dependencies:
import fs from 'fs';
import path from 'path';
import { simpleParser } from 'mailparser';

// Internal Types:
type JobModality = 'remote' | 'hybrid' | 'onsite' | 'unknown';
type Seniority =
  | 'senior'
  | 'semi senior'
  | 'mid'
  | 'junior'
  | 'lead'
  | 'staff'
  | 'unknown';

interface ScoreWeights {
  remote: number;
  hybrid: number;
  onsite: number;
  preferredTechMatch: number;
  preferredSeniority: number;
  preferredLocation: number;
  activeHiring: number;
  noTargetTechPenalty: number;
  optionalExcludedTechPenalty: number;
}

interface HardFilters {
  excludeOnsite: boolean;
  excludeWhenContainsExcludedTech: boolean;
  excludeWhenLanguageNotEsEn: boolean;
}

interface AnalyzerConfig {
  topNDefault: number;
  hardFilters: HardFilters;
  preferredTech: string[];
  excludedTech: string[];
  preferredSeniority: string[];
  preferredLocations: string[];
  languageExclusionKeywords: string[];
  scoreWeights: ScoreWeights;
}

interface ParsedJob {
  title: string;
  company: string;
  location: string;
  urlRaw: string;
  urlClean: string;
  modality: JobModality;
  seniority: Seniority;
  blockText: string;
  matchedPreferredTech: string[];
  matchedExcludedTechMandatory: string[];
  matchedExcludedTechOptional: string[];
  languageFlags: string[];
}

interface RankedJob extends ParsedJob {
  score: number;
  scoreBreakdown: string[];
  filteredOut: boolean;
  filteredReasons: string[];
}

interface CliOptions {
  emlPath: string;
  configPath: string;
  outPath: string;
  topN?: number;
}

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, 'config.json');
const DEFAULT_OUT_PATH = path.resolve(process.cwd(), 'linkedin-top-jobs.json');

const REMOTE_TERMS = [
  'remote',
  'remoto',
  '100% remoto',
  'fully remote',
  'full remote',
];
const HYBRID_TERMS = [
  'hybrid',
  'hibrido',
  'hibrido',
  'hibrido,',
  'hibrido)',
  'hibrido, caba',
  'hibrido caba',
  'hibrido caba)',
];
const ONSITE_TERMS = ['onsite', 'on-site', 'on site', 'presencial'];
const EXCLUDED_TECH_MANDATORY_MARKERS = [
  'required',
  'must have',
  'must',
  'mandatory',
  'obligatorio',
  'excluyente',
  'requisito',
  'requirement',
  'requires',
  'experience with',
];
const EXCLUDED_TECH_OPTIONAL_MARKERS = [
  'nice to have',
  'plus',
  'preferred',
  'deseable',
  'seria un plus',
  'optional',
  'would be a plus',
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCliArgs(argv: string[]): CliOptions {
  if (argv.length === 0) {
    throw new Error(
      'Uso: ts-node process-linkedin-alert.ts <ruta.eml> [--top N] [--config path] [--out path]'
    );
  }

  const emlPath = path.resolve(argv[0]);
  let topN: number | undefined;
  let configPath = DEFAULT_CONFIG_PATH;
  let outPath = DEFAULT_OUT_PATH;

  for (let index = 1; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (/^\d+$/.test(current)) {
      topN = Number(current);
      continue;
    }

    if (current.startsWith('--top=')) {
      topN = Number(current.replace('--top=', ''));
      continue;
    }

    if (current === '--top' && next) {
      topN = Number(next);
      index += 1;
      continue;
    }

    if (current === '--config' && next) {
      configPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (current === '--out' && next) {
      outPath = path.resolve(next);
      index += 1;
      continue;
    }
  }

  if (topN !== undefined && (!Number.isInteger(topN) || topN <= 0)) {
    throw new Error('--top debe ser un entero mayor a 0');
  }

  return {
    emlPath,
    configPath,
    outPath,
    topN,
  };
}

function loadConfig(configPath: string): AnalyzerConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`No existe config en: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw) as AnalyzerConfig;

  return parsed;
}

async function readEmlAsText(emlPath: string): Promise<string> {
  if (!fs.existsSync(emlPath)) {
    throw new Error(`No existe archivo .eml en: ${emlPath}`);
  }

  const rawBuffer = fs.readFileSync(emlPath);
  const parsed = await simpleParser(rawBuffer);

  const text = parsed.text?.trim();
  if (text) {
    return text;
  }

  if (typeof parsed.html === 'string' && parsed.html.trim()) {
    // Fallback basico: remover tags HTML para rescatar contenido util.
    return parsed.html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  throw new Error('No se pudo extraer contenido de texto del .eml');
}

function cleanLinkedinUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  const jobIdMatch = trimmed.match(/jobs\/view\/(\d+)/i);

  if (jobIdMatch?.[1]) {
    return `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
  }

  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return trimmed;
  }
}

function detectModality(text: string): JobModality {
  const normalized = normalizeText(text);

  const hasOnsite = ONSITE_TERMS.some((term) => normalized.includes(term));
  const hasRemote = REMOTE_TERMS.some((term) => normalized.includes(term));
  const hasHybrid = HYBRID_TERMS.some((term) => normalized.includes(term));

  if (hasOnsite && !hasRemote && !hasHybrid) {
    return 'onsite';
  }

  if (hasRemote) {
    return 'remote';
  }

  if (hasHybrid || (hasOnsite && hasRemote)) {
    return 'hybrid';
  }

  return 'unknown';
}

function detectSeniority(text: string): Seniority {
  const normalized = normalizeText(text);

  if (/\b(staff)\b/.test(normalized)) {
    return 'staff';
  }

  if (/\b(lead|principal)\b/.test(normalized)) {
    return 'lead';
  }

  if (/\b(semi senior|semisenior|ssr)\b/.test(normalized)) {
    return 'semi senior';
  }

  if (/\b(senior|sr\.?)(?!\s*manager)\b/.test(normalized)) {
    return 'senior';
  }

  if (/\b(mid|middle)\b/.test(normalized)) {
    return 'mid';
  }

  if (/\b(junior|jr\.?)\b/.test(normalized)) {
    return 'junior';
  }

  return 'unknown';
}

function extractMatches(text: string, keywords: string[]): string[] {
  const normalized = normalizeText(text);

  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .filter((keyword) => normalized.includes(normalizeText(keyword)));
}

function splitExcludedTechMatches(
  text: string,
  excludedTech: string[]
): { mandatory: string[]; optional: string[] } {
  const normalizedText = normalizeText(text);
  const mandatory: string[] = [];
  const optional: string[] = [];

  for (const tech of excludedTech) {
    const normalizedTech = normalizeText(tech);
    if (!normalizedTech || !normalizedText.includes(normalizedTech)) {
      continue;
    }

    let hasMandatoryContext = false;
    let hasOptionalContext = false;
    let startIndex = normalizedText.indexOf(normalizedTech);

    while (startIndex >= 0) {
      const contextStart = Math.max(0, startIndex - 50);
      const contextEnd = Math.min(
        normalizedText.length,
        startIndex + normalizedTech.length + 50
      );
      const context = normalizedText.slice(contextStart, contextEnd);

      if (
        EXCLUDED_TECH_MANDATORY_MARKERS.some((marker) =>
          context.includes(marker)
        )
      ) {
        hasMandatoryContext = true;
      }

      if (
        EXCLUDED_TECH_OPTIONAL_MARKERS.some((marker) =>
          context.includes(marker)
        )
      ) {
        hasOptionalContext = true;
      }

      startIndex = normalizedText.indexOf(
        normalizedTech,
        startIndex + normalizedTech.length
      );
    }

    if (hasMandatoryContext) {
      mandatory.push(tech);
      continue;
    }

    if (hasOptionalContext) {
      optional.push(tech);
      continue;
    }

    // Sin contexto explicito, tratar como optativo para evitar falsos descartes.
    optional.push(tech);
  }

  return {
    mandatory: Array.from(new Set(mandatory)),
    optional: Array.from(new Set(optional)),
  };
}

function isMetaLine(line: string): boolean {
  const normalized = normalizeText(line);

  if (!normalized) {
    return true;
  }

  if (normalized.startsWith('your job alert has been created')) {
    return true;
  }

  if (normalized.startsWith('see all jobs')) {
    return true;
  }

  if (normalized.startsWith('view job:')) {
    return true;
  }

  if (normalized.includes('connections')) {
    return true;
  }

  if (normalized.includes('apply with resume')) {
    return true;
  }

  if (normalized.includes('you are receiving job alert emails')) {
    return true;
  }

  return false;
}

function looksLikeJobTitle(line: string): boolean {
  const normalized = normalizeText(line);

  const jobTitleHints = [
    'developer',
    'engineer',
    'backend',
    'front end',
    'full stack',
    'software',
    'node',
    'typescript',
    'javascript',
  ];

  return jobTitleHints.some((hint) => normalized.includes(hint));
}

function extractJobsFromText(
  text: string,
  config: AnalyzerConfig
): ParsedJob[] {
  const normalizedText = text.replace(/\r\n/g, '\n');
  const blocks = normalizedText.split(/-{20,}/g).map((block) => block.trim());

  const jobs: ParsedJob[] = [];

  for (const block of blocks) {
    if (!/View job:/i.test(block)) {
      continue;
    }

    const urlMatch = block.match(/View job:\s*(https?:\/\/[^\s]+)/i);
    if (!urlMatch?.[1]) {
      continue;
    }

    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const viewJobIndex = lines.findIndex((line) => /^View job:/i.test(line));
    const headerLines = lines
      .slice(0, viewJobIndex === -1 ? lines.length : viewJobIndex)
      .filter((line) => !isMetaLine(line));

    if (headerLines.length === 0) {
      continue;
    }

    const titleIndex = headerLines.findIndex((line) => looksLikeJobTitle(line));
    const resolvedTitleIndex = titleIndex >= 0 ? titleIndex : 0;

    const title = headerLines[resolvedTitleIndex] ?? 'Unknown title';
    const company = headerLines[resolvedTitleIndex + 1] ?? 'Unknown company';
    const location = headerLines[resolvedTitleIndex + 2] ?? 'Unknown location';

    const blockText = headerLines.join(' | ');

    const matchedPreferredTech = extractMatches(
      blockText,
      config.preferredTech
    );
    const excludedTechMatches = splitExcludedTechMatches(
      blockText,
      config.excludedTech
    );
    const languageFlags = extractMatches(
      blockText,
      config.languageExclusionKeywords
    );

    jobs.push({
      title,
      company,
      location,
      urlRaw: urlMatch[1],
      urlClean: cleanLinkedinUrl(urlMatch[1]),
      modality: detectModality(blockText),
      seniority: detectSeniority(blockText),
      blockText,
      matchedPreferredTech,
      matchedExcludedTechMandatory: excludedTechMatches.mandatory,
      matchedExcludedTechOptional: excludedTechMatches.optional,
      languageFlags,
    });
  }

  // Deduplicar por URL limpia para evitar repetidos.
  const dedupMap = new Map<string, ParsedJob>();
  for (const job of jobs) {
    if (!dedupMap.has(job.urlClean)) {
      dedupMap.set(job.urlClean, job);
    }
  }

  return Array.from(dedupMap.values());
}

function computeScore(
  job: ParsedJob,
  config: AnalyzerConfig
): { score: number; scoreBreakdown: string[] } {
  let score = 0;
  const scoreBreakdown: string[] = [];

  if (job.modality === 'remote') {
    score += config.scoreWeights.remote;
    scoreBreakdown.push(`modality:remote(${config.scoreWeights.remote})`);
  } else if (job.modality === 'hybrid') {
    score += config.scoreWeights.hybrid;
    scoreBreakdown.push(`modality:hybrid(${config.scoreWeights.hybrid})`);
  } else if (job.modality === 'unknown') {
    score += config.scoreWeights.hybrid;
    scoreBreakdown.push(
      `modality:unknown_as_hybrid(${config.scoreWeights.hybrid})`
    );
  } else if (job.modality === 'onsite') {
    score += config.scoreWeights.onsite;
    scoreBreakdown.push(`modality:onsite(${config.scoreWeights.onsite})`);
  }

  if (job.matchedPreferredTech.length > 0) {
    const techScore =
      job.matchedPreferredTech.length * config.scoreWeights.preferredTechMatch;
    score += techScore;
    scoreBreakdown.push(`preferredTech(${techScore})`);
  } else {
    score += config.scoreWeights.noTargetTechPenalty;
    scoreBreakdown.push(
      `noTargetTechPenalty(${config.scoreWeights.noTargetTechPenalty})`
    );
  }

  const preferredSeniorityNormalized = config.preferredSeniority.map((value) =>
    normalizeText(value)
  );
  if (preferredSeniorityNormalized.includes(normalizeText(job.seniority))) {
    score += config.scoreWeights.preferredSeniority;
    scoreBreakdown.push(
      `preferredSeniority(${config.scoreWeights.preferredSeniority})`
    );
  }

  const locationNormalized = normalizeText(job.location);
  const hasPreferredLocation = config.preferredLocations.some((preferred) => {
    const normalizedPreferred = normalizeText(preferred);

    if (normalizedPreferred === 'global remoto') {
      return job.modality === 'remote';
    }

    return locationNormalized.includes(normalizedPreferred);
  });

  if (hasPreferredLocation) {
    score += config.scoreWeights.preferredLocation;
    scoreBreakdown.push(
      `preferredLocation(${config.scoreWeights.preferredLocation})`
    );
  }

  const blockNormalized = normalizeText(job.blockText);
  if (blockNormalized.includes('actively hiring')) {
    score += config.scoreWeights.activeHiring;
    scoreBreakdown.push(`activeHiring(${config.scoreWeights.activeHiring})`);
  }

  if (job.matchedExcludedTechOptional.length > 0) {
    const optionalTechPenalty =
      job.matchedExcludedTechOptional.length *
      config.scoreWeights.optionalExcludedTechPenalty;
    score += optionalTechPenalty;
    scoreBreakdown.push(`optionalExcludedTechPenalty(${optionalTechPenalty})`);
  }

  return { score, scoreBreakdown };
}

function rankAndFilterJobs(
  jobs: ParsedJob[],
  config: AnalyzerConfig
): RankedJob[] {
  return jobs.map((job) => {
    const { score, scoreBreakdown } = computeScore(job, config);
    const filteredReasons: string[] = [];

    if (config.hardFilters.excludeOnsite && job.modality === 'onsite') {
      filteredReasons.push('excludeOnsite');
    }

    if (
      config.hardFilters.excludeWhenContainsExcludedTech &&
      job.matchedExcludedTechMandatory.length > 0
    ) {
      filteredReasons.push(
        `mandatoryExcludedTech:${job.matchedExcludedTechMandatory.join(',')}`
      );
    }

    if (
      config.hardFilters.excludeWhenLanguageNotEsEn &&
      job.languageFlags.length > 0
    ) {
      filteredReasons.push(`languageNotEsEn:${job.languageFlags.join(',')}`);
    }

    return {
      ...job,
      score,
      scoreBreakdown,
      filteredOut: filteredReasons.length > 0,
      filteredReasons,
    };
  });
}

function printTopJobs(
  selected: RankedJob[],
  discarded: RankedJob[],
  topN: number
): void {
  console.log('');
  console.log('LinkedIn Job Alert Analyzer');
  console.log('--------------------------');
  console.log(`Seleccionadas: ${selected.length}`);
  console.log(`Descartadas por filtros: ${discarded.length}`);
  console.log(`Top solicitado: ${topN}`);
  console.log('');

  if (selected.length === 0) {
    console.log('No hay vacantes luego de aplicar filtros.');
    return;
  }

  selected.forEach((job, index) => {
    const rank = index + 1;
    console.log(`${rank}. ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Location: ${job.location}`);
    console.log(`   Modality: ${job.modality}`);
    console.log(`   Seniority: ${job.seniority}`);
    console.log(`   Score: ${job.score}`);
    console.log(`   URL: ${job.urlClean}`);
    console.log(`   Breakdown: ${job.scoreBreakdown.join(' | ')}`);
    console.log('');
  });
}

function writeOutputJson(
  outPath: string,
  emlPath: string,
  configPath: string,
  selected: RankedJob[],
  discarded: RankedJob[],
  topN: number
): void {
  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      emlPath,
      configPath,
      topN,
      selectedCount: selected.length,
      discardedCount: discarded.length,
    },
    selected,
    discarded,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`JSON generado en: ${outPath}`);
}

async function main(): Promise<void> {
  try {
    const options = parseCliArgs(process.argv.slice(2));
    const config = loadConfig(options.configPath);
    const text = await readEmlAsText(options.emlPath);

    const extractedJobs = extractJobsFromText(text, config);
    const rankedJobs = rankAndFilterJobs(extractedJobs, config);

    const filteredIn = rankedJobs.filter((job) => !job.filteredOut);
    const discarded = rankedJobs.filter((job) => job.filteredOut);

    filteredIn.sort((a, b) => b.score - a.score);

    const topN = options.topN ?? config.topNDefault;
    const selected = filteredIn.slice(0, topN);

    printTopJobs(selected, discarded, topN);
    writeOutputJson(
      options.outPath,
      options.emlPath,
      options.configPath,
      selected,
      discarded,
      topN
    );
  } catch (error) {
    console.error('Error ejecutando analyzer:', error);
    process.exit(1);
  }
}

void main();
