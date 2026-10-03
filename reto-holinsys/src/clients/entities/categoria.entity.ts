import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mr_categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  nombre!: string;

  @Column({ name: 'puntos_minimos', type: 'int' })
  puntosMinimos!: number;

  @Column({ type: 'longtext', nullable: true })
  beneficios?: string;
}