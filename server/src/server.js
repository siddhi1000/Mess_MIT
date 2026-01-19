const app = require("./app");

const port = process.env.PORT || 4000;

app.listen(port, () => {
  process.stdout.write(`Server listening on port ${port}\n`);
});

