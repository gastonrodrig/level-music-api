import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class MaintenanceReminderDto {
  @ApiProperty({ example: '+51987654321' })
  @IsString()
  @IsNotEmpty()
  adminPhone: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'Mezcladora Yamaha MG12XU' })
  @IsString()
  @IsNotEmpty()
  equipmentName: string;

  @ApiProperty({ example: 'Audio' })
  @IsString()
  @IsNotEmpty()
  equipmentType: string;

  @ApiProperty({ example: '2025-10-12T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  maintenanceDate: Date;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  daysRemaining: number;

  @ApiProperty({ example: '670123456789abcdef012345' })
  @IsString()
  @IsNotEmpty()
  maintenanceId: string;
}