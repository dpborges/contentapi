import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Before this test, and any other test in this file,  the database will be delete
  // If you repeat this test below, it will still run successfully because each
  // test will start with a clean database.
  it('handles a signup request', () => {
    const testEmail = 'user6@foo.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({email: testEmail, password: 'user4password'})
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testEmail);
      })
  });

  // Note, when we signup, we expect to get a cookie back. Unfortunately, superagent 
  // (which issues request), does not handle cookies by default. Therefore, we 
  // need to save that cookie in the context of our test, and send it off with the
  // our follow up request.
  it('signup as new user, then get the currently logged in user', async () => {
    const email = 'user7@foo.com';
    // capture response in variable
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({email, password: 'user7password'})
      .expect(201)

    // get access to the cookie , which is the header of the response
    const cookie = res.get('Set-Cookie');

    // Make whoami request and destructure the body property from the response
    // The body shoud have and id and an email
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)  // sets cookie header in the outgoing request
      .expect(200);
    
    expect(body.email).toEqual(email);

  });


});
