// render-productlaunch-timeline.mjs — DiagramOS Config E
// Natural language intake: "Plan out our 6-month product launch.
//   Three tracks: Marketing, Engineering, Customer Success."
// Intake path E resolved: start=2026-03-10, end=2026-09-07, mode=quarter

import { writeFileSync } from 'fs';
import { renderTimeline } from './render-timeline.mjs';

const config = {
  title:    '6-Month Product Launch',
  subtitle: 'MARKETING · ENGINEERING · CUSTOMER SUCCESS  ·  MARCH – SEPTEMBER 2026',
  start:    '2026-03-10',
  end:      '2026-09-07',
  mode:     'quarter',
  today:    '2026-03-10',

  phases: [
    { label: 'Discovery & Setup', start: '2026-03-10', end: '2026-04-12' },
    { label: 'Build',             start: '2026-04-13', end: '2026-07-12' },
    { label: 'Launch',            start: '2026-07-13', end: '2026-09-07' },
  ],

  tracks: [
    {
      label:    'Marketing',
      sublabel: 'BRAND · CAMPAIGNS',
      items: [
        // "brand work" → identity activity + guidelines deliverable
        { label: 'Brand Identity & Messaging', type: 'activity',    start: '2026-03-10', end: '2026-04-12' },
        { label: 'Brand Guidelines',           type: 'deliverable', start: '2026-04-13', end: '2026-04-30' },
        // "campaigns" → development activity + launch campaign deliverable
        { label: 'Campaign Development',       type: 'activity',    start: '2026-05-04', end: '2026-06-28' },
        { label: 'Launch Campaign',            type: 'deliverable', start: '2026-07-13', end: '2026-09-07' },
      ],
    },
    {
      label:    'Engineering',
      sublabel: 'INFRA · FEATURES · LAUNCH',
      items: [
        // "infra" → infrastructure activity
        { label: 'Infrastructure Setup',  type: 'activity',    start: '2026-03-10', end: '2026-04-12' },
        // "feature build" → development activity
        { label: 'Feature Development',   type: 'activity',    start: '2026-04-13', end: '2026-07-12' },
        // "launch" → platform launch deliverable
        { label: 'Platform Launch',       type: 'deliverable', start: '2026-07-13', end: '2026-09-07' },
      ],
    },
    {
      label:    'Customer Success',
      sublabel: 'ONBOARDING · GO-LIVE',
      items: [
        // "onboarding prep" → design activity + playbook deliverable
        { label: 'Onboarding Program Design', type: 'activity',    start: '2026-04-13', end: '2026-05-17' },
        { label: 'Onboarding Playbook',        type: 'deliverable', start: '2026-05-18', end: '2026-06-14' },
        // "goes live" → go-live deliverable
        { label: 'Customer Go-Live',           type: 'deliverable', start: '2026-07-13', end: '2026-09-07' },
      ],
    },
  ],

  // Cross-lane dependencies
  // [track, item] — zero-based
  connections: [
    // Brand Guidelines (Marketing[0,1]) informs Onboarding Program Design (CS[2,0])
    { from: [0, 1], to: [2, 0], label: 'Informs'  },
    // Feature Development (Eng[1,1]) enables Campaign Development (Marketing[0,2])
    { from: [1, 1], to: [0, 2], label: 'Enables'  },
    // Platform Launch (Eng[1,2]) triggers Customer Go-Live (CS[2,2])
    { from: [1, 2], to: [2, 2], label: 'Triggers' },
  ],
};

const svg = renderTimeline(config);
writeFileSync(new URL('./ProductLaunch-timeline.svg', import.meta.url), svg, 'utf8');
console.log('✓ Written outputs/ProductLaunch-timeline.svg');
console.log(`  Tracks: ${config.tracks.length}  Phases: ${config.phases.length}  Connections: ${config.connections.length}`);
console.log(`  Scale: ${config.mode}  Range: ${config.start} → ${config.end}`);
console.log('  Intake path E — natural language → timeline (no JSON exposed to user)');
