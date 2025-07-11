import { generateText, IAgentRuntime, ModelClass } from "@elizaos/core";
import { Scraper } from "agent-twitter-client";
import schedule from "node-schedule";
import { Side, OrderType, ClobClient } from "@polymarket/clob-client";
import { SignedOrder } from "@polymarket/order-utils";
import { generatePolymarketBetImage } from "./generatePolymarketBetImage.ts";
import dayjs from "dayjs";

type PolymarketMarket = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string; // '["Yes", "No"]';
  outcomePrices?: string; // "[\"0\", \"0\"]";
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  enableOrderBook: boolean;
  orderPriceMinTickSize: number;
  orderMinSize: number;
  startDateIso: string;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  umaBond: string;
  umaReward: string;
  volume24hrAmm: number;
  volume1wkAmm: number;
  volume1moAmm: number;
  volume1yrAmm: number;
  volume24hrClob: number;
  volume1wkClob: number;
  volume1moClob: number;
  volume1yrClob: number;
  clobTokenIds: string; //"[\"5044658213116494392261893544497225363846217319105609804585534197935770239191\", \"107816283868337218117379783608318587331517916696607930361272175815275915222107\"]",
  volumeAmm: number;
  volumeClob: number;
  liquidityAmm: number;
  liquidityClob: number;
  negRisk: boolean;
  events: {
    id: string;
    ticker: string;
    slug: string;
    title: string;
    description: string;
    endDate: string;
    image: string;
    icon: string;
    active: boolean;
    closed: boolean;
    archived: boolean;
    new: boolean;
    featured: boolean;
    restricted: boolean;
    createdAt: string;
    updatedAt: string;
    competitive: number;
    volume1wk: number;
    volume1mo: number;
    volume1yr: number;
    enableOrderBook: boolean;
    liquidityAmm: number;
    liquidityClob: number;
    negRisk: boolean;
    negRiskMarketID: string;
    commentCount: number;
    cyom: boolean;
    showAllOutcomes: boolean;
    showMarketImages: boolean;
    enableNegRisk: boolean;
    negRiskAugmented: boolean;
    pendingDeployment: boolean;
    deploying: boolean;
  }[];
  ready: boolean;
  funded: boolean;
  cyom: boolean;
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  spread: number;
  oneDayPriceChange: number;
  oneHourPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  oneYearPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  clearBookOnStart: boolean;
  manualActivation: boolean;
  negRiskOther: boolean;
  umaResolutionStatuses: "[]";
  pendingDeployment: boolean;
  deploying: boolean;
  rfqEnabled: boolean;
};

type CreatePolymarketOrderParams = {
  clobClient: ClobClient;
  tokenID: string;
  side: Side;
  orderType: OrderType;
  price?: number;
  expiration?: number; // For GTD orders, e.g. dayjs().add(1, "hour").unix()
  amount: number;
};

type InitPolymarkBets = {
  runtime: IAgentRuntime;
  clobClient: ClobClient;
  scraper: Scraper;
  interval: string; // in minutes
  runOnStartup: boolean; // Whether to run the bet immediately on startup
};

export async function initializePolymarketBet({
  runtime,
  clobClient,
  scraper,
  interval,
  runOnStartup,
}: InitPolymarkBets) {
  if (runOnStartup) await makeBet(scraper, clobClient, runtime);

  schedule.scheduleJob(`*/${interval} * * * *`, async function () {
    await makeBet(scraper, clobClient, runtime);
  });
}

