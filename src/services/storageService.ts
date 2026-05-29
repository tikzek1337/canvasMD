import type { ProjectSummary, TraceProject } from '../types/project';
import { sanitizeProject } from '../utils/projectSanitizer';
import { PROJECTS_KEY, STORAGE_KEY } from '../utils/constants';

export function loadCurrentProject(): TraceProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProject(JSON.parse(raw) as TraceProject) : null;
  } catch {
    return null;
  }
}

export function saveCurrentProject(project: TraceProject) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  upsertProjectSummary(project);
}

export function loadProjectSummaries(): ProjectSummary[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as ProjectSummary[]) : [];
  } catch {
    return [];
  }
}

function upsertProjectSummary(project: TraceProject) {
  const summaries = loadProjectSummaries();
  const next = [
    { id: project.id, name: project.name, updatedAt: project.updatedAt },
    ...summaries.filter((item) => item.id !== project.id)
  ].slice(0, 20);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
}
