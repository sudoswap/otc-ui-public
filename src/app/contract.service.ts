import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(public wallet: WalletService, public constants: ConstantsService) {
  }

  public get MULTICALL() {
    const abi = require('../assets/abi/Multicall.json');
    const address = this.constants.MULTICALL_ADDRESS;
    return new this.wallet.web3.eth.Contract(abi, address); 
  }

  public get EXCHANGE() {
    const abi = require('../assets/abi/Exchange.json');
    const address = this.constants.EXCHANGE_ADDRESS;
    return new this.wallet.web3.eth.Contract(abi, address); 
  }
  
  public ERC20(address) {
    const abi = require('../assets/abi/ERC20.json');
    return new this.wallet.web3.eth.Contract(abi, address); 
  }

  public ERC721(address) {
    const abi = require('../assets/abi/ERC721.json');
    return new this.wallet.web3.eth.Contract(abi, address); 
  }

  public ERC1155(address) {
    const abi = require('../assets/abi/ERC1155.json');
    return new this.wallet.web3.eth.Contract(abi, address); 
  }

  async loadData() {
    // this.currBlock = new BigNumber(await this.wallet.web3.eth.getBlockNumber());
  }
}
