import {
  Action,
  ActionExample,
  elizaLogger,
  generateText,
  generateTweetActions,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  ModelClass,
  State,
} from "@elizaos/core";
import { TwitterClientInterface } from "@elizaos/client-twitter";
import { Scraper } from "agent-twitter-client";
// import twitter from "@elizaos/plugin-twitter";
import { twitterPlugin } from "@elizaos/plugin-twitter";
import {} from "@elizaos/plugin-node";

export const getCryptoNews: Action = {
  name: "GET_CRYPTO_NEWS",
  similes: ["NEWS", "MARKET"],
  description: "Get recent updates on crypto markets",
  validate: async (runtime: IAgentRuntime) => {
    // TODO: Add validation logic if needed
    // await validateCryptoNewsConfig(runtime);
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ) => {
    try {
      let generatedText = "";

      if (Math.random() < 0.7) {
        // Use Coindesk data
        const coindeskReq = await fetch(
          `https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=1`
        );
        const coindeskRes = (await coindeskReq.json()) as {
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
        const coindeskArticle = coindeskRes.Data[0].BODY;

        generatedText = await generateText({
          modelClass: ModelClass.SMALL,
          context: `Here is a crypto news article:\n${coindeskArticle}.\n Write an insightful tweet about this article WITHOUT FORMATTING OR MARKDOWN. Be funny and slightly sarcastic/offensive.`,
          runtime,
        });
      } else {
        const newsDataReq = await fetch(
          `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_DATA_API_KEY}&q=ethereum`
        );
        const recentNews = (await newsDataReq.json()) as {
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

        const articleTitles = recentNews.results
          .map((article) => article.title)
          .filter((title) => title && title.length > 0)
          .slice(0, 10);

        generatedText = await generateText({
          modelClass: ModelClass.SMALL,
          context: `Here are the latest crypto news articles:\n${articleTitles.join(
            "\n"
          )}. Write an insightful tweet about recent crypto news headlines WITHOUT FORMATTING OR MARKDOWN.`,
          runtime,
        });
      }

      console.log("Generated text:", generatedText);

      const scraper = new Scraper();
      await scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_SECRET
      );

      const sendTweetResults = await scraper.sendTweet(generatedText);

      if (sendTweetResults.ok) {
        console.log(`News tweet for ${generatedText} is successful`);
      }

      //   try {
      //     const postAction = twitterPlugin.actions.find(
      //       (a) => a.name === "POST_TWEET"
      //     );
      //     const tweetMessage: Memory = {
      //       agentId: runtime.agentId,
      //       userId: runtime.agentId,
      //       content: {
      //         text: generatedText,
      //         action: "POST_TWEET",
      //       },
      //       roomId: message.roomId,
      //     };

      //     const newTweet = await postAction.handler(runtime, tweetMessage, state);
      //     console.log("Tweet posted successfully:", newTweet);
      //   } catch (error) {
      //     console.log("Error posting to Twitter:", error);
      //   }

      if (callback) {
        callback({
          text: `Here is the Tweet about recent crypto news: ${generatedText}`,
        });
        return true;
      }
    } catch (error) {
      elizaLogger.error("Error generating text:", error);
      callback({
        text: `Error generating tweet about recent crypto news: ${error.message}`,
        content: { error: error.message },
      });
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "What's happening in the crypto market today?",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Let me check the latest crypto news and write a tweet summarizing the trends.",
          action: "GET_CRYPTO_NEWS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Any big news about Ethereum?",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll analyze the latest Ethereum news and craft a tweet about it.",
          action: "GET_CRYPTO_NEWS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Summarize today's crypto headlines in a tweet.",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here's a tweet summarizing the top crypto news today.",
          action: "GET_CRYPTO_NEWS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you tweet about the latest crypto trends?",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Sure! I'll analyze the latest crypto news and generate a tweet.",
          action: "GET_CRYPTO_NEWS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Write a tweet about what's new in crypto.",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here's a tweet based on the most recent crypto news headlines.",
          action: "GET_CRYPTO_NEWS",
        },
      },
    ],
  ],
};
