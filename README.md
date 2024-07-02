# Honc Honc!

![Honc](honc.png)

## Quickstart

This is a template of a HONC project, which uses:

- **Hono** as an api framework
- **Neon** for a relational database
- **Drizzle** as the ORM and migrations manager
- **Cloudflare** Workers for deployment hosting

Use this template as follows:

```sh
# You can also use `yarn create`, `pnpm create`, or `bun create`
npm create cloudflare@latest -- --template=git@github.com:fiberplane/honc-template.git
```

You'll be prompted with three simple questions, and then a fresh HONC project will arrive in a new directory on your machine.

### Commands

To get started, install dependencies and run the development server:

```sh
npm install
npm run dev
```

Once you've set up a Neon database (see below), you can generate some migrations, apply them, and seed the database: 

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

If you're inclined to deploy the app to the wild wild internet, you can do so as follows (requires a Cloudflare account):

```sh
npm run deploy
```

## Configuring Neon

Install the Neon CLI and follow the script below (you'll need the `jq` command line utility). 

Alternatively, grab your connection string from the Neon dashboard and add it to a `.dev.vars` file in the root of the project under the key `DATABASE_URL`.

```sh
# Authenticate with neon cli
neonctl auth

# Create project if you haven't already
#
# > *skip this* if you already created a project,
# > and grab the DATABASE_URL from your dashboard
PROJECT_NAME=my-project
neonctl projects create --name $PROJECT_NAME --set-context

# Set project id because the call to `set-context` below needs it
PROJECT_ID=$(neonctl projects list --output=json | jq --arg name "$PROJECT_NAME" '.projects[] | select(.name == $name) | .id')

# Create a `dev` db branch then set context
BRANCH_NAME=dev
neonctl branches create --name=$BRANCH_NAME
neonctl set-context --project-id=$PROJECT_ID --branch=$BRANCH_NAME

# Finally, add connection string to .dev.vars
DATABASE_URL=$(neonctl connection-string)
echo -e '\nDATABASE_URL='$DATABASE_URL'\n' >> .dev.vars
```

This will create a `.neon` file, which is used by the `neonctl` command to know the proper context for running commands. 

This file can be kept in version control. From [the Neon docs](https://neon.tech/docs/reference/cli-set-context):

> **Neon does not save any confidential information to the context file (for example, auth tokens).** You can safely commit this file to your repository or share with others.