# sudoswap

THIS REPO IS STILL NOT FIT FOR PUBLIC CONSUMPTION. USE AT YOUR OWN RISK.

Getting this to build can be tricky.
1. Follow the instructions on modifying `node_modules/` in the web3.js github issue to disable issues [here](https://github.com/ChainSafe/web3.js/issues/1555#issuecomment-443989251). After that, check out `scripts/web3-patch.js` for a post-install script which should handle the rest. If there are still issues, proceed below: 
2. Modify package.json to remove the `fs` dependency.
3. Check the version numbers for all of the `0x` stuff because it's trying to work with `v2`.
4. Remove the weird `Ganache` in `node_modules` (just comment it out)
5. This commit [here](https://github.com/ethfinex/efx-api-node/blob/50b169aa094b73a869dd9a830e281fdda5345296/src/api/sign/order.js) helps explain how to set up the 0x libraries. 
6. Add your own blocknative API key and Infura API key in `web3Enabled.js`