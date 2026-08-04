#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSequenceSpec, validateSequenceSourceText, LIMITS } from '../skills/system-diagram/scripts/spec-sequence-v2.mjs';
import { layoutSequence } from '../skills/system-diagram/scripts/layout-sequence-v1.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const minimalPath = resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.json');
const recoveryPath = resolve(root, 'skills/system-diagram/resources/sequence-recovery-v2.json');
const minimal = JSON.parse(readFileSync(minimalPath, 'utf8'));
const recovery = JSON.parse(readFileSync(recoveryPath, 'utf8'));
const minimalModel = normalizeSequenceSpec(minimal);
const recoveryModel = normalizeSequenceSpec(recovery);
const minimalLayout = layoutSequence(minimalModel);
const recoveryLayout = layoutSequence(recoveryModel);
assert(minimalModel.messages.length === 2, 'minimal fixture should contain two messages');
assert(recoveryModel.fragments.length === 1 && recoveryModel.notes.length === 1, 'recovery fixture should contain one fragment and note');
assert(recoveryLayout.fragmentLayouts[0].branches.length === 2, 'recovery layout should retain both branches');
assert(recoveryLayout.participantLayouts.map((item) => item.id).join(',') === 'customer,checkout,payment', 'participant source order must be preserved');
assert(recoveryLayout.width <= LIMITS.viewBoxWidth && recoveryLayout.height <= LIMITS.viewBoxHeight, 'recovery layout must remain within viewBox limits');
assert(JSON.stringify(layoutSequence(minimalModel)) === JSON.stringify(layoutSequence(normalizeSequenceSpec(minimal))), 'layout must be deterministic');

expectError(() => normalizeSequenceSpec({ ...minimal, participants: minimal.participants.map((item) => ({ ...item, fill: '#fff' })) }), 'participant 1.fill is unsupported');
expectError(() => normalizeSequenceSpec({ ...minimal, events: [{ ...minimal.events[0], to: 'missing' }] }), 'must reference an existing participant');
expectError(() => normalizeSequenceSpec({ ...minimal, events: [{ ...minimal.events[0], messageType: 'self' }] }), 'self endpoints must match');
expectError(() => normalizeSequenceSpec({ ...minimal, events: [{ ...minimal.events[0], messageType: 'return', from: 'checkout', to: 'customer', replyTo: 'submit' }] }), 'replyTo must reference an earlier non-return message');
expectError(() => normalizeSequenceSpec({ ...minimal, events: [{ id: 'fragment', type: 'fragment', fragmentType: 'alt', label: 'Only one', kind: 'secondary', branches: [{ id: 'one', label: 'one', events: [{ ...minimal.events[0] }] }] }] }), 'requires 2 to 4 branches');
expectError(() => validateSequenceSourceText('x'.repeat(LIMITS.sourceBytes + 1)), `exceeds ${LIMITS.sourceBytes} bytes`);
console.log('✓ sequence-v2 semantic contract and deterministic layout');

function expectError(action, expected) { try { action(); } catch (error) { assert(error.message.includes(expected), `expected "${expected}", received "${error.message}"`); return; } throw new Error(`expected failure containing "${expected}"`); }
function assert(value, message) { if (!value) throw new Error(message); }
