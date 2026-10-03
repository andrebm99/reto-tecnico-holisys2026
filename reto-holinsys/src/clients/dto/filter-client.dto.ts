import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class FilterClienteDto {
  @ApiPropertyOptional({ description: 'Filtrar usuario por número de DNI' })
  @IsOptional()
  @IsString()
  @Length(1, 8, { message: 'El DNI a buscar debe tener entre 1 y 8 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  dni?: string;
  
}