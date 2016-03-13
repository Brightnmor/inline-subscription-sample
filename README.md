# Inline Subscription Sample

A simple, Heroku-deployable sample payments subscription page that uses paystack inline and nodejs.
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

To run on your system.
## Requirements

You need to have `Nodejs` installed > http://nodejs.com

## Setup

- Clone the repo
- install dependencies
- Create your `.env` file from the sample included
```bash
$ git clone https://github.com/PaystackHQ/inline-subscription-sample.git
$ cd inline-subscription-sample
$ npm install
$ mv .env.sample .env
```

- Edit the new `.env` file adding your paystack secret key
- Edit the `public/script.js` file, adding your paystack public key

## Running the sample

```bash
$ node .
```

Visit the homepage (should be http://localhost:5000) in your browser.

## Extras

- Includes a hack that uses Google's `libphonenumber` to verify phone number validity for region selected.
- Includes a javascript function that generates time-based reference numbers.
