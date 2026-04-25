import { z } from 'zod';
import { analyzeTemplate } from './prompts.validator';

describe('analyzeTemplate', () => {
  it('returns no diffs when template variables match the schema', () => {
    const schema = z.object({
      title: z.string(),
      author: z.string(),
    });

    const result = analyzeTemplate('Title: {{title}} by {{author}}', schema);

    expect(result.missingInSchema).toEqual([]);
    expect(result.unusedInTemplate).toEqual([]);
    expect(result.templateVariables.sort()).toEqual(['author', 'title']);
    expect(result.schemaKeys.sort()).toEqual(['author', 'title']);
  });

  it('reports template variables not present in the schema (typos)', () => {
    const schema = z.object({ museumName: z.string() });

    const result = analyzeTemplate('Museum: {{museumNmae}}', schema);

    expect(result.missingInSchema).toEqual(['museumNmae']);
  });

  it('reports schema fields that the template never references', () => {
    const schema = z.object({
      shown: z.string(),
      forgotten: z.string(),
    });

    const result = analyzeTemplate('Hello {{shown}}', schema);

    expect(result.unusedInTemplate).toEqual(['forgotten']);
  });

  it('treats nested paths as a single root variable', () => {
    const schema = z.object({ user: z.object({ name: z.string() }) });

    const result = analyzeTemplate('Hi {{user.name}}', schema);

    expect(result.missingInSchema).toEqual([]);
    expect(result.unusedInTemplate).toEqual([]);
    expect(result.templateVariables).toEqual(['user']);
  });

  it('does not flag built-in handlebars helpers as missing', () => {
    const schema = z.object({
      items: z.array(z.object({ name: z.string() })),
    });

    const result = analyzeTemplate(
      '{{#each items}}{{this.name}}{{/each}}',
      schema,
    );

    expect(result.missingInSchema).toEqual([]);
    expect(result.unusedInTemplate).toEqual([]);
  });

  it('captures variables used inside conditionals', () => {
    const schema = z.object({ enabled: z.boolean(), label: z.string() });

    const result = analyzeTemplate('{{#if enabled}}{{label}}{{/if}}', schema);

    expect(result.missingInSchema).toEqual([]);
  });

  it('reports a typo in a conditional expression', () => {
    const schema = z.object({ enabled: z.boolean() });

    const result = analyzeTemplate('{{#if enabledd}}yes{{/if}}', schema);

    expect(result.missingInSchema).toEqual(['enabledd']);
    expect(result.unusedInTemplate).toEqual(['enabled']);
  });
});
