"""Byte-pinned Sofia identity and background references for image tools."""
import hashlib
import re

PROFILES = {
    'female': {'file':'athletico-female-reference.jpg','sha256':'59c9c2fc50bf64bc9e7e462084b068d2bf2272741b84e0138426b63b4df081c6'},
    'male': {'file':'athletico-male-reference.jpg','sha256':'132c39d363c91a4d49e117c408471bfcfa99d018e003b26ccec6519261569bd5'},
}
def profile_for(exercise):
    profile=exercise.get('modelProfile')
    if profile is not None:
        if profile not in PROFILES: raise ValueError('Only approved Sofia references are allowed')
        return profile
    prompts=exercise.get('imagePrompts') or []
    first=str(prompts[0].get('prompt','')) if prompts else ''
    if re.search(r'\b(female|woman|brunette)\b',first,re.I): return 'female'
    if re.search(r'\b(male|man)\b',first,re.I): return 'male'
    digits=re.search(r'(\d+)$',str(exercise.get('id','')))
    return 'female' if digits and int(digits.group(1))%2 else 'male'
def validate_reference(public_dir,profile):
    if profile not in PROFILES: raise ValueError('No approved Sofia reference selected')
    path=public_dir/'images'/'athletes'/PROFILES[profile]['file']
    if not path.is_file(): raise ValueError('Approved model/studio reference missing; generation blocked')
    if hashlib.sha256(path.read_bytes()).hexdigest()!=PROFILES[profile]['sha256']:
        raise ValueError('Approved reference changed; generation blocked')
    return path
def locked_prompt(profile):
    if profile not in PROFILES: raise ValueError('No approved Sofia reference selected')
    ref=PROFILES[profile]
    return (f"MANDATORY SOFIA VISUAL REFERENCE LOCK. Attach /images/athletes/{ref['file']} "
            f"(SHA-256 {ref['sha256']}) as the sole athlete identity and ATHLETICO studio/background reference. "
            "Use only that person and room; preserve face, hair, proportions, clothes, furnishings, lighting and sign. "
            "Never invent or replace the model, room, logo or props. If the tool cannot use the exact reference, stop. "
            "A supplied exercise image is a pose/equipment guide only; replace its person and background.")
