import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm'; // these are decorators
/**
 * This table tracks when some content gets promoted from one domain to another. When you
 * initially promote the content to another domain, the promotion table will be updated
 * with the target domain and contentid that was generated. When user wants to promote 
 * that content again for 2nd, 3rd time, this table maintains the linkage between the source 
 * contentmd id and target contentmd id. Refer to Project data analysis doc for more detail
 * on windows m/c.
 * */
@Entity()
export class Promotion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acct_id: number;

  @Column()
  domain_id: number;

  @Column()
  contentmd_id: number;

  @Column()
  parent_contentmd_id: number;

  @Column()
  parent_id: number;  /* this self referencing id */

  @CreateDateColumn()
  create_date: Date;
  
  @UpdateDateColumn()
  update_date: Date;
  
}
