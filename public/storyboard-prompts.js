import {ensureVisualization} from './visualization-sequence.js';

// Prompts are authored per exercise frame; no generated exercise image is required as input.
export function exerciseStoryboard(exercise){
 const sequence=ensureVisualization(exercise).visualization;
 return sequence.frames.map(frame=>({
   phase:frame.frame,label:frame.label,labelEl:frame.label,
   sourceCue:frame.poseDescription,cue:frame.poseDescription,
   prompt:frame.prompt,status:frame.sameImageAs?'reuse_frame':'prompt_only',
   sameImageAs:frame.sameImageAs||null,
   referenceImage:frame.referenceImage,referenceSha256:frame.referenceSha256
 }));
}
