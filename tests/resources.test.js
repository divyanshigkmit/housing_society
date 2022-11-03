const request = require("supertest");
const app = require("../index");

const token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOlt7ImVtYWlsX2lkIjoiaGVsbG90aGVyZUBna21pdC5jbyIsInVzZXJfcHdkIjoiJDJiJDExJGlLNkplQ0xPa1RqaXdBZkViVjZDY2VCdGRlNTN3ek1WTTQ4TmE5bkVrdzY0WnlsMFFIQ1pDIn1dLCJpYXQiOjE2Njc0MzQ5NDgsImV4cCI6MTY2NzQzODU0OH0.eW61ZmBGfEqfF_dT9HZDjv-3yZwqGOdHY_2fNh0BJsA";
const id = 15;


describe('housing-society get resource by Id', () => {
    it('GET /api/resources/:id for response 200 OK', async() => {
        const response = await request(app)
        .get(`/api/resources/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(200)
        .then((response) => {
            expect({ 
                "response": [
                    {
                        "id": 15,
                        "name": "Swimming Pool",
                        "status": 0
                    }
                ]  
            })
        })
    })


    it('GET /api/users/:id for response 401 unautherized', async () => {
        const response = await request(app)
        .get(`/api/resources/${id}`)
        .expect(401)
        .then((response) => {
            expect({
                message: "Access denied"
            })
        })
    })
    it("GET /api/resources/:id for response 498 invalid token", async () => {
        const response = await request(app)
        .get(`/api/resources/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(498)
        .then((response) => {
            expect({
                message: "Invalid token"
            })
        })
    })

    it("GET /api/resources/:id for response 404 Not found", async () => {
        const response = await request(app)
        .get(`/api/resources/${id}`)  //If pass wrong Id
        .auth(token, {type: 'bearer'})
        .expect(404)
        .then((response) => {
            expect({
                message : 1
            })
        })
    })
});

