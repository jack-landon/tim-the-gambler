export const polymarketOrderSlip = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Polymarket Card</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
      }

      .container {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        position: relative;
        min-height: 100vh;
      }

      .background-image {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: 1rem;
      }

      .content {
        z-index: 10;
        margin-top: 8rem;
      }

      .flex-col {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .card-wrapper {
        width: 80%;
      }

      .card {
        border-radius: 0.5rem;
        background-color: white;
        padding: 1.5rem;
      }

      .header {
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }

      .header-image {
        margin-right: 1rem;
        height: 2.5rem;
        width: 2.5rem;
        border-radius: 0.125rem;
      }

      .header-text {
        font-size: 1.25rem;
        font-weight: 600;
      }

      .middle-section {
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 1.125rem;
      }

      .down-badge {
        border-radius: 0.25rem;
        background-color: #fef2f2;
        padding: 0 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f87171;
      }

      .avg-price {
        color: #6b7280;
      }

      .divider-section {
        display: flex;
        align-items: center;
      }

      .divider-line {
        width: 100%;
        height: 2px;
      }

      .polymarket-logo {
        margin: 0 0.75rem;
        height: 2.5rem;
        width: 2.5rem;
      }

      .bottom-section {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .bet-label {
        margin-bottom: -0.25rem;
        font-size: 1.125rem;
        color: #6b7280;
      }

      .bet-amount {
        font-size: 1.25rem;
        font-weight: 600;
      }

      .win-label {
        margin-bottom: -0.25rem;
        text-align: right;
        font-size: 1.125rem;
        color: #6b7280;
      }

      .win-amount {
        font-size: 1.25rem;
        font-weight: 600;
        color: #10b981;
      }

      .ticket-cut {
        margin-top: -0.5rem;
        background-color: transparent;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://polymarket.com/images/share-card-background-combined.png"
        class="background-image"
        alt="Background"
      />
      <div class="content">
        <div class="flex-col">
          <div class="card-wrapper">
            <div class="card">
              <div class="header">
                <img
                  crossorigin="anonymous"
                  src="https://via.placeholder.com/40x40"
                  class="header-image"
                  alt="Icon"
                />
                <p class="header-text">Solana Up or Down on June 11?</p>
              </div>
              <div class="middle-section">
                <div>
                  <p class="down-badge">Down</p>
                </div>
                <div>
                  <p class="avg-price">Avg 10¢</p>
                </div>
              </div>

              <div class="divider-section">
                <svg
                  class="divider-line"
                  viewBox="0 0 600 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="-8.74228e-08"
                    y1="1.00006"
                    x2="1129"
                    y2="0.999962"
                    stroke="#BDBDBD"
                    stroke-width="2"
                    stroke-dasharray="24 16"
                  ></line>
                </svg>
                <img
                  src="https://polymarket.com/images/share-card-polymarket-gray-logo.png"
                  class="polymarket-logo"
                  alt="Polymarket Logo"
                />
                <svg
                  class="divider-line"
                  viewBox="0 0 600 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="-8.74228e-08"
                    y1="1.00006"
                    x2="1129"
                    y2="0.999962"
                    stroke="#BDBDBD"
                    stroke-width="2"
                    stroke-dasharray="24 16"
                  ></line>
                </svg>
              </div>

              <div class="bottom-section">
                <div>
                  <p class="bet-label">Bet</p>
                  <p class="bet-amount">$20.29</p>
                </div>
                <div>
                  <p class="win-label">To win</p>
                  <p class="win-amount">$196.23</p>
                </div>
              </div>
            </div>
            <img
              src="https://polymarket.com/images/share-card-ticket-cut.png"
              class="ticket-cut"
              alt="Ticket Cut"
            />
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
