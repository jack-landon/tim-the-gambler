import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  settings,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import { solanaPlugin } from "@elizaos/plugin-solana";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { startChat } from "./chat/index.ts";
import { initializeClients } from "./clients/index.ts";
import {
  getTokenForProvider,
  loadCharacters,
  parseArguments,
} from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";
import { getCryptoNews } from "./actions/getCryptoNews.ts";
import { initializeCryptoNewsTweets } from "./actions/initializeCryptoNewsTweets.ts";
import { initializePolymarketBet } from "./actions/initializePolymarketBet.ts";
import { Scraper } from "agent-twitter-client";
import { Wallet } from "ethers";
import { AssetType, ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import { generatePolymarketBetImage } from "./actions/generatePolymarketBetImage.ts";
import {
  loadScraperSession,
  saveScraperSession,
} from "./actions/twitterSession.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name
  );

  nodePlugin ??= createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
      // twitterPlugin,
    ].filter(Boolean),
    providers: [],
    actions: [getCryptoNews],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(__dirname, "../data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);

    await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    const scraper = new Scraper();
    globalScraper = scraper;

    const sessionPath = path.join(
      __dirname,
      `../data/scraper-session-${process.env.TWITTER_USERNAME}.json`
    );
    const sessionLoaded = await loadScraperSession(scraper, sessionPath);

    if (!sessionLoaded) {
      // If no session or session failed to load, login normally
      console.log("Logging into Scraper Twitter...");
      await scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_SECRET
      );

      // Save the new session
      await saveScraperSession(scraper, sessionPath);
    } else {
      console.log("Scraper: Using existing Twitter session");
    }

    // Test if the session is still valid
    try {
      const profile = await scraper.getProfile(
        process.env.TWITTER_USERNAME as string
      );
      if (!profile) {
        throw new Error("Session validation failed");
      }
      console.log("Scraper Twitter session validated successfully");
    } catch (error) {
      console.warn("Scraper Existing session invalid, logging in again...");
      await scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_SECRET
      );
      await saveScraperSession(scraper, sessionPath);
    }

    // Initialize the polymarket clob client
    let clobClient = new ClobClient(
      "https://clob.polymarket.com", // host
      137, // chainId (e.g., 137 for Polygon Mainnet)
      new Wallet(process.env.EVM_PRIVATE_KEY as string),
      {
        key: process.env.POLYMARKET_API_KEY,
        secret: process.env.POLYMARKET_API_SECRET,
        passphrase: process.env.POLYMARKET_API_PASSPHRASE,
      },
      SignatureType.POLY_GNOSIS_SAFE,
      process.env.POLYMARKET_PROXY_ADDRESS
    );

    // const apiKey = await clobClient.createOrDeriveApiKey();
    // console.log("Polymarket API Key created:", apiKey);

    const clobBalance = await clobClient.getBalanceAllowance({
      asset_type: AssetType.COLLATERAL,
    });

    const polymarketBalance = clobBalance.balance; // 6 decimals, i.e. 100000 = 1.0 USDC
    console.log(`Polymarket balance: ${polymarketBalance} USDC`);

    initializeCryptoNewsTweets(runtime, scraper);
    // initializePolymarketBet(runtime, clobClient, scraper);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error
    );
    console.error(error);
    throw error;
  }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
};

const startAgents = async () => {
  // return await runTestGeneratePolymarketBetImage();

  const directClient = new DirectClient();
  let serverPort = parseInt(settings.SERVER_PORT || "3000");
  const args = parseArguments();

  let charactersArg = args.characters || args.character;
  let characters = [character];

  if (charactersArg) {
    characters = await loadCharacters(charactersArg);
  }

  try {
    for (const character of characters) {
      await startAgent(character, directClient as DirectClient);
    }
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
  }

  while (!(await checkPortAvailable(serverPort))) {
    elizaLogger.warn(`Port ${serverPort} is in use, trying ${serverPort + 1}`);
    serverPort++;
  }

  // upload some agent functionality into directClient
  directClient.startAgent = async (character: Character) => {
    // wrap it so we don't have to inject directClient later
    return startAgent(character, directClient);
  };

  directClient.start(serverPort);

  if (serverPort !== parseInt(settings.SERVER_PORT || "3000")) {
    elizaLogger.log(`Server started on alternate port ${serverPort}`);
  }

  const isDaemonProcess = process.env.DAEMON_PROCESS === "true";
  if (!isDaemonProcess) {
    elizaLogger.log("Chat started. Type 'exit' to quit.");
    const chat = startChat(characters);
    chat();
  }
};

let globalScraper: Scraper | null = null;
const sessionPath = path.join(
  __dirname,
  `../data/scraper-session-${process.env.TWITTER_USERNAME}.json`
);

// Save session on process exit
process.on("SIGINT", async () => {
  elizaLogger.log("Shutting down gracefully...");
  if (globalScraper) {
    await saveScraperSession(globalScraper, sessionPath);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  elizaLogger.log("Shutting down gracefully...");
  if (globalScraper) {
    await saveScraperSession(globalScraper, sessionPath);
  }
  process.exit(0);
});

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1);
});

async function runTestGeneratePolymarketBetImage() {
  await generatePolymarketBetImage({
    avgPrice: "0.5",
    betAmount: "100",
    title: "Will ElizaOS win the next AI award?",
    imageUrl:
      "https://polymarket-upload.s3.us-east-2.amazonaws.com/NBA+Team+Logos/IND.png",
    outcome: "Yes",
    toWinAmount: "100",
  });
}
