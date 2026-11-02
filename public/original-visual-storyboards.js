import {ensureVisualization} from './visualization-sequence.js';

// The 208 original concepts share the same editable frame schema as every other exercise.
export function originalAdvancedFrames(exercise){
 if(!exercise?.newConcept)return null;
 return ensureVisualization(exercise).visualization.frames.map(frame=>({
   phase:frame.frame,labelEl:frame.label,label:frame.label,
   cue:frame.poseDescription,prompt:frame.prompt,image:null,
   imageStatus:'not_generated',reviewStatus:'pending_visual_review',
   sameImageAs:frame.sameImageAs||null,requiresCoachReview:true
 }));
}
