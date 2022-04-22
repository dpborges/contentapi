import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm'; // these are decorators
// import { Contentmd } from '../../contentmd/entities/contentmd.entity'

// import { Entity, Column, PrimaryGeneratedColumn, 
//   AfterInsert, AfterRemove, AfterUpdate, OneToMany 
// } from 'typeorm'; // these are decorators

@Entity()
export class Project {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acct_id: number;

  @Column()
  name: string;

  // First arg is the target relation, which is function that returns a Contentmd entity class.
  // The 2nd argument takes an instance of Contentmd entity, and returns an instance of the related entity.
  // The property reflects the property that stores the target relation. If the target relation is Many, 
  // then property will be an array. If target relation is a One, property will be an entity type.
  // @OneToMany(() => Contentmd, contentmd => contentmd.domain)
  // contentmds: Contentmd[];

  @CreateDateColumn()
  create_date: Date;
  
  @UpdateDateColumn()
  update_date: Date;
}
