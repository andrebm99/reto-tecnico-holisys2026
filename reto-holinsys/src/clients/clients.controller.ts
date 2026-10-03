import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransaccionPuntosDto } from './dto/transaccionPuntos.dto';

@ApiTags('Clientes y Puntos')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('puntos')
  @ApiOperation({ summary: 'Enviar pedidos de puntos a un usuario.' })
  @ApiResponse({
    status: 201,
    description: 'Puntos actualizados correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Puntos insuficientes o datos incorrectos.',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  procesarPuntos(@Body() transaccionPuntosDto: TransaccionPuntosDto) {
    return this.clientsService.procesarMovimientosPuntos(transaccionPuntosDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes, sus puntos, nivel actual y puntos faltantes',
  })
  @ApiQuery({
    name: 'dni',
    required: false,
    description: 'Filtrar opcionalmente por número de DNI',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida con éxito.',
  })
  findAll(@Query('dni') dni?: string) {
    return this.clientsService.findAllWithLevels(dni);
  }
}
