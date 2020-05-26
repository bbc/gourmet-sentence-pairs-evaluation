import * as express from 'express';
import { Router } from 'express';
import * as basicAuth from 'express-basic-auth';

const secureRouter: Router = Router();

// support parsing of application/x-www-form-urlencoded post data
secureRouter.use(express.urlencoded({ extended: true }));
// support parsing of application/json type post data
secureRouter.use(express.json());
// Serve static assets in the public folder
secureRouter.use(express.static('public'));

// Enable Log in
if (process.env.ENABLE_AUTH === 'true') {
  if (
    process.env.PASSWORD === undefined ||
    process.env.USERNAME === undefined
  ) {
    throw new Error(
      'Log in cannot be enabled on the tool unless a password and username are specified in the config.'
    );
  } else {
    secureRouter.use(
      basicAuth({
        users: { [process.env.USERNAME]: process.env.PASSWORD },
        challenge: true, // To show login UI
      })
    );
  }
}

export default secureRouter;
