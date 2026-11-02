import fs from 'node:fs';
import {buildOriginalConcepts} from '../public/advanced-catalog.js';
import {exerciseStoryboard} from '../public/storyboard-prompts.js';
import {originalAdvancedFrames} from '../public/original-visual-storyboards.js';
import {ensureVisualization} from '../public/visualization-sequence.js';
const functional=[1,2,3,4].flatMap(n=>JSON.parse(fs.readFileSync(new URL(`../public/data/functional-0${n}.json`,import.meta.url))));
const hybrids=JSON.parse(fs.readFileSync(new URL('../public/data/hybrid-original-library.json',import.meta.url)));
const batches=fs.readdirSync(new URL('../public/data/',import.meta.url)).filter(n=>n.startsWith('visual-batch')&&n.endsWith('.json')).flatMap(n=>JSON.parse(fs.readFileSync(new URL('../public/data/'+n,import.meta.url))).exercises);
console.log(JSON.stringify([...functional,...hybrids,...buildOriginalConcepts()].map(e=>{const normalized=ensureVisualization(e);return {...normalized,productionFrames:normalized.visualization.frames||(batches.find(b=>b.id===e.id)?.phases||(e.newConcept||e.requiresCoachReview?originalAdvancedFrames(e):exerciseStoryboard(e)))}})));

