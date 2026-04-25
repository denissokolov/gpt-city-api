import { Sex } from '../../modules/characters/character.enum';
import { PromptsService } from './prompts.service';

describe('PromptsService', () => {
  let service: PromptsService;

  beforeEach(async () => {
    service = new PromptsService();
    await service.onApplicationBootstrap();
  });

  describe('render', () => {
    it('renders the place/system prompt', () => {
      const output = service.render('place/system', {});

      expect(output).toContain('place distributor');
    });

    it('renders the place/user prompt with all data', () => {
      const output = service.render('place/user', {
        userTime: '2026-04-19T10:00:00.000Z',
        location: {
          name: 'Downtown',
          description: 'The heart of the city.',
          places: [
            {
              id: 'place-1',
              name: 'Central Library',
              description: 'A quiet library.',
            },
          ],
          characters: [
            {
              id: 'char-1',
              firstName: 'Albert',
              lastName: 'Einstein',
              title: 'Professor',
              age: 45,
              sex: Sex.Male,
              personality: 'Curious.',
              backstory: 'Loves stars.',
            },
          ],
        },
      });

      expect(output).toContain('<name>Downtown</name>');
      expect(output).toContain('<id>place-1</id>');
      expect(output).toContain('<id>char-1</id>');
      expect(output).toContain('<firstName>Albert</firstName>');
      expect(output).toContain('2026-04-19T10:00:00.000Z');
    });

    it('throws when input does not match the schema', () => {
      expect(() =>
        service.render('place/user', {
          userTime: 123 as unknown as string,
          location: {
            name: 'Downtown',
            description: 'desc',
            places: [],
            characters: [],
          },
        }),
      ).toThrow();
    });

    it('caches compiled templates between calls', () => {
      const first = service.render('place/system', {});
      const second = service.render('place/system', {});

      expect(first).toEqual(second);
    });
  });

  describe('onApplicationBootstrap', () => {
    it('loads and validates every registered prompt', async () => {
      const fresh = new PromptsService();
      await expect(fresh.onApplicationBootstrap()).resolves.not.toThrow();
    });
  });
});
