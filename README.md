# XRP Raise

![Empowering Communities, One XRP at a Time](https://github.com/user-attachments/assets/9c69a1ec-9840-458d-9ae9-abea7bfed812)

## Inspiration 🌟
The vision for XRP Raise was to create a platform similar to GoFundMe but seamlessly integrated into a social platform like Discord. My goal was to build an easy-to-use, fee-free fundraising tool that could be utilized for various purposes, from charity initiatives to project funding. I saw this as especially valuable for university and school communities, where student clubs, projects, and initiatives could receive direct support from peers and members. 

## What It Does ⚙️

XRP Raise enables users to:
- Create and manage fundraising campaigns directly within Discord.
- Accept XRP donations using the Xaman app, providing secure and transparent transactions.
- Track and display live campaign progress, allowing users to see contributions in real time.
- Automatically verify donation transactions and notify campaign creators of milestones.
- Set campaigns as either "local," accessible only within the server it was created, or "global," visible across all servers.

## How I Built It 🛠️

The bot is built with:
- Node.js for handling backend processes and bot commands.
- Discord.js to connect with the Discord API and create interactive bot commands.
- Xaman SDK and xrpl.js library to integrate with the XRP Ledger, enabling secure XRP transactions.
- MongoDB to store campaign details and contribution data.
- DigitalOcean for deployment, ensuring the bot remains accessible 24/7.
  
## Challenges I Ran Into 🚧

The biggest challenge was figuring out the best way to securely connect the user’s wallet without literally requiring them to input their secret key or any other wallet info into the Discord bot directly (since I thought that would be a really bad idea lol). After some research, I found the Xaman app SDK (previously Xumm), which had solid documentation and seemed suitable for securely signing transactions outside of Discord. However, I encountered issues when trying to activate Testnet accounts in the Xaman app—they wouldn’t show up as activated despite attempts to fund them with XRP from the Testnet faucet. This limitation prevented me from fully testing and implementing the feature as planned as I couldn't use my Testnet accounts on the app. Then, I checked the developer Discord and realized my app was on non-Developer mode the whole time! I was able to get around this challenge and successfully implement the app payload.

## What I Learned 📚

- XRP Ledger’s consensus algorithm and how transactions are verified and processed efficiently. The [XRPL Learning Portal](https://learn.xrpl.org/) really came in clutch for understanding all the basics!
- Transaction handling on the ledger with xrpl.js and using the Xaman SDK to send payloads to the app.
- Discord.js is super fun to work with!
- Integrating secure payment and donation systems in a user-friendly way on a social platform like Discord.

## Getting Started 🚀

A link to invite the bot to your server is available to judges upon request.