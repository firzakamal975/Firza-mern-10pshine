const chai = require('chai');
const request = require('supertest');
const app = require('../server'); 
const expect = chai.expect;

describe('Auth Controller (Login/Signup/Password)', function() {
  this.timeout(15000);

  // Random ID generator taake har baar naya user banay
  const id = Math.random().toString(36).substring(7);
  const uniqueEmail = `user_${id}@test.com`;
  const uniqueUsername = `testuser_${id}`;

  describe('POST /api/auth/register', () => {
    it('1. should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: uniqueUsername,
        email: uniqueEmail,
        password: "password123"
      });
      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
    });

    it('2. should return 400 if user already exists', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: uniqueUsername,
        email: uniqueEmail,
        password: "password123"
      });
      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('3. should login user with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: uniqueEmail,
        password: "password123"
      });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('4. should return 404 if user not found', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: "nonexistent_user@test.com",
        password: "password123"
      });
      expect(res.status).to.equal(404);
    });
  });

  describe('Profile & Security', () => {
    let authToken = '';
    
    before(async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: uniqueEmail, 
        password: "password123"
      });
      authToken = `Bearer ${res.body.token}`;
    });

    it('5. should update user profile (username)', async () => {
      // Yahan username ko dynamic kiya hai taake Validation Error na aaye
      const newDynamicUsername = `updated_firza_${Math.random().toString(36).substring(5)}`;
      
      const res = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', authToken)
        .field('username', newDynamicUsername); 
      
      expect(res.status).to.equal(200);
    });

    it('6. should toggle 2FA', async () => {
      const res = await request(app)
        .put('/api/auth/toggle-2fa')
        .set('Authorization', authToken)
        .send({ twoFactorEnabled: true });
      
      expect(res.status).to.equal(200);
      expect(res.body.twoFactorEnabled).to.equal(true);
    });

    it('7. should return 404 for forgot-password with wrong email', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ 
        email: "not_in_db@test.com" 
      });
      expect(res.status).to.equal(404);
    });

    it('8. should return 400 for invalid reset token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/fake_token_123')
        .send({ password: "newpassword123" });
      expect(res.status).to.equal(400);
    });

    it('9. should delete user account', async () => {
      const res = await request(app)
        .delete('/api/auth/delete-account')
        .set('Authorization', authToken);
      
      expect(res.status).to.equal(200);
    });
  });
});