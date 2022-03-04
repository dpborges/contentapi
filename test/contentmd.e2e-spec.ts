import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateContentmdDto } from '../src/contentmd/dto/create-contentmd.dto';
import { v4 as uuidv4 } from 'uuid';
import { QueryRunner, getRepository } from "typeorm";
import { Domain } from '../src/domain/entities/domain.entity';
import { domains } from './seeds/contentmd.seed';  /* domain seed data */

describe('Contentmd Test Module (e2e)', () => {
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
  // let nonExistentId = 999
  let imagesArrayString = JSON.stringify([
    {"loc": "/blog/img01", "alt": "image 01"},
    {"loc": "/blog/img02", "alt": "image 02"}
  ])

  // let defaultDomain = {   // used for test#1
  //   name: 'default_joined',
  //   base_url: '/default_joined/blogurl',
  //   acct_id: 1
  // };

  // let contentmdInstance1: Partial<CreateContentmdDto> = {
  let contentmdInstance1 = {
    "acct_id": 2,
    "domain_name": "default",
    "creator_id": uuidv4(),
    "content_id": "acctname1/domainname1",
    "title": "content title no3",
    "slug": "/content-title-no3",
    "base_url_override": "/blog/override",
    "excerpt": "this topic is is a must read",
    // "images": "/blog/image01,alt01|/blog/image02,alt02",
    "images": imagesArrayString,
    "content_type": "post",
    "file_type": "md",
    "word_cnt":  382,
    "lang": "en"
  }
  
  // ********************************************************************
  // POST related Tests for Creating Domain
  // ********************************************************************

  /* Save ids when creating new resources to use them in subsequent tests */
  let savedIds = []

  // it('dummy test using queryRunner  ', () => {
    
  //   let queryRunner: QueryRunner;
  //   queryRunner.query('select now() as current_day_time');
  //   expect(1).toEqual(1);
    
  // });

// TEST #0 
it('Seed the database with the default domain ', () => {

    let testValue = "not a test; used to seed DB";

    getRepository(Domain)
    .createQueryBuilder("domain")
    .insert()
    .into(Domain)
    .values(domains)
    .execute();

    return expect(testValue).toEqual(testValue);
});


  // TEST #1 
  it('Create first content metadata record  ', () => {
    let expectedTitle = contentmdInstance1.title;
    let expectedSlug  = contentmdInstance1.slug;
    
    console.log("***************META DATA INSTANCE ******************");
    console.log(JSON.stringify(contentmdInstance1,null,2));

    return request(app.getHttpServer())
      .post('/contentmd')
      .send(contentmdInstance1)
      .expect(201)
      .then((res) => {
        console.log("RESPONSE BODY")
        console.log(JSON.stringify(res.body,null,2))
        const { id, title, slug  } = res.body;
        // savedIds.push(id);
        expect(id).toBeDefined();
        expect(title).toEqual(expectedTitle);
        expect(slug).toEqual(expectedSlug);
      })
  });

  // TEST #2 
  // it('Create second new domain for acctId ', () => {
  //   let expectedName = secondNewDomain.name;
  //   let expectedbaseUrl = secondNewDomain.base_url;

  //   return request(app.getHttpServer())
  //     .post('/domains')
  //     .send(secondNewDomain)
  //     .expect(201)
  //     .then((res) => {
  //       const { id, name, base_url  } = res.body;
  //       savedIds.push(id);
  //       expect(id).toBeDefined();
  //       expect(name).toEqual(expectedName);
  //       expect(base_url).toEqual(expectedbaseUrl);
  //     })
  // });

  // TEST #3 
  // it('Throw and catch exception for duplicate domain name ', () => {

  //   /* duplicate domain input, as referenced by variables */
  //   let dupDomain = duplicateDomain;

  //   /* expected values */
  //   let expectedStrPattern = /already exists/;
  //   let expectedStatus = 409;  /* 409 = Conflict Exception */

  //   return request(app.getHttpServer())
  //     .post('/domains')
  //     .send(dupDomain)
  //     .expect(expectedStatus)
  //     .then((res) => {
  //       const message = res.text;
  //       const status  = res.status;
  //       expect(message).toEqual(expect.stringMatching(expectedStrPattern))
  //       expect(status).toBe(expectedStatus);
  //     })
  // });

   // TEST #4 
  //  it('Create a toBeDeleteDomain ', () => {
  //   let expectedName = toBeDeletedDomain.name;
  //   let expectedbaseUrl = toBeDeletedDomain.base_url;

  //   return request(app.getHttpServer())
  //     .post('/domains')
  //     .send(toBeDeletedDomain)
  //     .expect(201)
  //     .then((res) => {
  //       const { id, name, base_url  } = res.body;
  //       savedIds.push(id);
  //       expect(id).toBeDefined();
  //       expect(name).toEqual(expectedName);
  //       expect(base_url).toEqual(expectedbaseUrl);
  //     })
  // });

  // ********************************************************************
  // GET related Tests for finding Domains
  // ********************************************************************

  // TEST #5 
  // it('Get contentmd record ', () => {

  //   /* expected values */
  //   let expectedStatus = 200;  
  //   let expectedName  = 'firstDomain';

  //   // const { body } = await request(app.getHttpServer())
  //   return request(app.getHttpServer())
  //     // .get(`/contentmd/${savedIds[0]}`)
  //     .get(`/contentmd/1`)
  //     .expect(404)
  //     // .expect(({ body }) => {
  //     //   expect(body.name).toEqual(expectedName);
  //     // })

  // });

  // TEST #6 
  // it('Get all domains for given acctId ', () => {

  //   let expectedStatus = 200;  
  //   let expectedNumDomains  = 3;
  //   let expectedName = "firstDomain"

  //   // const { body } = await request(app.getHttpServer())
  //   return request(app.getHttpServer())
  //     .get(`/domains?acctid=${acctId}`)
  //     .expect(200)
  //     .expect(({ body }) => {
  //       expect(body.length).toBe(expectedNumDomains);
  //       expect(body[0].name).toEqual(expectedName);
  //     })
  // });

  // TEST #7 
  // it('Get domain (by id) that does not exist  ', () => {
    
  //   /* expected values */
  //   let expectedStatusCode = 404;  
  //   let expectedErrMsg = "Not Found";

  //   // const { body } = await request(app.getHttpServer())
  //   return request(app.getHttpServer())
  //     .get(`/domains/${nonExistentId}`)
  //     .expect(expectedStatusCode)
  //     .expect(({ body }) => {
  //       let statusCode = body.StatusCode;
  //       let statusError = body.error;
  //       expect(statusError).toBe(expectedErrMsg);
  //       expect(1).toEqual(1);
  //     })
  // });
  // ********************************************************************
  // PATCH related Test to update either base_url or name (aka rename) 
  // ********************************************************************

  // TEST #8 
  // it('Update both base_url and domain name for given domain id ', () => {

  //   /* expected values */
  //   let expectedStatus = 200;  /* 409 = Conflict Exception */

  //   /* Request object used for update  */
  //   let domainChange = {                    
  //     name: 'firstDomainupdated',
  //     base_url: '/blog/updated'
  //   }
  //   return request(app.getHttpServer())
  //     .patch(`/domains/${savedIds[0]}`)
  //     .send(domainChange)
  //     .expect(expectedStatus)
  //     .then((res) => {
  //       let updatedDomain = res.body;
  //       expect(updatedDomain.name).toEqual(domainChange.name);
  //       expect(updatedDomain.base_url).toEqual(domainChange.base_url);
  //     })
  // });

  // TEST #9 
  // it('Try to update properties for domain that does not exist ', () => {

  //   /* expected values */
  //   let expectedStatus = 404;  /* 404 = Not found */
  //   let expectedErrMsg = "Not Found";

  //   /* Request object used for update; tries to update name */
  //   let domainChange = {                    
  //     name: 'nonExistentName',
  //   }

  //   return request(app.getHttpServer())
  //     .patch(`/domains/${nonExistentId}`)
  //     .send(domainChange)
  //     // .expect(expectedStatus)
  //     .then((res) => {
  //       let statusCode = res.status;
  //       let errorMsg   = res.error;
  //       expect(statusCode).toEqual(expectedStatus);
  //     })

  // });


  // ********************************************************************
  // DELETE Test to delete single domain by id
  // ********************************************************************

  // TEST #10 
  // it('Delete single domain by domain id ', () => {

  //   /* input; domain id */
  //   let id = 3;

  //   /* expected values */
  //   let expectedStatus = 200;  
  //   let expectedName   = toBeDeletedDomain.name;
  //   let expectedBaseUrl = toBeDeletedDomain.base_url;

  //   return request(app.getHttpServer())
  //     .delete(`/domains/${id}`)
  //     .expect(expectedStatus)
  //     .then((res) => {
  //       let deletedDomain = res.body;
  //       expect(deletedDomain.name).toEqual(expectedName);
  //       expect(deletedDomain.base_url).toEqual(expectedBaseUrl);
  //     })
  // });

  // TEST #11 
  // it('Delete domain by domain id that does not exist', () => {

  //   /* input; domain id */
  //   let id = 333;

  //   /* expected values */
  //   let expectedStatus = 404;  
  //   let expectedStrPattern = /not found/;

  //   return request(app.getHttpServer())
  //     .delete(`/domains/${id}`)
  //     .expect(expectedStatus)
  //     .then((res) => {
  //       let statusCode = res.status;
  //       let errorMsg   = res.text;
  //       expect(statusCode).toEqual(expectedStatus);
  //       expect(errorMsg).toEqual(expect.stringMatching(expectedStrPattern));
  //     })
  // });


});