async function makeBet(
  scraper: Scraper,
  clobClient: ClobClient,
  runtime: IAgentRuntime
) {
  console.log("Doing a run of making a bet");

  // 1. Select a market to bet on
  const { selectedMarket, tokenID, selectedOutcome, selectedOutcomePrice } =
    await selectBet();

  if (!selectedMarket) {
    console.log("No market selected, skipping bet.");
    return;
  }

  // const orderAmount = 1;
  const orderAmount = Math.floor(Math.random() * 4) + 3; // If Buy, then Dollars. If Sell, then Shares - Random amount between $3 and $6

  const takeMarketPrice = true;
  const order = await createPolymarketOrder({
    clobClient,
    tokenID,
    side: Side.BUY,
    orderType: OrderType.FAK,
    price: takeMarketPrice ? undefined : selectedOutcomePrice - 0.02, // 2 cents less than the current price
    amount: orderAmount,
  });

  if (!order || !order.orderResponse) {
    console.error("Failed to create Polymarket order:", order);
    return;
  }

  const takingAmount = order.orderResponse.takingAmount
    ? parseFloat(order.orderResponse.takingAmount)
    : 1;

  const postedImage = await generatePolymarketBetImage({
    title: selectedMarket.question,
    imageUrl: selectedMarket.icon,
    betAmount: `$${Number(orderAmount).toFixed(2)}`,
    toWinAmount: `$${takingAmount.toFixed(2)}`,
    avgPrice: `${Math.floor(selectedOutcomePrice * 100)}c`,
    outcome: selectedOutcome,
  });

  // Now Create a tweet about the bet
  let generatedText = "";
  let attemptCount = 0;

  while (
    attemptCount < 4 &&
    (attemptCount === 0 || generatedText.length > 180)
  ) {
    generatedText = await generateText({
      modelClass: ModelClass.SMALL,
      context: `I just bet $${orderAmount} on ${selectedMarket.question} with the result being "${selectedOutcome}". Write a tweet under 180 characters about this bet which specifically mentions what you bet on and make a funny and slightly sarcastic/offensive remark about it. Do not use any formatting or markdown.`,
      runtime,
    });
    attemptCount++;
  }

  const sendTweetResults = await scraper.sendTweet(
    `${generatedText}`,
    undefined,
    [{ data: postedImage, mediaType: "image" }]
  );

  console.log("Tweet results:", await sendTweetResults.json());

  if (sendTweetResults.ok) {
    console.log(`Bet tweet for ${selectedMarket.question} is successful`);
  }
}

async function selectBet() {
  const marketReq = await fetch(
    "https://gamma-api.polymarket.com/markets?limit=400&ascending=true&active=true&closed=false"
  );
  const marketRes = (await marketReq.json()) as PolymarketMarket[];

  const shuffledMarkets = marketRes.sort(() => Math.random() - 0.5);

  const activeMarkets = shuffledMarkets
    .filter((market) => market.question && market.question.length > 0)
    .filter((market) => market.outcomePrices)
    .filter(
      (market) => market.endDate && dayjs(market.endDate).isAfter(dayjs())
    )
    .filter((market) => market.volume1wk && market.volume1wk > 2000)
    .filter((market) => market.clobTokenIds);

  console.log(
    `Found ${activeMarkets.length} active markets with outcome prices`
  );

  const marketsWithAcceptableProbability = activeMarkets.filter((market) => {
    const outcomePrices = JSON.parse(
      market.outcomePrices.replace("\\", "")
    ) as string[];
    console.log("Outcome prices for market:", market.question, outcomePrices);
    const probabilities = outcomePrices.map((price: string) =>
      parseFloat(price)
    );
    console.log(
      `Probabilities for market ${market.question}: ${probabilities}`
    );
    // Probability must be betweet 0.1 and 0.9
    return probabilities.some(
      (probability) => probability > 0.45 && probability < 0.65
    );
  });

  console.log(
    `Found ${marketsWithAcceptableProbability.length} markets with acceptable probability`
  );

  if (marketsWithAcceptableProbability.length == 0) {
    console.log("No markets with acceptable probability found");
    return null;
  }

  const selectedMarket =
    marketsWithAcceptableProbability[
      Math.floor(Math.random() * marketsWithAcceptableProbability.length)
    ];

  if (!selectedMarket) {
    console.log("No market selected, skipping bet.");
    return null;
  }

  console.log(
    `Selected market: ${selectedMarket.question} with outcomes: ${selectedMarket.outcomes}`
  );

  const potentialOutcomes = JSON.parse(selectedMarket.outcomes) as string[];

  console.log(
    `Potential outcomes for market ${selectedMarket.question}: ${potentialOutcomes}`
  );

  // Select the most likely outcome based on the highest price
  const selectedOutcome = potentialOutcomes.reduce((prev, curr) => {
    const prevPrice = parseFloat(
      JSON.parse(selectedMarket.outcomePrices)[potentialOutcomes.indexOf(prev)]
    );
    const currPrice = parseFloat(
      JSON.parse(selectedMarket.outcomePrices)[potentialOutcomes.indexOf(curr)]
    );
    let mostLikelyOrLeast: "least" | "most" = "least";

    if (mostLikelyOrLeast == "least") {
      return currPrice < prevPrice ? curr : prev;
    } else {
      return currPrice > prevPrice ? curr : prev;
    }
  }, potentialOutcomes[0]);

  console.log("Selected outcome:", selectedOutcome);

  // TODO: Implement the actual betting logic here
  console.log("Making a bet on market:", selectedMarket.question);

  const selectedOutcomeIndex = potentialOutcomes.indexOf(selectedOutcome);
  const selectedOutcomePrice = parseFloat(
    JSON.parse(selectedMarket.outcomePrices)[selectedOutcomeIndex]
  );

  const formattedClobTokenIds = JSON.parse(
    selectedMarket.clobTokenIds.replace("\\", "")
  ) as string[];

  const tokenID = formattedClobTokenIds[selectedOutcomeIndex];

  return {
    selectedMarket,
    tokenID,
    selectedOutcome,
    selectedOutcomePrice,
  };
}

