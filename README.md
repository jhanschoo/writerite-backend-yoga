# @writerite/backend-yoga

1. `prisma deploy`
2. `yarn start`

## Container

The following environment variables need to be set:

* `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google's OpenID Connect
* `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` from Facebook Login
* `RECAPTCHA_SECRET` from ReCAPTCHA
* `PRISMA_ENDPOINT` the uri describing the prisma backend.

The following environment variables may be set:

* `REDIS_HOST`, `REDIS_PORT` of a redis instance; the app uses dbs 1 and 2. Defaults to `127.0.0.1` and `6379` respectively.
* `CERT_FILE`, `KEY_FILE`; if both are present, the app serves as HTTPS and WSS.

## Notes

### Web server -- bot communication

* Messages sent from web server to room bot due to user input
  is latency-critical and not recorded, so they should be via redis.
* Messages sent from bot are typically recorded as part of the
  room conversation: these are not latency-critical and use GQL API
  calls.

## TODO

* Ensure image working
* Ensure image working with npm i --production
* ibid. with envvars
* ibid. with no local-production config