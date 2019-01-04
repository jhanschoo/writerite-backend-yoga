# @writerite/backend-yoga

1. `prisma deploy`
2. `yarn start`

## Notes

### Web server -- bot communication

* Messages sent from web server to room bot due to user input
  is latency-critical and not recorded, so they should be via redis.
* Messages sent from bot are typically recorded as part of the
  room conversation: these are not latency-critical and use GQL API
  calls.