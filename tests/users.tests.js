const request = require("supertest");
const app = require("../index");

const token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOlt7ImlkIjoyMywiZW1haWxfaWQiOiJkaXZ5YW5zaGlAZ2ttaXQuY28iLCJ1c2VyX3B3ZCI6IiQyYiQxMSQuV29vSEV2MkhDVVlDaExlL2JGLzJlNzR6YXRLcWhwQ0ExZ2VXamQuUU9NRGd3eFdKZUpEQyJ9XSwiaWF0IjoxNjY3NDc4OTI3LCJleHAiOjE2Njc0ODI1Mjd9.YbSPgrTBXDmyjDS_tBUn1YwSLrObORPVmBuZyr2nqRg";

let id = 16;

describe('housing-society get user by Id', () => {
    it('GET /api/users/:id for response 200 OK', async() => {
        const response = await request(app)
        .get(`/api/users/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(200)
        .then((response) => {
            expect({
                
                    "response": [
                        {
                            "id": 16,
                            "first_name": "test",
                            "last_name": "test",
                            "contact_number": "0000000000",
                            "email_id": "test@gamil.com"
                        }
                    ]
                
            })
        })
    })


    it('GET /api/users/:id for response 401 unautherized', async () => {
        const response = await request(app)
        .get(`/api/users/${id}`)
        .expect(401)
        .then((response) => {
            expect({
                message: "Access denied"
            })
        })
    })
    it("GET /api/users/:id for response 498 invalid token", async () => {
        const response = await request(app)
        .get(`/api/users/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(498)
        .then((response) => {
            expect({
                message: "Invalid token"
            })
        })
    })

    it("GET /api/users/:id for response 404 Not found", async () => {
        const response = await request(app)
        .get(`/api/users/${id}`)  //If pass wrong Id
        .auth(token, {type: 'bearer'})
        .expect(404)
        .then((response) => {
            expect({
                success : 1
            })
        })
    })
});

describe('housing-society delete user by Id', () => {
    it('DELETE /api/users/:id for response 202 OK', async() => {
        const response = await request(app)
        .delete(`/api/users/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(202)
        .then((response) => {
            expect({
                
                    message: "Successfully deleted" 
                
            })
        })
    })


    it('DELETE /api/users/:id for response 401 unautherized', async () => {
        const response = await request(app)
        .delete(`/api/users/${id}`)
        .expect(401)
        .then((response) => {
            expect({
                message: "Access denied"
            })
        })
    })
    it("DELETE /api/users/:id for response 498 invalid token", async () => {
        const response = await request(app)
        .delete(`/api/users/${id}`)
        .auth(token, {type: 'bearer'})
        .expect(498)
        .then((response) => {
            expect({
                message: "Invalid token"
            })
        })
    })

    it("DELETE /api/users/:id for response 404 Not found", async () => {
        const response = await request(app)
        .get(`/api/users/${id}`)  //If pass wrong Id
        .auth(token, {type: 'bearer'})
        .expect(404)
        .then((response) => {
            expect({
                success : 1
            })
        })
    })
});

describe('housing-society create user', () => {
    it('POST /api/users for response 201 created', async() => {
        const response = await request(app)
        .post(`/api/users`)
        .auth(token, {type: 'bearer'})
        .send({
            "first_name": 4,
            "last_name": "test",
            "contact_number": "000000000",
            "email_id": "test@test.co",
            "pwd": "0000"
        })
        .expect(201)
        .then((response) => {
            expect({
                
                "Response": [
                    {
                        "id": 22,
                        "first_name": "4",
                        "last_name": "test",
                        "contact_number": "000000000",
                        "email_id": "test@test.co"
                    }
                ] 
                
            })
        })
    })


    it('POST /api/users for response 409 conflict', async () => {
        const response = await request(app)
        .post(`/api/users`)
        .expect(409)
        .then((response) => {
            expect({
                message: "User with this email/contact number already exist."
            })
        })
    })
    it("POST /api/users for response 498 invalid token", async () => {
        const response = await request(app)
        .post(`/api/users`)
        .auth(token, {type: 'bearer'})
        .expect(498)
        .then((response) => {
            expect({
                message: "Invalid token"
            })
        })
    })

    it('POST /api/users for response 401 unautherized', async () => {
        const response = await request(app)
        .post(`/api/users`)
        .expect(401)
        .then((response) => {
            expect({
                message: "Access denied"
            })
        })
    })
});