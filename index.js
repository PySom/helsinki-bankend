const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
//register morgan
const morgan = require('morgan')
//make custom token called body
morgan.token('body', (request, _) => {
    if(request.method === "POST"){
        return JSON.stringify(request.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


// morgan(':method :url :status :res[content-length] ')

let persons = [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
  ]

app.get('/info', (request, response) => {
    const message = `<p>Phonebook has a info of ${persons.length} people</p>
                    <p>${new Date()}</p>`
    response.send(message)
})

//api related 
const apiBase = '/api/persons/'
/*API routes*/
//get all person
app.get(`${apiBase}`, (request, response) => {
    response.json(persons)
}) 

//get a single person
app.get(`${apiBase}:id`, (request, response) => {
    const id = Number(request.params.id)
    const person = findPerson(id, persons);
    if(!person){
        return response.status(404).end()
    }
    response.json(person)
})

//delete a single user
app.delete(`${apiBase}:id`, (request, response) => {
    const id = Number(request.params.id)
    const person = findPerson(id, persons);
    if(!person){
        return response.status(404).end()
    }
    persons = persons.filter(p => p.id !== id);
    response.status(204).end()
})

//create a person
app.post(`${apiBase}`, (request, response) => {
    const body = request.body
    const isValidResponse = validatePerson(body, persons)
    if(!isValidResponse.success){
        return response.status(400).json({
            'error': isValidResponse.message
        })
    }
    const newPerson = createPerson(body)
    persons = persons.concat(newPerson)
    response.json(newPerson)
})

/*Helper functions*/
//find a person
const findPerson = (id, persons) => persons.find(p => p.id === id);
//random number generator
const generateRandomNumber = () =>{
    const UPPER_LIMIT = 10242048
    const id = Math.floor(Math.random() * UPPER_LIMIT)
    return id;
}
//create a person
const createPerson = (personObject) => ({
    "name": personObject.name,
    "number": personObject.number,
    "id": generateRandomNumber()
})
//validate person
const validatePerson = (personObject, persons) => {
    const empty = () => {
        const a = stringIsUndefined(personObject.name)
        const b = stringIsUndefined(personObject.number)
        console.log(personObject.number)
        console.log("name undefined", a)
        console.log("number undefined", b)
        return a || b;

    }
    const existsInPersons = () =>
    {
        const personIsNotNull = !stringIsUndefined(personObject.name)
        const personExist = !(!(persons.find(p => p.name === personObject.name)))
        console.log("Person not null: ", personIsNotNull, "Person exist: ", personExist)
        return personIsNotNull && personExist
    }
    //check if the values are empty
    if(empty()){
        console.log("I was at least empty")
        //get an appropriate response
        let culprit = "";
            culprit += stringIsUndefined(personObject.name)
                        ? "name"
                        : ""
            culprit += stringIsUndefined(personObject.number)
                        ? culprit.length > 0
                            ? " and number"
                            : "number"
                        : ""
            const verb = culprit.length > 0 
                            ? culprit.length < 7
                                ? "is"
                                : "are"
                            : ""
            culprit += ` ${verb} not meant to be empty`
        //check if the person is already in our data
        if(existsInPersons()){
            culprit += " and name must be unique"
            
        }
        return {
            success: false,
            message: culprit
        }
    }

    else if(existsInPersons()){
        console.log("not cool")
        return {
            success: false,
            message: "name must be unique"
        }
    }
    return {success: true}   
}


const PORT = 3001
const stringIsUndefined = (param) =>  !(!!param && !!param.trim())

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})
