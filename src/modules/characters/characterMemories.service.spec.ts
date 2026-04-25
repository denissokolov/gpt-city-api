/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CharacterMemoriesService } from './characterMemories.service';
import { CharacterMemoryEntity } from './characterMemory.entity';
import { PromptsService } from '../../common/prompts/prompts.service';

const characterId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const userId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';

const mockMemory: CharacterMemoryEntity = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  characterId,
  character: undefined as never,
  userId,
  user: undefined as never,
  relationship: 'a curious stranger',
  sentiment: 'cautiously friendly',
  familiarity: 'has met them once',
  keyFacts: 'works as a teacher; loves coffee',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('CharacterMemoriesService', () => {
  let service: CharacterMemoriesService;
  let repository: jest.Mocked<Repository<CharacterMemoryEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterMemoriesService,
        {
          provide: getRepositoryToken(CharacterMemoryEntity),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PromptsService,
          useValue: {
            render: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CharacterMemoriesService>(CharacterMemoriesService);
    repository = module.get(getRepositoryToken(CharacterMemoryEntity));
  });

  describe('findOne', () => {
    it('should return the memory for the given (characterId, userId) pair', async () => {
      repository.findOneBy.mockResolvedValue(mockMemory);

      const result = await service.findOne(characterId, userId);

      expect(result).toBe(mockMemory);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        characterId,
        userId,
      });
    });

    it('should return null when no memory exists', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(characterId, userId);

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    const input = {
      characterId,
      userId,
      relationship: 'an old friend',
      sentiment: 'fond and protective',
      familiarity: 'knows them well',
      keyFacts: 'shares a love of stargazing',
    };

    it('should update the existing memory in place', async () => {
      const existing = { ...mockMemory };
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockImplementation((m) =>
        Promise.resolve(m as CharacterMemoryEntity),
      );

      const result = await service.upsert(input);

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existing.id,
          characterId,
          userId,
          relationship: input.relationship,
          sentiment: input.sentiment,
          familiarity: input.familiarity,
          keyFacts: input.keyFacts,
        }),
      );
      expect(result.relationship).toBe(input.relationship);
    });

    it('should create a new memory when none exists', async () => {
      repository.findOneBy.mockResolvedValue(null);
      const created = { ...mockMemory, ...input };
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.upsert(input);

      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });
  });
});
