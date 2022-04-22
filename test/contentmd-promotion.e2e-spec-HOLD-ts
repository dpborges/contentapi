import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateContentmdDto } from '../src/contentmd/dto/create-contentmd.dto';
import { v4 as uuidv4 } from 'uuid';
import { QueryRunner, getRepository } from "typeorm";
import { Domain } from '../src/domain/entities/domain.entity';
import { Contentmd } from '../src/contentmd/entities/contentmd.entity';
// import { Promotion } from '../src/promotion/entities/promotion.entity';
import { domains } from './seeds/contentmd-promotion.seed';  /* domain seed data */
import { contentmds } from './seeds/contentmd-promotion.seed';  /* domain seed data */

describe('Contentmd Promotion Module (e2e)', () => {
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
  // Seed the database with initial domains and content data
  // ************************************************************* */
  
  // TEST #0a 
  it('0a- Seed the database with required domains ', () => {

      let testValue = "not a test; used to seed DB with test domains";

      getRepository(Domain)
      .createQueryBuilder("domain")
      .insert()
      .into(Domain)
      .values(domains)
      .execute();

      return expect(testValue).toEqual(testValue);
  });

  // TEST #0b 
  it('0b- Seed the content with required contentmd records ', () => {

    let testValue = "not a test; used to seed DB with contentmd records";

    getRepository(Contentmd)
    .createQueryBuilder("contentmd")
    .insert()
    .into(Contentmd)
    .values(contentmds)
    .execute();

    return expect(testValue).toEqual(testValue);
  });

  // TEST #1 
  it('01- Promote content from Dev domain to Test domain  ', () => {
    let expectedContentIdStrPattern = "Test";

    return request(app.getHttpServer())
      .post('/contentmd/1/promote?toDomain=Test')
      .expect(201)
      .then((res) => {
        const { content_id  } = res.body;
        expect(content_id).toEqual(expect.stringMatching(expectedContentIdStrPattern))
      })
  });

  // TEST #2 
  it('02- Promote content from Test domain to Staging domain  ', () => {
    let expectedContentIdStrPattern = "Staging";

    return request(app.getHttpServer())
      .post('/contentmd/2/promote?toDomain=Staging')
      // .expect(201)
      .then((res) => {
        console.log("This is response from test# 02")
        console.log(JSON.stringify(res.body,null,2))
        // const { content_id  } = res.body;
        // expect(content_id).toEqual(expect.stringMatching(expectedContentIdStrPattern))
      })
  });

//   // TEST #2 
//   it('02- Fails to create content metadata when domain does not exist  ', () => {
//     /* contruct modified instance with domain that does not exist */
//     let contentmdInstance2 = Object.assign(contentmdInstance1, { "domain_name": "doesNotExist" });
//     let expectedTitle = contentmdInstance2.title;
//     let expectedSlug  = contentmdInstance2.slug;
//     let expectedStrPattern = "not found";
    
//     return request(app.getHttpServer())
//       .post('/contentmd')
//       .send(contentmdInstance2)
//       .expect(404)
//       .then((res) => {
//         // console.log("RESPONSE INSTANCE 2")
//         // console.log(JSON.stringify(res.body,null,2))
//         expect(res.text).toEqual(expect.stringMatching(expectedStrPattern))
//       })
//   });

//   // TEST #3 
//   it('03- Fails to create a duplicate content metadata record ', () => {
//     /* contruct modified instance with slug that already exists */
//     let contentmdInstance3 = Object.assign(contentmdInstance1, { 
//       "slug": "/content-title-no1",
//       "domain_name": "default"
//     });
//     let expectedTitle = contentmdInstance3.title;
//     let expectedSlug  = contentmdInstance3.slug;
//     let expectedStrPattern = "already exists";
    
//     return request(app.getHttpServer())
//       .post('/contentmd')
//       .send(contentmdInstance3)
//       .expect(409)
//       .then((res) => {
//         expect(res.text).toEqual(expect.stringMatching(expectedStrPattern))
//       })
//   });

//   // TEST #4 
//   it('04- Creates same content as in test #3 in domain2  ', () => {
//     /* contruct modified instance to save in domain2 vs default domain */
//     let contentmdInstance3 = Object.assign(contentmdInstance1, { 
//       "slug": "/content-title-no1",
//       "domain_name": "domain2"
//     });
//     let expectedDomain = contentmdInstance3.domain_name;
    
//     return request(app.getHttpServer())
//       .post('/contentmd')
//       .send(contentmdInstance3)
//       .expect(201)
//       .then((res) => {
//         const { domain } = res.body;
//         // console.log("RESPONSE INSTANCE 3")
//         // console.log(JSON.stringify(res.body,null,2))
//         expect(domain.name).toEqual(expectedDomain);
//       })
//   });

//   // TEST #5 
//   it('05- Get content metadata by id and access images array', () => {
//     /* expected values */
//     let expectedStatus = 200;  
//     let expectedSlug  = '/content-title-no1';
//     let expectedImage1Src = '/blog/imag01';

//     return request(app.getHttpServer())
//       .get(`/contentmd/1`)
//       .expect(expectedStatus)
//       .expect(({ body }) => {
//         let imagesArray = JSON.parse(body.images);
//         let image1Src = imagesArray[0].src;
//         // console.log("Name of image 1 src url");
//         // console.log(image1Src);
//         expect(body.slug).toEqual(expectedSlug);
//         expect(image1Src).toEqual(expectedImage1Src);
//       })
//   });

//   // TEST #6 
//   it('06- Create second content metadata record in default domain  ', () => {
//      /* contruct modified instance with slug that already exists */
//      let contentmdInstance4 = Object.assign(contentmdInstance1, { 
//       "slug": "/content-title-no2",
//       "domain_name": "default",
//       "blog_url": "/blog/override2"
//     });
//     let expectedTitle = contentmdInstance4.title;
//     let expectedSlug  = contentmdInstance4.slug;

//     return request(app.getHttpServer())
//       .post('/contentmd')
//       .send(contentmdInstance4)
//       .expect(201)
//       .then((res) => {
//         // console.log("RESPONSE  ")
//         // console.log(JSON.stringify(res.body,null,2))
//         const { id, title, slug  } = res.body;
//         // savedIds.push(id);
//         expect(id).toBeDefined();
//         expect(title).toEqual(expectedTitle);
//         expect(slug).toEqual(expectedSlug);
//       })
//   });

//   // TEST #7 
//   it('07- Get all content metadata for given domain_id', () => {
//   /* expected values */
//   let expectedStatus = 200;  
//   let expectedRecords = 2;

//   return request(app.getHttpServer())
//     .get(`/contentmd?acct_id=2&domain_id=1`)
//     .expect(expectedStatus)
//     .expect(({ body }) => {
//       expect(body.length).toBe(expectedRecords);
//     })
//   });

//   // TEST #8 
//   it('08- Update content_id and title on single contentmd record ', () => {
//   /* expected values */
//   let expectedStatus = 200;  /* 409 = Conflict Exception */

//   /* Request object used for update  */
//   let contentmdChange = {                    
//     "content_id": "acctname1/domainname11",
//     "title": "content title no11"
//   }
//   return request(app.getHttpServer())
//     .patch(`/contentmd/1`)
//     .send(contentmdChange)
//     .expect(expectedStatus)
//     .then((res) => {
//       let updatedContentmd = res.body;
//       expect(updatedContentmd.content_id).toEqual(contentmdChange.content_id);
//       expect(updatedContentmd.title).toEqual(contentmdChange.title);
//     })
//   });

//   // TEST #9 
//   it('09- Delete single contentmd record ', () => {

//     /* input; contentmd.id */
//     let id = 2;

//     /* expected values */
//     let expectedStatus = 200;  
//     let expectedTitle = "content title no1";

//     return request(app.getHttpServer())
//       .delete(`/contentmd/2`)
//       .expect(expectedStatus)
//       .then((res) => {
//         let deletedResource = res.body;
//         expect(deletedResource.title).toEqual(expectedTitle);
//       })
//   });

//   // TEST #10 
//   it('10- Get all content metadata from domain with no content', () => {
//     /* expected values */
//     let expectedStatus = 200;  
//     let expectedRecords = 0;
//     let domainName = 'emptydomain';
  
//     return request(app.getHttpServer())
//       .get(`/contentmd?domainName=${domainName}`)
//       .expect(expectedStatus)
//       .expect(({ body }) => {
//         expect(body.length).toBe(expectedRecords);
//       })
//     });
// });
});