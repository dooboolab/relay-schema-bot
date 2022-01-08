import { Probot } from "probot";


export = (app: Probot) => {
  const SCHEMA_PATH = process.env.SCHEMA_PATH || 'schema.graphql';

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("push", async (context) => {
    const handlePush = async () => {
      if (context.payload.commits.filter(c => [...c.modified].filter(f => f.indexOf(SCHEMA_PATH) > -1).length > 0).length > 0) {
        console.log('SCHEMA FILE HAS CHANGED');

        // TODO: 1. GENERATE AND RUN RELAY SCHEMA
        // TODO: 2. OPEN PR WHEN THERE ARE FILE CHANGES
      }
    }

    app.log.info(context);
    handlePush();
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
