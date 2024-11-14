// Creating hybrid api -> mean if mobile user,ALEXA etc. interact with our api then get data json data . And if browser interact with our api then get html document
const express = require("express")
const data = require("./MOCK_DATA.json")
const fs = require("fs")
app = express()

//Middleware 1 -> assume it as a plugin
app.use(express.urlencoded({extended:false})) // it is using because it takes the body as input from postman and convert it into object and store in req.body

//Middleware 2
app.use((req,res,next)=>{
    // return res.send("Middlware 2") // end the response 
    next() // sending the request to next middlware
})

//Middleware 3
app.use((req,res,next)=>{
    req.Degree = "B.tech(cse)" // making changes in the request
    next() // request to the next middleware
})

//Middleware 4
app.use((req,res,next)=>{
    fs.appendFile("log.txt" , `\n ${Date.now()} : ${req.method} : ${req.url}` , (err,result)=>{ //appending information into the log.txt file by the help of middleware
        next() // request sends to the routes
    })
})


// Creating routes
// this will end response with  only user names in html format
app.get ("/users" , (req,res)=>{  
    const html =`
    <ul>
        ${data.map((user)=>`<li>${user.first_name}</li>`).join("")} 
    </ul>
    `
   return res.send(html) // sending html document
})
// This will print all the data in MOCK_DATA.json file
app.get("/api/users" ,(req,res)=>{   
    console.log(req.Degree) // checking property set in the middleware
    res.setHeader("Myname" , "Roni vats") // Setting response headers
    console.log(req.headers)//printing request headers has been set in body during sending the request
    return res.json(data) // sending data in json format
})
// firstly .get will print the users according to the id will be given in browser search bar
// Note-> Here we have used app.route() -> which can be use when path is same for http request methods or we can write seprate to each http request method
app.route("/api/users/:id")
.get((req,res)=>{
    const id = Number(req.params.id)
    const userData = data.find(user => user.id === id) //find function when condition matches return that array object
    if(!userData){res.status(404).json({msg:"user Not found!"})} // 404-> status code -> refresent user not found
    return res.json(userData)
})
.patch((req,res)=>{ // To update the details of user in file
    const userData = req.body
    const userID = Number(req.params.id)
    const user = data.find(users => users.id === userID)
    for(let value in userData){
         user[value] = userData[value]
    }
    data.splice(data.indexOf(user),1,user)
    fs.writeFile("./MOCK_DATA.json" , JSON.stringify(data),(err,result)=>{
        return res.send("Information updated successfully")
    })
})
.delete( (req,res)=>{ // To delete the user from MOCK_DATA.json file
    const userID = Number(req.params.id)
    const user = data.find(users => users.id === userID)
    data.splice(data.indexOf(user),1)
    fs.writeFile("./MOCK_DATA.json" , JSON.stringify(data) , (err,result)=>{
        return res.send("user successfully deleted")
    })
})

// Creating post route to store new user information in the MOCK_DATA.json file
// NOte-> New user information will be send from the Postman application. In the body section key value pairs will be written
app.post("/api/users",(req,res)=>{
    //creating new user
    const body = req.body
    if(!body || !body.first_name || !body.last_name || !body.email || !body.job_title || !body.gender || !body.id){
        return res.status(400).json({msg:"Bad request!  All fields are required"}) // 400 -> status code for error information is not complete
    }
    data.push({...body, id: data.length+1}) // in this we are pushing  body object with id in data array-> id is because from postman we can'nt take/fetch id
fs.writeFile("./MOCK_DATA.json" , JSON.stringify(data),(err,result)=>{
    return res.status(201).json({status:"successful" , id : data.length}) // sending status code 201 for user created
})
})


app.listen(8000,()=>{
    console.log("Server started")
})


// Note-: Here in all routes path is same so we can create a  route for this path to all requests(patch,delete,get) having this same path
// app.get("/api/users/:id",(req,res)=>{
//     const id = Number(req.params.id)
//     const userData = data.find(user => user.id === id) //find function when condition matches return that array object
//     return res.json(userData)
// })
// app.patch("/api/users/:id",(req,res)=>{
//     // Edit user info by id
//     return res.send("Hey You are editing profile.")
// })

// app.delete("/api/users/:id",(req,res)=>{
//     //Delete user by id
//     return res.send("You have deleted profile")
// })