import Web3 from 'web3';
import Onboard from 'bnc-onboard';
import BigNumber from 'bignumber.js';

export class Web3Enabled {
  blocknativeAPIKey: string;
  infuraKey: string;
  portisKey: string;
  assistInstance: any;
  notifyInstance: any;
  state: any;
  networkID: number;

  constructor(public web3: Web3) {
    this.assistInstance = null;
    this.blocknativeAPIKey = '';
    this.infuraKey = '';
    // (for rinkeby)
    // this.networkID = 4; 
    this.networkID = 1;
    this.state = {
      address: null
    };
  }

  async connect(onConnected, onError, isStartupMode: boolean) {
    if (!this.assistInstance) {
      const genericMobileWalletConfig = {
        name: 'Web3 wallet (e.g. MetaMask)',
        mobile: true,
        desktop: true,
        preferred: true,
        type: 'injected' as 'injected',
        iconSrc: 'data:image/png;base64,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',
        wallet(helpers) {
          const getProviderName = helpers.getProviderName, createModernProviderInterface = helpers.createModernProviderInterface, createLegacyProviderInterface = helpers.createLegacyProviderInterface;
          const provider = window['ethereum'] ||
            (this.web3 && this.web3.currentProvider);
          const result = {
            provider,
            interface: provider
              ? typeof provider.enable === 'function'
                ? createModernProviderInterface(provider)
                : createLegacyProviderInterface(provider)
              : null
          };
          return new Promise<{ provider, interface }>((resolve, reject) => {
            resolve(result);
          });
        }
      };

      const wallets = [
        genericMobileWalletConfig,
        {
          walletName: 'walletConnect',
          infuraKey: this.infuraKey,
          networkId: this.networkID,
          preferred: true
        },
        {
          walletName: "trust", preferred: true, rpcUrl: "https://mainnet.infura.io/v3/" + this.infuraKey
        }
      ];

      const walletChecks = [
        { checkName: 'connect' },
        { checkName: 'network' },
        { checkName: 'balance', minimumBalance: '0' }
      ];

      const walletSelectConfig = {
        heading: 'Select a Wallet',
        description: 'Please select a wallet to connect:',
        wallets
      };

      const bncAssistConfig = {
        dappId: this.blocknativeAPIKey,
        darkMode: true,
        networkId: this.networkID,
        subscriptions: {
          wallet: wallet => {
            if (wallet.provider) {
              this.web3 = new Web3(wallet.provider);
            }
            // store the selected wallet name to be retrieved next time the app loads
            window.localStorage.setItem('selectedWallet', wallet.name);
          },
          address: this.doNothing,
          network: this.doNothing,
          balance: this.doNothing
        },
        walletSelect: walletSelectConfig,
        walletCheck: walletChecks
      };
      this.assistInstance = Onboard(bncAssistConfig);
    }

    // Get user to select a wallet
    let selectedWallet;
    if (isStartupMode) {
      // Startup mode: connect to previously used wallet if available
      // get the selectedWallet value from local storage
      const previouslySelectedWallet = window.localStorage.getItem('selectedWallet');
      const accounts = await this.web3.eth.getAccounts();
      // call wallet select with that value if it exists and we are already logged in
      if (previouslySelectedWallet != null && accounts.length > 0) {
        selectedWallet = await this.assistInstance.walletSelect(previouslySelectedWallet);
      }
    } else {
      // Non startup mode: open wallet selection screen
      selectedWallet = await this.assistInstance.walletSelect();
    }
    const state = this.assistInstance.getState();
    if (
      selectedWallet
      || state.address !== null // If user already logged in but want to switch account, and then dismissed window
    ) {
      // Get users' wallet ready to transact
      const ready = await this.assistInstance.walletCheck();
      this.state = this.assistInstance.getState();

      if (!ready) {
        // Selected an option but then dismissed it
        // Treat as no wallet
        onError();
      } else {
        // Successfully connected
        onConnected();
      }
    } else {
      // User refuses to connect to wallet
      // Update state
      this.state = this.assistInstance.getState();
      onError();
    }
  }

