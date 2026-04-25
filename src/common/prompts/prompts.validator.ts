import Handlebars from 'handlebars';
import { z } from 'zod';

const HANDLEBARS_HELPERS = new Set([
  'if',
  'unless',
  'each',
  'with',
  'lookup',
  'log',
]);

export interface TemplateAnalysis {
  templateVariables: string[];
  schemaKeys: string[];
  missingInSchema: string[];
  unusedInTemplate: string[];
}

export function analyzeTemplate(
  template: string,
  schema: z.ZodObject,
): TemplateAnalysis {
  const templateVariables = [...collectRootReferences(template)];
  const schemaKeys = Object.keys(schema.shape);

  const schemaKeySet = new Set(schemaKeys);
  const templateVarSet = new Set(templateVariables);

  return {
    templateVariables,
    schemaKeys,
    missingInSchema: templateVariables.filter((v) => !schemaKeySet.has(v)),
    unusedInTemplate: schemaKeys.filter((k) => !templateVarSet.has(k)),
  };
}

function collectRootReferences(template: string): Set<string> {
  const ast = Handlebars.parse(template);
  const refs = new Set<string>();
  let blockDepth = 0;

  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; [key: string]: unknown };

    if (n.type === 'PathExpression') {
      if (n.data) return;
      const original = n.original as string;
      if (original === 'this' || original.startsWith('this.')) return;
      if (blockDepth > 0) return;
      const parts = n.parts as string[];
      const root = parts[0];
      if (root && !HANDLEBARS_HELPERS.has(root)) {
        refs.add(root);
      }
      return;
    }

    if (n.type === 'BlockStatement') {
      visit(n.path);
      if (Array.isArray(n.params)) for (const p of n.params) visit(p);
      visit(n.hash);
      blockDepth++;
      visit(n.program);
      visit(n.inverse);
      blockDepth--;
      return;
    }

    for (const value of Object.values(n)) {
      if (Array.isArray(value)) {
        for (const v of value) visit(v);
      } else if (value && typeof value === 'object') {
        visit(value);
      }
    }
  };

  visit(ast);
  return refs;
}
