import { TransaccionPuntosDto } from './dto/transaccionPuntos.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Cliente } from './entities/client.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { ApiBadRequestResponse } from '@nestjs/swagger';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    private readonly dataSource: DataSource,
  ) {}

  async procesarMovimientosPuntos(dto: TransaccionPuntosDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente = await queryRunner.manager.findOne(Cliente, {
        where: { dni: dto.dni },
      });

      if (!cliente) {
        throw new NotFoundException(
          `El cliente con DNI ${dto.dni} no fue encontrado.`,
        );
      }

      let nuevoTotalPuntos = cliente.puntos;

      if (dto.tipo === 'sumar') {
        nuevoTotalPuntos += dto.puntos;
      } else {
        if (cliente.puntos < dto.puntos) {
          throw new BadRequestException(
            'El cliente no cuenta con suficientes puntos para restar.',
          );
        }

        nuevoTotalPuntos -= dto.puntos;
      }

      cliente.puntos = nuevoTotalPuntos;
      await queryRunner.manager.save(cliente);

      await queryRunner.manager.query(
        `INSERT INTO mr_movimiento_puntos (cliente_id, tipo, puntos, motivo, puntos_resultado) VALUES (?, ?, ?, ?, ?)`,
        [cliente.id, dto.tipo, dto.puntos, dto.motivo, nuevoTotalPuntos],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Puntos actualizados correctamente -> ${dto.tipo}`,
        cliente: cliente.nombre,
        dni: cliente.dni,
        puntosActuales: nuevoTotalPuntos,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof ApiBadRequestResponse
      ) {
        throw error;
      }

      console.error('Error en transacción de puntos: ', error);

      throw new InternalServerErrorException(
        'Error al procesar la solicitud de puntos.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllWithLevels(dni?: string) {
    try {
      const where = dni ? { dni: Like(`%${dni}%`) } : {};
      const clientes = await this.clienteRepo.find({ where });
      const categorias = await this.categoriaRepo.find({
        order: { puntosMinimos: 'ASC' },
      });

      return clientes.map((cliente) => {
        let nivelActual = 'Sin Nivel';
        let siguienteNivel: string | null = null;
        let puntosFaltantes = 0;

        for (let i = 0; i < categorias.length; i++) {
          if (cliente.puntos >= categorias[i].puntosMinimos) {
            nivelActual = categorias[i].nombre;
            if (categorias[i + 1]) {
              siguienteNivel = categorias[i + 1].nombre;
              puntosFaltantes =
                categorias[i + 1].puntosMinimos - cliente.puntos;
            } else {
              siguienteNivel = 'Máximo Nivel Alcanzado';
              puntosFaltantes = 0;
            }
          }
        }

        return {
          id: cliente.id,
          nombre: cliente.nombre,
          dni: cliente.dni,
          puntos: cliente.puntos,
          nivelActual,
          puntosFaltantes: puntosFaltantes > 0 ? puntosFaltantes : 0,
          siguienteNivel,
        };
      });
    } catch (error) {
      console.error('Error al listar clientes y niveles:', error);
      throw new InternalServerErrorException(
        'Error al obtener la lista de clientes.',
      );
    }
  }

}
