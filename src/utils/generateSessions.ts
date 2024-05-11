import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { UserAction, UserSession } from "../models/userSession";
import { randomDate, randomName } from "./randomUtils";

const stateFilePath = path.join(__dirname, "..", "data", "state.json");
let state: { lastUserId: number; lastSessionId: number };
const actionProbabilities: { [key in UserAction]: number } = {
  [UserAction.LOGIN]: 0,
  [UserAction.VIEW_PRODUCT_LIST]: 0.3,
  [UserAction.VIEW_PRODUCT_DETAILS]: 0.25,
  [UserAction.ADD_PRODUCT_TO_CART]: 0.15,
  [UserAction.VIEW_CART]: 0.1,
  [UserAction.UPDATE_CART]: 0.05,
  [UserAction.REMOVE_PRODUCT_FROM_CART]: 0.05,
  [UserAction.CHECKOUT]: 0.15,
  [UserAction.SEARCH_PRODUCT]: 0.2,
  [UserAction.APPLY_FILTER]: 0.15,
  [UserAction.VIEW_ORDER_HISTORY]: 0.05,
  [UserAction.VIEW_ORDER_DETAILS]: 0.05,
  [UserAction.RATE_PRODUCT]: 0.05,
  [UserAction.ADD_PRODUCT_REVIEW]: 0.05,
  [UserAction.LOGOUT]: 0,
};
const loadState = () => {
  if (fs.existsSync(stateFilePath)) {
    state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
  } else {
    state = { lastUserId: 0, lastSessionId: 10000 };
  }
};

const saveState = () => {
  fs.writeFileSync(stateFilePath, JSON.stringify(state), "utf-8");
};

const selectAction = (): UserAction => {
  const randomNumber = Math.random();
  let cumulativeProbability = 0;

  for (const action of Object.keys(actionProbabilities)) {
    cumulativeProbability += actionProbabilities[action as UserAction];
    if (randomNumber <= cumulativeProbability) {
      return action as UserAction;
    }
  }

  return Object.keys(actionProbabilities)[
    Object.keys(actionProbabilities).length - 1
  ] as UserAction;
};

const generateSession = (): UserSession[] => {
  const userName = randomName();
  const sessionStart = new Date();
  const sessionEnd = new Date(sessionStart.getTime() + 15 * 60000);

  const sessions: UserSession[] = [];
  const userId = ++state.lastUserId;
  const sessionId = ++state.lastSessionId;

  sessions.push({
    userId,
    userName,
    sessionId,
    actionName: UserAction.LOGIN,
    actionTime: sessionStart.toISOString(),
  });

  const actionsCount = Math.floor(Math.random() * 20) + 1;
  for (let i = 0; i < actionsCount; i++) {
    sessions.push({
      userId,
      userName,
      sessionId,
      actionName: selectAction(),
      actionTime: randomDate(sessionStart, sessionEnd).toISOString(),
    });
  }

  sessions.push({
    userId,
    userName,
    sessionId,
    actionName: UserAction.LOGOUT,
    actionTime: sessionEnd.toISOString(),
  });

  return sessions;
};

const generateAndSaveSessions = async (numberOfUsers: number) => {
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  loadState();

  const sessions: UserSession[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    sessions.push(...generateSession());
  }

  const jsonFilePath = path.join(dataDir, "sessions.json");
  fs.writeFileSync(jsonFilePath, JSON.stringify(sessions, null, 2), "utf-8");

  saveState();

  const csvWriter = createObjectCsvWriter({
    path: path.join(dataDir, "sessions.csv"),
    header: [
      { id: "userId", title: "UserID" },
      { id: "userName", title: "UserName" },
      { id: "sessionId", title: "SessionID" },
      { id: "actionName", title: "ActionName" },
      { id: "actionTime", title: "ActionTime" },
    ],
    append: true,
  });

  await csvWriter.writeRecords(sessions);
};

export { generateAndSaveSessions };
