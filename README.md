<h2 align="center"><b><a href="https://xamify.herokuapp.com/api/ping">XAMFIY API</a></b></h2>

<h4 align="center">Node/Express based REST API for Xamify Frontends</h4>

<br>
<hr>
<br>

## Stack

- NodeJs 
- Express
- Prisma 2 (ORM)
- Heroku (Deployment)

<br>

## Description
NodeJS backend service for the Xamify project developed for the [HackNPitch](https://juesummit2021.herokuapp.com/hacknpitch) Hackathon 2021.
<br>

## Frontends

This API is consumed by our two React/Axios frontends:
- Teachers Dashboard ([GitHub](https://github.com/homeboy445/xamify-teacher))
- Student Dashboard  ([GitHub](https://github.com/homeboy445/xamify))

<br>

## PDF Generator

PDFs are generated on request for the submissions created by students. For this we off-loaded the task of PDF generation to a Node based serverless function deployed on vercel serverless function!

[PDF Generator GitHub Repo](https://github.com/ujjawal-shrivastava/xamify-pdf-generator)
<br>

## Local Development


#### Clone the repo
``` git clone https://github.com/ujjawal-shrivastava/xamify-api.git```

#### Change the working directory
```cd xamify-api```

#### Install the node packages
```npm install```

#### Create a .env file and put all the required environment variables mentioned in ```.env.exampe```
#### Start the development server
```npm run dev```


<br>

## Routes

The base route for the API is ```/api/```

Ping ```/api/ping```

Login ```/api/auth/login```

Current User ```/api/auth/me```

CRUD Routes (```GET, POST, PATCH, DELETE```)

Teachers ```/api/teachers```

Students ```/api/students```

Assignments ```/api/assignments```

Questions ```/api/questions```

Choices ```/api/choices```

Years ```/api/years```

Courses ```/api/courses```

Subjects ```/api/subjects```



<br>

## Issues?
Let us know by creating an issue!
<br>