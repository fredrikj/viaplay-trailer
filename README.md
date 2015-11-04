# viaplay-trailer
Gives a URL to trailer at traileraddict.com for a movie at Viaplay.

## Setup

```bash
$ git clone https://github.com/fredrikj/viaplay-trailer.git
$ cd viaplay-trailer
$ npm install
$ npm test
$ npm start
```

Then go to <http://localhost:3000>, or even better - try some sample links:

<http://localhost:3000/trailer/film/the-internship-2013>

<http://localhost:3000/trailer/film/neighbors-2014>


## Background
It is implemented in Node.js with Express.

It is caching the link obtained from traileraddict.com in an in-memory cache, implemented in a hash.

It contains one feature/system test which uses nocker and supertest to simulate a real call to this app.
