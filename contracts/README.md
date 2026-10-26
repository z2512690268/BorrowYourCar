# BorrowYourCar Contract

## Local Ganache accounts

The `ganache` network connects to `http://127.0.0.1:7545` and uses
`accounts: "remote"`. Ganache manages its development accounts and signs
transactions. Do not paste private keys or a mnemonic into this repository.
Start Ganache with unlocked development accounts before deploying. Keep its
RPC endpoint local; this configuration is intended for local development.

Hardhat uses the accounts returned by Ganache, in Ganache's order. Deployment
uses the first available account. This can differ from the four accounts and
order previously configured in this repository. If Ganache reports no accounts
or requires an account to be unlocked, check the local Ganache workspace and
account settings.

The four private keys formerly committed in `hardhat.config.ts` must be treated
as exposed. Create a fresh Ganache workspace with a new mnemonic and accounts,
then update the preallocated addresses in `contracts/BorrowYourCar.sol`, deploy
again, and update the frontend addresses and wallet connection as described in
the repository README. Do not reuse those old keys on public networks. Removing
keys from the current file does not remove them from Git history.

## Commands

Run these commands from `contracts`:

```shell
npm ci
npx hardhat compile
npx hardhat test

# Start local Ganache first, then deploy using its first unlocked account.
npx hardhat run scripts/deploy.ts --network ganache
```
