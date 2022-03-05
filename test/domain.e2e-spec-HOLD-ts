import { getRepository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
// import { DomainModule } from '../src/domain/domain.module';
import { CreateDomainDto } from './../src/domain/dto/create-domain.dto';
import { domains } from './seeds/domain.seed';
import { Domain } from '../src/domain/entities/domain.entity';

describe('Domain Controller (e2e)', () => {
  let app: INestApplication;

  // Keep in mind our jest-e2e.json file has been configured to call the setUp.ts script,
  // which deletes the database before all e2e tests, and closes the application 
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // ************************************************************* */
  // Inputs to test cases
  // ************************************************************* */

  "image1,alt|image2,alt" 

  let acctId = 1;  
  let nonExistentId = 999

  let firstNewDomain: CreateDomainDto = {   // used for test#1
    name: 'default',
    base_url: '/first/blogurl',
    acct_id: acctId
  };

  let secondNewDomain: CreateDomainDto = {  // used for test#2
    name: 'secondDomain',
    base_url: '/second/blogurl',
    acct_id: acctId
  };

  let duplicateDomain: CreateDomainDto = secondNewDomain; // used for test#3

  let toBeDeletedDomain: CreateDomainDto = {  // used for test#4
    name: 'toBeDeletedDomain',
    base_url: '/second/blogurl',
    acct_id: acctId
  };

  // ********************************************************************
  // POST related Tests for Creating Domain
  // ********************************************************************

  /* Save ids when creating new resources to use them in subsequent tests */
  let savedIds = []

  // Test 0
  // it('Seed the database', () => {

  //   getRepository(Domain)
  //   .createQueryBuilder("domain")
  //   .insert()
  //   .into(Domain)
  //   .values(domains)
  //   .execute();

  //   return expect(0).toEqual(0);
  // });

  // TEST #1 
  it('Create first new domain for acctId  ', () => {
    let expectedName = firstNewDomain.name;
    let expectedbaseUrl = firstNewDomain.base_url;

    return request(app.getHttpServer())
      .post('/domains')
      .send(firstNewDomain)
      .expect(201)
      .then((res) => {
        const { id, name, base_url  } = res.body;
        savedIds.push(id);
        expect(id).toBeDefined();
        expect(name).toEqual(expectedName);
        expect(base_url).toEqual(expectedbaseUrl);
      })
  });

  // TEST #2 
  it('Create second new domain for acctId ', () => {
    let expectedName = secondNewDomain.name;
    let expectedbaseUrl = secondNewDomain.base_url;

    return request(app.getHttpServer())
      .post('/domains')
      .send(secondNewDomain)
      .expect(201)
      .then((res) => {
        const { id, name, base_url  } = res.body;
        savedIds.push(id);
        expect(id).toBeDefined();
        expect(name).toEqual(expectedName);
        expect(base_url).toEqual(expectedbaseUrl);
      })
  });

  // TEST #3 
  it('Throw and catch exception for duplicate domain name ', () => {

    /* duplicate domain input, as referenced by variables */
    let dupDomain = duplicateDomain;

    /* expected values */
    let expectedStrPattern = /already exists/;
    let expectedStatus = 409;  /* 409 = Conflict Exception */

    return request(app.getHttpServer())
      .post('/domains')
      .send(dupDomain)
      .expect(expectedStatus)
      .then((res) => {
        const message = res.text;
        const status  = res.status;
        expect(message).toEqual(expect.stringMatching(expectedStrPattern))
        expect(status).toBe(expectedStatus);
      })
  });

   // TEST #4 
   it('Create a toBeDeletedDomain ', () => {
    let expectedName = toBeDeletedDomain.name;
    let expectedbaseUrl = toBeDeletedDomain.base_url;

    return request(app.getHttpServer())
      .post('/domains')
      .send(toBeDeletedDomain)
      .expect(201)
      .then((res) => {
        const { id, name, base_url  } = res.body;
        savedIds.push(id);
        expect(id).toBeDefined();
        expect(name).toEqual(expectedName);
        expect(base_url).toEqual(expectedbaseUrl);
      })
  });

  // ********************************************************************
  // GET related Tests for finding Domains
  // ********************************************************************

  // TEST #5 
  it('Get domain by id ', () => {

    /* expected values */
    let expectedStatus = 200;  
    let expectedName  = 'default';

    // const { body } = await request(app.getHttpServer())
    console.log("SAVED IDS");
    console.log(savedIds);
    return request(app.getHttpServer())
      .get(`/domains/${savedIds[0]}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toEqual(expectedName);
      })

  });

  // TEST #6 
  it('Get all domains for given acctId ', () => {

    let expectedStatus = 200;  
    let expectedNumDomains  = 3;
    let expectedName = "default"

    // const { body } = await request(app.getHttpServer())
    return request(app.getHttpServer())
      .get(`/domains?acctid=${acctId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBe(expectedNumDomains);
        expect(body[0].name).toEqual(expectedName);
      })
  });

  // TEST #7 
  it('Get domain (by id) that does not exist  ', () => {
    
    /* expected values */
    let expectedStatusCode = 404;  
    let expectedErrMsg = "Not Found";

    // const { body } = await request(app.getHttpServer())
    return request(app.getHttpServer())
      .get(`/domains/${nonExistentId}`)
      .expect(expectedStatusCode)
      .expect(({ body }) => {
        let statusCode = body.StatusCode;
        let statusError = body.error;
        expect(statusError).toBe(expectedErrMsg);
        expect(1).toEqual(1);
      })
  });
  // ********************************************************************
  // PATCH related Test to update either base_url or name (aka rename) 
  // ********************************************************************

  // TEST #8 
  it('Update both base_url and domain name for given domain id ', () => {

    /* expected values */
    let expectedStatus = 200;  /* 409 = Conflict Exception */

    /* Request object used for update  */
    let domainChange = {                    
      name: 'secondDomainUpdated',
      base_url: '/second/blogurl-updated'
    }
    return request(app.getHttpServer())
      .patch(`/domains/${savedIds[1]}`)
      .send(domainChange)
      .expect(expectedStatus)
      .then((res) => {
        let updatedDomain = res.body;
        expect(updatedDomain.name).toEqual(domainChange.name);
        expect(updatedDomain.base_url).toEqual(domainChange.base_url);
      })
  });

  // TEST #9 
  it('Try to update properties for domain that does not exist ', () => {

    /* expected values */
    let expectedStatus = 404;  /* 404 = Not found */
    let expectedErrMsg = "Not Found";

    /* Request object used for update; tries to update name */
    let domainChange = {                    
      name: 'nonExistentName',
    }

    return request(app.getHttpServer())
      .patch(`/domains/${nonExistentId}`)
      .send(domainChange)
      // .expect(expectedStatus)
      .then((res) => {
        let statusCode = res.status;
        let errorMsg   = res.error;
        expect(statusCode).toEqual(expectedStatus);
      })

  });


  // ********************************************************************
  // DELETE Test to delete single domain by id
  // ********************************************************************

  // TEST #10 
  it('Delete single domain by domain id ', () => {

    /* input; domain id */
    let id = 3;

    /* expected values */
    let expectedStatus = 200;  
    let expectedName   = toBeDeletedDomain.name;
    let expectedBaseUrl = toBeDeletedDomain.base_url;

    return request(app.getHttpServer())
      .delete(`/domains/${id}`)
      .expect(expectedStatus)
      .then((res) => {
        let deletedDomain = res.body;
        expect(deletedDomain.name).toEqual(expectedName);
        expect(deletedDomain.base_url).toEqual(expectedBaseUrl);
      })
  });

  // TEST #11 
  it('Delete domain by domain id that does not exist', () => {

    /* input; domain id */
    let id = 333;

    /* expected values */
    let expectedStatus = 404;  
    let expectedStrPattern = /not found/;

    return request(app.getHttpServer())
      .delete(`/domains/${id}`)
      .expect(expectedStatus)
      .then((res) => {
        let statusCode = res.status;
        let errorMsg   = res.text;
        expect(statusCode).toEqual(expectedStatus);
        expect(errorMsg).toEqual(expect.stringMatching(expectedStrPattern));
      })
  });


});
