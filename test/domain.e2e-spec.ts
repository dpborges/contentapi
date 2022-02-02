import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
// import { DomainModule } from '../src/domain/domain.module';
import { CreateDomainDto } from './../src/domain/dto/create-domain.dto';

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

  let acctId = 1;  

  let firstNewDomain: CreateDomainDto = {   // used for test#1
    name: 'firstDomain',
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

  // TEST #1 - Create the first new domain
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

  // TEST #2 - Create the second new domain
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

  // TEST #3 - Try creating duplicate domain within same acctid
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

   // TEST #4 - Create a domain that will be deleted in a subsequent delete test
   it('Create a toBeDeleteDomain ', () => {
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

  // TEST #5 - Get domain by id (using first value saved in the savedIds array)
  it('Get domain by id ', () => {

    /* expected values */
    let expectedStatus = 200;  
    let expectedName  = 'firstDomain';

    // const { body } = await request(app.getHttpServer())
    return request(app.getHttpServer())
      .get(`/domains/${savedIds[0]}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toEqual(expectedName);
      })

  });
  // TEST #6 - Get all domains for given acct_id (defined top of file)
  it('Get all domains for given acctId ', () => {

    let expectedStatus = 200;  
    let expectedNumDomains  = 3;
    let expectedName = "firstDomain"

    // const { body } = await request(app.getHttpServer())
    return request(app.getHttpServer())
      .get(`/domains?acctid=${acctId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBe(expectedNumDomains);
        expect(body[0].name).toEqual(expectedName);
      })
  });

  // ********************************************************************
  // PATCH related Test to update either base_url or name (aka rename) 
  // ********************************************************************

  // TEST #7 - update both base_url and domain name
  it('Update both base_url and domain name for given domain id ', () => {

    /* expected values */
    let expectedStatus = 200;  /* 409 = Conflict Exception */

    /* Request object used for update  */
    let domainChange = {                    
      name: 'firstDomainupdated',
      base_url: '/blog/updated'
    }
    return request(app.getHttpServer())
      .patch(`/domains/${savedIds[0]}`)
      .send(domainChange)
      .expect(expectedStatus)
      .then((res) => {
        let updatedDomain = res.body;
        expect(updatedDomain.name).toEqual(domainChange.name);
        expect(updatedDomain.base_url).toEqual(domainChange.base_url);
      })
  });

  // ********************************************************************
  // DELETE Test to delete single domain by id
  // ********************************************************************

  // TEST #8 - delete domain by domain id
  it('delete domain by domain id ', () => {

    /* input */
    let id = 3;

    /* expected values */
    let expectedStatus = 200;  /* 409 = Conflict Exception */

    return request(app.getHttpServer())
      .delete(`/domains/${id}`)
      .expect(expectedStatus)
      .then((res) => {
        let deletedDomain = res.body;
        expect(deletedDomain.name).toEqual(toBeDeletedDomain.name);
        expect(deletedDomain.base_url).toEqual(toBeDeletedDomain.base_url);
        expect(1).toEqual(1);
        console.log(JSON.stringify(deletedDomain, null, 2));
      })
  });
});
