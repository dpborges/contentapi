import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm'; // these are decorators

// import { Entity, Column, PrimaryGeneratedColumn, 
//   AfterInsert, AfterRemove, AfterUpdate, OneToMany 
// } from 'typeorm'; // these are decorators

@Entity()
export class Domain {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  base_url: string;

  @Column()
  acct_id: number;

  @CreateDateColumn()
  create_date: Date;
  
  @UpdateDateColumn()
  update_date: Date;
}

