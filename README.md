# XRP Raise

![Empowering Communities, One XRP at a Time](https://github.com/user-attachments/assets/9c69a1ec-9840-458d-9ae9-abea7bfed812)

## Inspiration 🌟
The vision for XRP Raise was to create a platform similar to GoFundMe but seamlessly integrated into a social platform like Discord. My goal was to build an easy-to-use, fee-free fundraising tool that could be utilized for various purposes, from charity initiatives to project funding. I saw this as especially valuable for university and school communities, where student clubs, projects, and initiatives could receive direct support from peers and members. 

By simplifying the process and eliminating fees, XRP Raise aims to empower communities to fund meaningful causes in an accessible and engaging way.

## What It Does ⚙️

XRP Raise enables users to:
- Create and manage fundraising campaigns directly within Discord.
- Accept XRP donations using the Xaman app, providing secure and transparent transactions.
- Track and display live campaign progress, allowing users to see contributions in real time.
- Automatically verify donation transactions and notify campaign creators of milestones.

## How I Built It 🛠️

The bot is built with:
- Node.js for handling backend processes and bot commands.
- Discord.js to connect with the Discord API and create interactive bot commands.
- Xaman SDK to integrate with the XRP Ledger, enabling secure XRP transactions.
- MongoDB to store campaign details and contribution data.
- DigitalOcean for deployment, ensuring the bot remains accessible 24/7.
  
## Challenges I Ran Into 🚧

The biggest challenge was figuring out the best way to securely connect the user’s wallet without literally requiring them to input their secret key into the bot (lol). After some research, I found the Xaman app SDK (previously Xumm), which had solid documentation and seemed suitable for securely signing transactions. However, I encountered issues when trying to activate Testnet accounts in the Xaman app—they wouldn’t show up as activated despite attempts to fund them with XRP from the Testnet faucet. This limitation prevented me from fully testing and implementing the feature as planned as I couldn't use my Testnet accounts on the app.

## What I Learned 📚

- XRP Ledger’s consensus algorithm and how transactions are verified and processed efficiently.
- Transaction handling on the ledger and using the Xaman SDK to send payloads to the app.
- Discord.js is super fun to work with!
- Integrating secure payment and donation systems in a user-friendly way on a social platform.

## Getting Started 🚀
