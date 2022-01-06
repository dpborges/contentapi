import { Entity, Column, PrimaryGeneratedColumn, 
    AfterInsert, AfterRemove, AfterUpdate, OneToMany 
} from 'typeorm'; // these are decorators
import { Report } from '../reports/report.entity';


// Step 1 for creating entity
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    admin: boolean;

    // To tell TypeOrm that are user is associated with a Report(s),
    // the 1st function returns our Report Entity class. We wrap the Entity return type in
    // a function to avoid circular reference between User and Report.
    // The second function returns a user for a give report.
    @OneToMany(() => Report,  (report) => report.user)
    reports: Report[];

    @AfterInsert()
    logInsert() {
      console.log('Inserted User with id ', this.id)
    }

    @AfterRemove()
    logRemove() {
      console.log('Removed User with id ', this.id)
    }

    @AfterUpdate()
    logUPdate() {
      console.log('Updated User with id ', this.id)
    }
}
