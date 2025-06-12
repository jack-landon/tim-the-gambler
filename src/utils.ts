function formatTweet(response: string) {
  return response.slice(0, 240); // Twitter char limit
}
