import path from 'path';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { PromptInput, PromptKey, promptRegistry } from './prompts.registry';
import { analyzeTemplate } from './prompts.validator';

@Injectable()
export class PromptsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PromptsService.name);
  private readonly compiled = new Map<PromptKey, HandlebarsTemplateDelegate>();

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all(
      Object.keys(promptRegistry).map(async (key: PromptKey) =>
        this.loadAndValidate(key),
      ),
    );
  }

  render<K extends PromptKey>(key: K, rawInput: PromptInput<K>): string {
    const compiled = this.compiled.get(key);
    if (!compiled) {
      throw new Error(`Prompt "${key}" is not compiled`);
    }

    const data = promptRegistry[key].parse(rawInput);
    return compiled(data);
  }

  private async loadAndValidate(key: PromptKey): Promise<void> {
    const source = await fs.readFile(
      path.join(__dirname, `${key}.hbs`),
      'utf8',
    );

    const { missingInSchema, unusedInTemplate } = analyzeTemplate(
      source,
      promptRegistry[key],
    );

    if (unusedInTemplate.length > 0) {
      this.logger.warn(
        `Prompt "${key}" schema has unused fields: ${unusedInTemplate.join(', ')}`,
      );
    }

    if (missingInSchema.length > 0) {
      throw new Error(
        `Prompt "${key}" template uses unknown variables: ${missingInSchema.join(
          ', ',
        )}`,
      );
    }

    this.compiled.set(key, Handlebars.compile(source, { strict: true }));
  }
}
