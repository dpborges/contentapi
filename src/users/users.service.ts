import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

// The constructor takes a generic type of Repository, meaning
// repo is of type repository that deals with instances of Users.
// DI does not play nicely with generic types, hence we need the 
// @InjectRepository decorator.
// The @InjectRepostory portion of the constructor tells the Dependency 
// Injection system that we need the User repository. 
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {
    this.repo = repo;
  }

  create(email: string, password: string) {
    // This creates an instance of a user entity. It does not persist any data to the database
    const user = this.repo.create({ email, password });

    // The user entity is passed to save() function in order to save data to database
    // save() will either call insert() or update()...effectively an upsert()
    // Alternatively, you can construct and object literal with the properties and pass it to save
    return this.repo.save(user);
  }

  // findOne lets us look up records by an id or by passing in an object with search criteria
  // such as: { email: 'foobar@foo.com' }. If we look up by id, it will return an object or null. 
  // If we pass in some object with search criteria, it will return the first record found (if exists)
  //  or null (when not found)
  findOne(id: number) {
    if (!id) {   // needed for sqlite, otherwise findOne below will still return first found
      return null;
    }
    return this.repo.findOne(id)
  }

  // returns an array of records that match the search criteria or an empty array 
  // if no records found
  find(email: string) {
    return this.repo.find({ email })
  }

  // In typescript, a Partial marks every field in the object as optional,
  // hence we can specify any number of properties of the User object to update.
  // Typescript will make sure you only provide properties that belonw to User object.
  // NOTE: update makes use of plain objects (not an instance of an entity).
  // To get around this, we need to fetch user from database first,to instaniate
  // a User entity instance, then we can call save() method with that User instance.
  // This approach requires 2 round trips to the database as opposed to just using
  // update(). If you want to avoid to round trips you can run update directly against
  // the database. Downside is that no hooks will be fired.
  async update(id: number, attrs: Partial<User> ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found')
    }
    Object.assign(user, attrs); // this assign all properties of attrs to user
    return this.repo.save(user);
  }

  // Note: remove() is designed to take an entity instance, where delete()
  // takes in a plain object with some search criteria. Hence, we do the
  // find first to instantiate an instance, then pass it to remove
  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.repo.remove(user);
  }
}
