const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`listen server from port: ${port}`);
});
