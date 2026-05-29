import type { TraceProject } from '../types/project';
import { sanitizeProject } from './projectSanitizer';

export function serializeProject(project: TraceProject) {
  return JSON.stringify(
    {
      schema: 'canvasmd.project.v1',
      exportedAt: new Date().toISOString(),
      project
    },
    null,
    2
  );
}

export function parseProjectJson(raw: string): TraceProject {
  const parsed = JSON.parse(raw);
  const project = parsed.project ?? parsed;

  if (!project || !Array.isArray(project.nodes) || !Array.isArray(project.edges)) {
    throw new Error('Файл не похож на проект canvasMD.');
  }

  return sanitizeProject({
    ...project,
    updatedAt: new Date().toISOString()
  } as TraceProject);
}

export function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
