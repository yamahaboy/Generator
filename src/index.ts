import { generateAndSaveSessions } from "./utils/generateSessions";
//Change count of user generation
const numberOfUsers = 100;

generateAndSaveSessions(numberOfUsers)
  .then(() => console.log("Sessions generated successfully."))
  .catch((error) => console.error("Error generating sessions:", error));
