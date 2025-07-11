import { generateText, IAgentRuntime, ModelClass } from "@elizaos/core";
import { Scraper } from "agent-twitter-client";
import schedule from "node-schedule";

type InitializeCryptoNewsTweetsOptions = {
  runtime: IAgentRuntime;
  scraper: Scraper;
  interval: string; // in minutes
  runOnStartup: boolean;
};

export async function initializeCryptoNewsTweets({
  runtime,
  scraper,
  interval,
  runOnStartup,
}: InitializeCryptoNewsTweetsOptions) {
  try {
    if (runOnStartup) await postCryptoNewsTweets(scraper, runtime);

    schedule.scheduleJob(`*/${interval} * * * *`, async function () {
      await postCryptoNewsTweets(scraper, runtime);
    });
  } catch (error) {
    console.log("Error generating text:", error);
  }
}

async function postCryptoNewsTweets(scraper: Scraper, runtime: IAgentRuntime) {
  console.log("Doing a run of the crypto news tweet job");
  let generatedText = "";

  if (Math.random() < 1.7) {
    // Use Coindesk data
    const coindeskReq = await fetch(
      `https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=1`
    );
    const coindeskRes = (await coindeskReq.json()) as CoindeskArticleResponse;
    const coindeskArticle = coindeskRes.Data[0].BODY;

    if (coindeskArticle.length < 10) {
      console.log("Coindesk article is too short, skipping tweet generation.");
      return;
    }

    generatedText = await generateText({
      modelClass: ModelClass.SMALL,
      context: `Here is a crypto news article:\n${coindeskArticle}.\n Write an insightful tweet about this article WITHOUT FORMATTING OR MARKDOWN. Be funny and slightly sarcastic/offensive.`,
      runtime,
    });
  } else {
    const newsDataReq = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_DATA_API_KEY}&q=ethereum`
    );
    const recentNews = (await newsDataReq.json()) as NewsDataResponse;

    const articleTitles = recentNews.results
      .map((article) => article.title)
      .filter((title) => title && title.length > 0)
      .slice(0, 10);

    generatedText = await generateText({
      modelClass: ModelClass.SMALL,
      context: `Here are the latest crypto news articles:\n${articleTitles.join(
        "\n"
      )}. Write an insightful tweet about recent crypto news headlines WITHOUT FORMATTING OR MARKDOWN. Also DO NOT USE HASHTAGS.`,
      runtime,
    });
  }

  const sendTweetResults = await scraper.sendTweet(generatedText);

  if (sendTweetResults.ok) {
    console.log(`News tweet for ${generatedText} is successful`);
  }
}

type CoindeskArticleResponse = {
  Data: [
    {
      TYPE: string;
      ID: number;
      GUID: string;
      PUBLISHED_ON: number;
      IMAGE_URL: string;
      TITLE: string;
      SUBTITLE: null;
      AUTHORS: string;
      URL: string;
      SOURCE_ID: number;
      BODY: string;
      KEYWORDS: string;
      LANG: string;
      UPVOTES: number;
      DOWNVOTES: number;
      SCORE: number;
      SENTIMENT: string;
      STATUS: string;
      CREATED_ON: number;
      UPDATED_ON: number;
      SOURCE_DATA: {
        TYPE: string;
        ID: number;
        SOURCE_KEY: string;
        NAME: string;
        IMAGE_URL: string;
        URL: string;
        LANG: string;
        SOURCE_TYPE: string;
        LAUNCH_DATE: number;
        SORT_ORDER: number;
        BENCHMARK_SCORE: number;
        STATUS: string;
        LAST_UPDATED_TS: number;
        CREATED_ON: number;
        UPDATED_ON: number;
      };
      CATEGORY_DATA: {
        TYPE: string;
        ID: number;
        NAME: string;
        CATEGORY: string;
      }[];
    }
  ];
  Err: {};
};

type NewsDataResponse = {
  status: string;
  totalResults: number;
  results: {
    article_id: string;
    title: string;
    link: string;
    keywords: string[];
    creator: null;
    description: string | null;
    content: string; // Only available in paid plans
    pubDate: string;
    pubDateTZ: string;
    image_url: string;
    video_url: string | null;
    source_id: string;
    source_name: "Analytics And Insight";
    source_priority: number;
    source_url: string;
    source_icon: string;
    language: string;
    country: string[];
    category: string;
    sentiment: string; // Only available in professional and corporate plans
    sentiment_stats: string; // Only available in professional and corporate plans
    ai_tag: string; /// Only available in professional and corporate plans
    ai_region: string; // Only available in professional and corporate plans
    ai_org: string; /// Only available in professional and corporate plans
    duplicate: boolean;
  }[];
  nextPage: string;
};