async function createPolymarketOrder({
  clobClient,
  tokenID,
  side,
  orderType,
  price,
  amount,
  expiration,
}: CreatePolymarketOrderParams) {
  let order: SignedOrder | null = null;
  let orderResponse: {
    errorMsg: string;
    orderID: string;
    takingAmount: string;
    makingAmount: string;
    status: string;
    transactionsHashes: [string];
    success: true;
  } | null = null;

  console.log(
    `Creating Polymarket order: tokenID=${tokenID}, side=${side}, orderType=${orderType}, price=${price}, amount=${amount}, expiration=${expiration}`
  );

  try {
    // FOK: A Fill-Or-Kill order is an market order to buy (in dollars) or sell (in shares) shares that must be executed immediately in its entirety; otherwise, the entire order will be cancelled.
    // FAK: A Fill-And-Kill order is a market order to buy (in dollars) or sell (in shares) that will be executed immediately for as many shares as are available; any portion not filled at once is cancelled.
    // GTC: A Good-Til-Cancelled order is a limit order that is active until it is fulfilled or cancelled.
    // GTD: A Good-Til-Date order is a type of order that is active until its specified date (UTC seconds timestamp), unless it has already been fulfilled or cancelled. There is a security threshold of one minute. If the order needs to expire in 30 seconds the correct expiration value is: now * 1 mute + 30 seconds
    switch (orderType) {
      case OrderType.FOK:
      case OrderType.FAK:
        console.log("Creating a FOK order");
        order = await clobClient.createMarketOrder({
          side,
          tokenID,
          amount, // $$$
          price,
          orderType,
        });
        break;
      case OrderType.GTC:
        console.log("Creating a GTC order");
        order = await clobClient.createOrder({
          tokenID,
          price,
          side,
          size: amount,
        });
        break;
      case OrderType.GTD:
        console.log("Creating a GTD order");
        if (!expiration) {
          console.log(
            "Expiration timestamp is required for GTD orders. Please provide a valid expiration timestamp."
          );
          return;
        }

        order = await clobClient.createOrder({
          tokenID,
          price,
          side,
          size: amount,
          expiration,
        });
        break;
      default:
        console.log(`Unknown order type: ${orderType}`);
    }

    console.log("Order created:", order);

    orderResponse = await clobClient.postOrder(order, orderType);
    console.log("Order Response", orderResponse);
  } catch (error) {
    console.error("Error creating Polymarket order:", error);
  }

  return { order, orderResponse };
}
