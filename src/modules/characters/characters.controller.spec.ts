/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CharacterEntity } from './character.entity';
import { Provider, Sex } from './character.enum';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

const mockCharacter: CharacterEntity = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  firstName: 'Albert',
  lastName: 'Einstein',
  title: 'Professor of Physics',
  age: 45,
  sex: Sex.Male,
  personality:
    'Curious, empathetic, and quick-witted with a dry sense of humour.',
  backstory: 'Grew up in a small town, fascinated by the stars.',
  model: 'gpt-4o',
  provider: Provider.OpenAI,
  locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  location: undefined as never,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: jest.Mocked<CharactersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        {
          provide: CharactersService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    service = module.get(CharactersService);
  });

  describe('findAll', () => {
    it('should return an array of characters', async () => {
      service.findAll.mockResolvedValue([mockCharacter]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCharacter]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no characters', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });
});
