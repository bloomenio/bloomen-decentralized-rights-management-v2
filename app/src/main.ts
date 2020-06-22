/*
 * Entry point of the application.
 * Only platform bootstrapping code should be here.
 * For app-specific initialization, use `app/app.component.ts`.
 */

import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { environment } from '@env/environment';

// import * as basicAuth from 'express-basic-auth';
// import * as app from 'express';
//
// app.use(basicAuth({
//   users: { bloomen: 'secret' },
//   challenge: true,
// }), (req: basicAuth.IBasicAuthedRequest, res, next) => {
//   res.end(`Welcome ${req.auth.user} (your password is ${req.auth.password})`);
//   next();
// });



// const express = require('express');
// const app = express();
// const basicAuth = require('express-basic-auth');

// app.use(basicAuth(options), (req: basicAuth.IBasicAuthedRequest, res, next) => {
//   res.end(`Welcome ${req.auth.user} (your password is ${req.auth.password})`);
//   next();
// });

// basicAuth({
//   authorizeAsync: true,
//   authorizer: (user, password, authorize) => authorize(null, password === 'secret'),
//   challenge: true
// });


// basicAuth({
//   users: { bloomen: 'secret' },
//   challenge: true,
// });

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