  async estimateGas(func, val, _onError) {
    return Math.floor((await func.estimateGas({
      from: this.state.address,
      value: val
    }).catch(_onError)) * 1.2);
  }

  async sendTx(func, _onTxHash, _onReceipt, _onError) {
    const gasLimit = await this.estimateGas(func, 0, _onError);
    if (!isNaN(gasLimit)) {
      return func.send({
        from: this.state.address,
        gas: gasLimit,
      }).on('transactionHash', (hash) => {
        _onTxHash(hash);
      }).on('error', (e) => {
        if (!e.toString().contains('newBlockHeaders')) {
          _onError(e);
        }
      }).on("receipt", () => {
        _onReceipt();
      });
    }
  }

  async sendTxWithValue(func, val, _onTxHash, _onReceipt, _onError) {
    const gasLimit = await this.estimateGas(func, val, _onError);
    if (!isNaN(gasLimit)) {
      return func.send({
        from: this.state.address,
        gas: gasLimit,
        value: val
      }).on('transactionHash', (hash) => {
        _onTxHash(hash);
      }).on('error', (e) => {
        if (!e.toString().contains('newBlockHeaders')) {
          _onError(e);
        }
      }).on("receipt", () => {
        _onReceipt();
      });
    }
  }

  async sendTxWithNFT(func, token, to, gasLimit, _onTxHash, _onReceipt, _onError) {
    const isApproved = await token.methods.isApprovedForAll(this.state.address, to).call();
    if (isApproved) {
      func.send({
        from: this.state.address,
        gas: gasLimit,
      }).on('transactionHash', (hash) => {
        _onTxHash(hash);
      }).on('error', (e) => {
        if (!e.toString().contains('newBlockHeaders')) {
          _onError(e);
        }
      }).on("receipt", () => {
        _onReceipt();
      });
    }
    else {
      return this.sendTx(token.methods.setApprovalForAll(to, true), () => {
        func.send({
          from: this.state.address,
          gas: gasLimit,
        }).on('transactionHash', (hash) => {
          _onTxHash(hash);
        }).on('error', (e) => {
          if (!e.toString().contains('newBlockHeaders')) {
            _onError(e);
          }
        }).on("receipt", () => {
          _onReceipt();
        });
      }, this.doNothing, _onError);
    }
  }

  async sendTxWithToken(func, token, to, amount, gasLimit, _onTxHash, _onReceipt, _onError) {
    const maxAllowance = new BigNumber(2).pow(256).minus(1).integerValue().toFixed();
    const state = this.state;
    const allowance = new BigNumber(await token.methods.allowance(state.address, to).call());
    if (allowance.gt(0)) {
      if (allowance.gte(amount)) {
        return this.sendTx(func, _onTxHash, _onReceipt, _onError);
      }
      return this.sendTx(token.methods.approve(to, 0), () => {
        this.sendTx(token.methods.approve(to, maxAllowance), () => {
          func.send({
            from: this.state.address,
            gas: gasLimit,
          }).on('transactionHash', (hash) => {
            _onTxHash(hash);
          }).on('error', (e) => {
            if (!e.toString().contains('newBlockHeaders')) {
              _onError(e);
            }
          }).on("receipt", () => {
            _onReceipt();
          });
        }, this.doNothing, _onError);
      }, this.doNothing, _onError);
    } else {
      return this.sendTx(token.methods.approve(to, maxAllowance), () => {
        func.send({
          from: this.state.address,
          gas: gasLimit,
        }).on('transactionHash', (hash) => {
          _onTxHash(hash);
        }).on('error', (e) => {
          if (!e.toString().contains('newBlockHeaders')) {
            _onError(e);
          }
        }).on("receipt", () => {
          _onReceipt();
        });
      }, this.doNothing, _onError);
    }
  }

  doNothing() { }
}
