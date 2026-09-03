import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { AddressType } from '../common/enums/address-type.enum';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: jest.Mocked<Partial<Repository<Address>>>;

  const mockAddress: Address = {
    id: 'addr-uuid-1',
    userId: 'user-uuid-1',
    user: {} as any,
    fullName: 'John Doe',
    phone: '+1234567890',
    addressLine1: '123 Elm St',
    addressLine2: undefined,
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'USA',
    addressType: AddressType.SHIPPING,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([mockAddress]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(dto => ({ id: 'addr-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(addr => Promise.resolve(addr)),
      update: jest.fn().mockResolvedValue({ affected: 1 } as any),
      remove: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: getRepositoryToken(Address), useValue: repo },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create address successfully', async () => {
      const dto = {
        fullName: 'Jane Doe',
        phone: '+9876543210',
        addressLine1: '456 Oak St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
      };

      const result = await service.create('user-uuid-1', dto);
      expect(repo.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return address if user owns it', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockAddress);
      const addr = await service.findOne('addr-uuid-1', 'user-uuid-1');
      expect(addr).toEqual(mockAddress);
    });

    it('should throw ForbiddenException if address belongs to another user', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockAddress);
      await expect(service.findOne('addr-uuid-1', 'other-user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if address not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid-id', 'user-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefault', () => {
    it('should set address as default and reset others', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockAddress);
      const addr = await service.setDefault('addr-uuid-1', 'user-uuid-1');
      expect(repo.update).toHaveBeenCalledWith({ userId: 'user-uuid-1' }, { isDefault: false });
      expect(addr.isDefault).toBe(true);
    });
  });
});
