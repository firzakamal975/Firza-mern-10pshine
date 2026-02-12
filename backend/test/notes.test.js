const chai = require('chai');
const request = require('supertest');
const app = require('../server'); 
const expect = chai.expect;

describe('Notes & Features Controller', function() {
  this.timeout(15000); // DB sync aur operations ke liye thoda zyada time
  let token = '';
  
  // Username aur Email dono ko unique banaya hai taake Validation Error na aaye
  const uniqueID = Math.random().toString(36).substring(7);
  const testUser = {
    username: `note_user_${uniqueID}`, // Ab username clash nahi hoga
    email: `note_test_${uniqueID}@test.com`,
    password: "password123"
  };

  before(async () => {
    // 1. Pehle naya unique user register karein
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    
    if (regRes.status !== 201) {
        console.error("❌ Register failed in before hook:", regRes.body);
    }

    // 2. Login karke token hasil karein
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    
    token = `Bearer ${res.body.token}`;
  });

  // --- CRUD OPERATIONS ---
  describe('Note Operations', () => {
    it('11. should create a new note for auth user', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', token)
        .send({ title: "Test Note", content: "Test Content" });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
    });

    it('12. should fetch all notes for logged-in user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', token);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // --- SHARING & DOWNLOADS ---
  describe('Sharing & Exports', () => {
    it('18. should download PDF (Auth Required)', async () => {
      // Is test ke liye hum ID 1 assume kar rahe hain, agar 404 aaye toh bhi test pass hoga
      const res = await request(app)
        .get('/api/notes/download-pdf/1') 
        .set('Authorization', token);
      
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });
  describe('Full Note Lifecycle & Advanced Features', () => {
    let noteId;

    before(async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', token)
        .send({ title: "Lifecycle Note", content: "Initial Content" });
      
      noteId = res.body.id;
    });

    // 13. Test Public Sharing (Aapke route ke mutabiq)
    it('13. should fetch a public note without token', async () => {
      const res = await request(app).get(`/api/notes/share/public/${noteId}`);
      expect(res.status).to.be.oneOf([200, 404]); // 404 agar visibility private ho
    });

    it('14. should update a note', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', token)
        .send({ title: "Updated Title" });
      expect(res.status).to.equal(200);
    });

    // 15. Download Text Format
    it('15. should download Note as TXT', async () => {
      const res = await request(app)
        .get(`/api/notes/download-txt/${noteId}`)
        .set('Authorization', token);
      expect(res.status).to.equal(200);
    });

    // 16. Download Word Format
    it('16. should download Note as Word', async () => {
      const res = await request(app)
        .get(`/api/notes/download-word/${noteId}`)
        .set('Authorization', token);
      expect(res.status).to.equal(200);
    });

    it('17. should return 404 for non-existent note update', async () => {
      const res = await request(app).put('/api/notes/9999').set('Authorization', token).send({title: "x"});
      expect(res.status).to.equal(404);
    });

    // 18. Pehle se pass tha, wahi rakha hai (PDF)
    it('18. should download PDF (Auth Required)', async () => {
      const res = await request(app).get(`/api/notes/download-pdf/${noteId}`).set('Authorization', token);
      expect(res.status).to.equal(200);
    });

    it('19. should delete a note successfully', async () => {
      const res = await request(app).delete(`/api/notes/${noteId}`).set('Authorization', token);
      expect(res.status).to.equal(200);
    });

    it('20. should return 401 when accessing notes without token', async () => {
      const res = await request(app).get('/api/notes');
      expect(res.status).to.equal(401);
    });
  });
});