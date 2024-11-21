## 🪿 HONC Webhook (customer.io)

This is a project created with the `create-honc-app` template. It is an example how to develop webhooks using Fiberplane studio.

In this example a customer.io webhook calls the application `api/signups` endpoint. It stores the information in a Neon Database and send a message to a Slack channel. 

So in order to make this project run, make sure that you have an account set-up for: 
- [Neon](https://neon.tech/)
- Slack Account to set up a [Slack App](https://api.slack.com/messaging/webhooks)
- [Customer.io](https://customer.io/)


Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` key and value. 

For Slack set the `SLACK_URL` from your Slack App to receive requests. 

And finally set a `ADMIN` and `USERNAME` to secure your application endpoint.

(see: `.dev.vars.example`).


### Commands

To set up the database run: 
```sh
npm run db:generate
npm run db:migrate
```


Run the development server:

```sh
npm run dev
```

Start in a seperate Terminal Fiberplane
```sh
npx @fiberplane/studio@latest
```

### Developing
1. In the Fiberplane studio enable the Proxy feature. 
2. Go to customer.io and create a workflow and in the workflow create a webhook activity
3. Configure the webhook with the proxy URL from Fiberplane
4. Set the Header to `X-Custom-Auth` and create a value for it
```sh
echo -n "yourUsername:yourPassword" | base64
```
5. Make sure to provide in the JSON a name, email and github handle using Liquid
6. Send some test data from customer.io


### Deploying

Set your secrets from the dev.vars file with wrangler:

```sh
npx wrangler secret put DATABASE_URL
```


Deploy with wrangler:

```sh
npm run deploy
```