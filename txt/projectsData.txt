// data/platform/projectsData.ts
import { Project } from '../../types';

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-q3-launch',
        name: 'Q3 Platform Launch',
        tasks: [
            { id: 't1', title: 'Finalize UI for The Nexus', status: 'Done', assignee: 'Alex Chen' },
            { id: 't2', title: 'Develop fractional reserve simulation', status: 'In Progress', assignee: 'Brenda Rodriguez' },
            { id: 't3', title: 'Integrate Veo 2.0 for Ad Studio', status: 'In Progress', assignee: 'Alex Chen' },
            { id: 't4', title: 'User acceptance testing for corporate dashboard', status: 'Review', assignee: 'Fiona Kim' },
            { id: 't5', title: 'Draft press release for launch', status: 'Backlog', assignee: 'Charles Davis' },
        ]
    }
];