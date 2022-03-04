import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne 
} from 'typeorm'; // these are decorators
import { User } from '../users/user.entity';


// Step 1 for creating entity
@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    approved: boolean;

    @Column()
    price: number;

    @Column()
    make: string;

    @Column()
    model: string;

    @Column()
    year: number;

    @Column()
    lng: number;

    @Column()
    lat: number;

    @Column()
    mileage: number;

    // To tell TypeOrm that our Report is associated with a user,
    // the 1st function returns our User Entity class. User class
    // is wrapped with a function to avoid circular reference problem
    // The 2nd function returns the reports for a given user.
    @ManyToOne(() => User, (user) => user.reports)  // The second qualifier, reports, is the property on the user entity.
    user: User;
}
