import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';


@Injectable()
export class ReportsService {

  constructor(
    @InjectRepository(Report) private repo: Repository<Report>
  ) { this.repo = repo;}

    // createEstimate(estimateDto: GetEstimateDto) {  // without destructure
    createEstimate({ make, model, lat, lng, year, mileage }: GetEstimateDto) {      // with destructure
    return this.repo.createQueryBuilder()
      .select('AVG(price)', 'price')
      // .where('make = :make', { make: estimateDto.make }) /* :make comes from estimateDto */
      .where('make = :make', { make }) /* using destructure above,  :make comes from estimateDto */
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)')  // orderBy does not have 2nd param; use setParamaters instead
      .setParameters({ mileage })
      .limit(3)   // limit to top 3 reports
      .getRawOne()
  }


  // Used to create an entity and save to the database
  create(reportDto: CreateReportDto, user: User) {
    // creates entity instance
    const report = this.repo.create(reportDto); 
    report.user = user; /* this is how we create our association */

    // save to database
    // The report entity is passed to save() function in order to save data to database
    // save() will either call insert() or update()...effectively an upsert()
    // Alternatively, you can construct an object literal with the properties and pass it to save
    return this.repo.save(report)
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne(id);
    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }

}
