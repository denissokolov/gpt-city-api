import { LocationEntity } from './location.entity';
import { Locale } from './location.enum';
import { PlaceDistributorService } from './placeDistributor.service';
import { Provider, Sex } from '../characters/character.enum';

const mockGenerateText = jest.fn();
const mockOutputObject = jest.fn((args: unknown) => ({
  __outputObject: true,
  args,
}));

jest.mock('ai', () => ({
  generateText: (...args: unknown[]) =>
    (mockGenerateText as (...args: unknown[]) => unknown)(...args),
  Output: {
    object: (args: unknown) =>
      (mockOutputObject as (args: unknown) => unknown)(args),
  },
}));

const mockLocation: LocationEntity = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Downtown District',
  description: 'The bustling heart of the city.',
  locale: Locale.EnUs,
  characters: [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      firstName: 'Albert',
      lastName: 'Einstein',
      title: 'Professor of Physics',
      age: 45,
      sex: Sex.Male,
      personality: 'Curious and quick-witted.',
      backstory: 'Grew up fascinated by the stars.',
      model: 'gpt-4o',
      provider: Provider.OpenAI,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  places: [
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'Central Library',
      description: 'A quiet library with cozy reading nooks.',
      locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      location: undefined as never,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('PlaceDistributorService', () => {
  let service: PlaceDistributorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlaceDistributorService();
  });

  describe('distributeCharacters', () => {
    it('should return the output from generateText', async () => {
      const distribution = [
        {
          placeId: mockLocation.places[0].id,
          charactersIds: [mockLocation.characters[0].id],
        },
      ];
      mockGenerateText.mockResolvedValue({ output: distribution });

      const result = await service.distributeCharacters(
        mockLocation,
        '2026-04-19T10:00:00.000Z',
      );

      expect(result).toEqual(distribution);
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
    });

    it('should pass the expected arguments to generateText', async () => {
      mockGenerateText.mockResolvedValue({ output: [] });
      const userTime = '2026-04-19T10:00:00.000Z';

      await service.distributeCharacters(mockLocation, userTime);

      const firstCall = mockGenerateText.mock.calls[0] as unknown[];
      const callArgs = firstCall[0] as {
        model: string;
        system: string;
        prompt: string;
        maxRetries: number;
        output: unknown;
      };

      expect(callArgs.model).toBe('anthropic/claude-opus-4.6');
      expect(callArgs.maxRetries).toBe(3);
      expect(callArgs.system).toContain('place distributor');
      expect(callArgs.prompt).toContain(mockLocation.name);
      expect(callArgs.prompt).toContain(mockLocation.places[0].id);
      expect(callArgs.prompt).toContain(mockLocation.characters[0].id);
      expect(callArgs.prompt).toContain(userTime);
      expect(mockOutputObject).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from generateText', async () => {
      mockGenerateText.mockRejectedValue(new Error('upstream failure'));

      await expect(
        service.distributeCharacters(mockLocation, '2026-04-19T10:00:00.000Z'),
      ).rejects.toThrow('upstream failure');
    });
  });

  describe('generateUserPrompt', () => {
    it('should include all places and characters', () => {
      const prompt = service.generateUserPrompt(
        mockLocation,
        '2026-04-19T10:00:00.000Z',
      );

      expect(prompt).toContain(`<id>${mockLocation.places[0].id}</id>`);
      expect(prompt).toContain(`<name>${mockLocation.places[0].name}</name>`);
      expect(prompt).toContain(`<id>${mockLocation.characters[0].id}</id>`);
      expect(prompt).toContain(
        `<firstName>${mockLocation.characters[0].firstName}</firstName>`,
      );
      expect(prompt).toContain(
        `<personality>${mockLocation.characters[0].personality}</personality>`,
      );
    });

    it('should render an empty places block when there are none', () => {
      const prompt = service.generateUserPrompt(
        { ...mockLocation, places: [] },
        '2026-04-19T10:00:00.000Z',
      );

      expect(prompt).not.toContain('<place>');
      expect(prompt).toContain('<places>');
    });

    it('should render an empty characters block when there are none', () => {
      const prompt = service.generateUserPrompt(
        { ...mockLocation, characters: [] },
        '2026-04-19T10:00:00.000Z',
      );

      expect(prompt).not.toContain('<character>');
      expect(prompt).toContain('<characters>');
    });
  });

  describe('getSystemPrompt', () => {
    it('should describe the distributor role', () => {
      const prompt = service.getSystemPrompt();

      expect(prompt).toContain('place distributor');
    });
  });
});
