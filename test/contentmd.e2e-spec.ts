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
    {"src": "/blog/imag01", "alt": "image 01"},
    {"src": "/blog/imag02", "alt": "image 02"}
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
    "title": "content title no1",
    "base_url_override": "/blog/override",
    "slug": "/content-title-no1",
    "excerpt": "this topic is is a must read",
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
  it('1- Create first content metadata record  ', () => {
    let expectedTitle = contentmdInstance1.title;
    let expectedSlug  = contentmdInstance1.slug;

    return request(app.getHttpServer())
      .post('/contentmd')
      .send(contentmdInstance1)
      .expect(201)
      .then((res) => {
        // console.log("RESPONSE  ")
        // console.log(JSON.stringify(res.body,null,2))
        const { id, title, slug  } = res.body;
        // savedIds.push(id);
        expect(id).toBeDefined();
        expect(title).toEqual(expectedTitle);
        expect(slug).toEqual(expectedSlug);
      })
  });

  // TEST #2 
  it('2- Fails to create content metadata when domain does not exist  ', () => {
    /* contruct modified instance with domain that does not exist */
    let contentmdInstance2 = Object.assign(contentmdInstance1, { "domain_name": "doesNotExist" });
    let expectedTitle = contentmdInstance2.title;
    let expectedSlug  = contentmdInstance2.slug;
    let expectedStrPattern = "does not exists";
    
    return request(app.getHttpServer())
      .post('/contentmd')
      .send(contentmdInstance2)
      .expect(404)
      .then((res) => {
        // console.log("RESPONSE INSTANCE 2")
        // console.log(JSON.stringify(res.body,null,2))
        expect(res.text).toEqual(expect.stringMatching(expectedStrPattern))
      })
  });

  // TEST #3 
  it('3- Fails to create a duplicate content metadata record ', () => {
    /* contruct modified instance with slug that already exists */
    let contentmdInstance3 = Object.assign(contentmdInstance1, { 
      "slug": "/content-title-no1",
      "domain_name": "default"
    });
    let expectedTitle = contentmdInstance3.title;
    let expectedSlug  = contentmdInstance3.slug;
    let expectedStrPattern = "already exists";
    
    return request(app.getHttpServer())
      .post('/contentmd')
      .send(contentmdInstance3)
      .expect(409)
      .then((res) => {
        expect(res.text).toEqual(expect.stringMatching(expectedStrPattern))
      })
  });

  // TEST #4 
  it('4- Creates same content as in test #3 in domain2  ', () => {
    /* contruct modified instance with slug that already exists */
    let contentmdInstance3 = Object.assign(contentmdInstance1, { 
      "slug": "/content-title-no1",
      "domain_name": "domain2"
    });
    let expectedDomain = contentmdInstance3.domain_name;
    
    return request(app.getHttpServer())
      .post('/contentmd')
      .send(contentmdInstance3)
      .expect(201)
      .then((res) => {
        const { domain } = res.body;
        // console.log("RESPONSE INSTANCE 3")
        // console.log(JSON.stringify(res.body,null,2))
        expect(domain.name).toEqual(expectedDomain);
      })
  });

  // TEST #5 
  it('5- Get content metadata by id and access images array', () => {
    /* expected values */
    let expectedStatus = 200;  
    let expectedSlug  = '/content-title-no1';
    let expectedImage1Src = '/blog/imag01';

    return request(app.getHttpServer())
      .get(`/contentmd/1`)
      .expect(expectedStatus)
      .expect(({ body }) => {
        let imagesArray = JSON.parse(body.images);
        let image1Src = imagesArray[0].src;
        console.log("Name of image 1 src url");
        console.log(image1Src);
        expect(body.slug).toEqual(expectedSlug);
        expect(image1Src).toEqual(expectedImage1Src);
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
