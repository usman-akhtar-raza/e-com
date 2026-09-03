import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    if (createAddressDto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    } else {
      const count = await this.addressRepository.count({ where: { userId } });
      if (count === 0) {
        createAddressDto.isDefault = true;
      }
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    return this.addressRepository.save(address);
  }

  async findAllUserAddresses(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You can only access your own addresses');
    }

    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);
    await this.addressRepository.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
  }
}
