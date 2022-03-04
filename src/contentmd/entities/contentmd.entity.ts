import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm'; // these are decorators
import { Domain } from '../../domain/entities/domain.entity';

@Entity()
export class Contentmd {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acct_id: number;

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

  @Column("varchar", { default: '' })
  base_url_override: string;

  @Column("varchar", { default: '' })
  excerpt: string;

  // @Column("simple-array")
  @Column()
  images: string;

  @Column()
  content_type: string;

  @Column()
  file_type: string;

  @Column()
  word_cnt: number;

  @Column("varchar", { length: 3, default: 'en' })
  lang: string;

  // First arg is the type of the target relation, which is a function that returns a Domain entity class.
  // The 2nd argument takes an instance of domain entity, and returns an instance of the related entity.
  // The second argument also says if I pass in an instance of an entity, what is the dot notation 
  // I use to access the relation.
  // The property reflects the property that stores the target relation. If the target relation is Many, 
  // then property will be an array. If target relation is a One, property will be an entity type. 
  // Note, the ManyToOne decorator will add the domain_id to the contentmd table. To access the
  // domain for the Contentmd, you would access with contentmd.domain
  @ManyToOne(() => Domain, domain => domain.contentmds)
  domain: Domain;

  @CreateDateColumn()
  create_date: Date;
  
  @UpdateDateColumn()
  update_date: Date;
 
}


