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

    // To tell TypeOrm that our user is associated with Report(s),
    // the 1st function returns our Report Entity class. We wrap the Entity return type in
    // a function to avoid circular reference between User and Report.
    // The second function returns a user for a given report, again from the target relation, in this case report.
    @OneToMany(() => Report, (report) => report.user) // The second qualifier, user, is the property on the reports entity.
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
