import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class TransaccionPuntosDto {
  @ApiProperty({
    description: 'DNI del cliente al que se le sumarán o restarán puntos',
    example: '10000001',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 8, { message: 'El DNI a buscar debe tener entre 1 y 8 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  dni!: string;

  @ApiProperty({ description: 'Tipo de movimiento', enum: ['sumar', 'restar'] })
  @IsNotEmpty()
  @IsEnum(['sumar', 'restar'], {
    message: 'El tipo debe ser "sumar" o "restar"',
  })
  tipo!: 'sumar' | 'restar';

  @ApiProperty({ description: 'Cantidad de puntos', example: 500 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive({ message: 'Los puntos deben ser un número positivo' })
  puntos!: number;
  @ApiProperty({
    description: 'Motivo de la transacción',
    example: 'Compra en tienda física',
  })
  @IsNotEmpty()
  @IsString()
  motivo!: string;
}
