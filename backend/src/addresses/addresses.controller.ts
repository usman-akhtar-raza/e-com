import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  create(@CurrentUser() user: User, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user addresses' })
  findAll(@CurrentUser() user: User) {
    return this.addressesService.findAllUserAddresses(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by id' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(id, user.id, updateAddressDto);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressesService.setDefault(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressesService.remove(id, user.id);
  }
}
