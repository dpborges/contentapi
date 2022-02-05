import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm'; // these are decorators

@Entity()
export class Contentmd {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain_id: number;

  @Column("uuid")
  creator_id: string;

  @Column()
  content_id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  base_url_override: string;

  @Column()
  excerpt: string;

  @Column("simple-array")
  images: string;

  @Column()
  content_type: string;

  @Column()
  file_type: string;

  @Column()
  word_cnt: number;

  @Column("varchar", { length: 3, default: 'en' })
  lang: string;

  @CreateDateColumn()
  create_date: Date;
  
  @UpdateDateColumn()
  update_date: Date;

}


