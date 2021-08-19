import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { ContractService } from '../contract.service';
import { UtilsService } from '../utils.service';
import { WalletService } from '../wallet.service';
import { ActivatedRoute } from '@angular/router';
import { assetDataUtils } from "@0x/order-utils";
import { BigNumber } from "@0x/utils";

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {

  order: any;
  hasDefaultExpiryDate: any;
  expiryDate: any;
  takerAddress: any;
  asset1Data: any;
  asset2Data: any;
  isFilled: boolean;
  isCanceled: boolean;
  erc20Data: any;

  constructor(public wallet: WalletService, public contract: ContractService, public constants: ConstantsService, public utils: UtilsService, private activatedRoute: ActivatedRoute) { 
    this.asset1Data = [];
    this.asset2Data = [];
    this.isFilled = false;
    this.isCanceled = false;
  }

  ngOnInit(): void {
    this.order = this.activatedRoute.snapshot.paramMap.get('order');
    if (this.wallet.web3) {
      this.loadData();
    }
    // this.activatedRoute.params.subscribe(routeParams => {
    //   this.order = routeParams.order;
    // });
  }

  async needsApprove(type, address, amount) {
    if (type == "1") {
      let tradeAmount = new BigNumber(amount).times(this.constants.NORMAL_SCALING).integerValue().toFixed();
      let currentAllowance = new BigNumber(await this.contract.ERC20(address).methods.allowance(this.wallet.userAddress, this.constants.ERC20_PROXY_ADDRESS).call());
      if (currentAllowance.lt(tradeAmount)) {
        return true;
      }
    }
    if (type == "2") {
      let isApproved = await this.contract.ERC721(address).methods.isApprovedForAll(this.wallet.userAddress, this.constants.ERC721_PROXY_ADDRESS).call();
      if (! isApproved) {
        return true;
      }
    }
    if (type == "3") {
      let isApproved = await this.contract.ERC1155(address).methods.isApprovedForAll(this.wallet.userAddress, this.constants.ERC1155_PROXY_ADDRESS).call();
      if (! isApproved) {
        return true;
      }
    }
    return false;
  }

  async approve(type, address) {
    if (type == "1") {
      let maxAllowance = new BigNumber(2).pow(256).minus(1).integerValue().toFixed();
      const func = this.contract.ERC20(address).methods.approve(this.constants.ERC20_PROXY_ADDRESS, maxAllowance);
      await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
    }
    if (type == "2") {
      const func = this.contract.ERC721(address).methods.setApprovalForAll(this.constants.ERC721_PROXY_ADDRESS, true);
      await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
    }
    if (type == "3") {
      const func = this.contract.ERC1155(address).methods.setApprovalForAll(this.constants.ERC1155_PROXY_ADDRESS, true);
      await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
    }
  }

  async loadData() {

    let erc20Response = await fetch(this.constants.ERC20_DATA_PATH);
    this.erc20Data = (await erc20Response.json())["tokens"];

    this.order = JSON.parse(this.utils.lzString().decompressFromEncodedURIComponent(this.order));
    
    this.hasDefaultExpiryDate = (this.order.expirationTimeSeconds === this.constants.DEFAULT_ORDER_EXPIRY);
    this.expiryDate = this.utils.convertTimestamp(this.order.expirationTimeSeconds);
    this.takerAddress = this.order.takerAddress;
    if (this.takerAddress === this.constants.NULL_ADDRESS) {
      this.takerAddress = "anyone";
    }

    // check if already filled
    let orderInfo = await this.contract.EXCHANGE.methods.getOrderInfo(this.order).call();
    let orderFilledAmount = orderInfo.orderTakerAssetFilledAmount;
    if (parseInt(orderFilledAmount) > 0) {
      this.isFilled = true;
    }

    // check if individually cancelled
    let orderHash = orderInfo.orderHash;
    this.isCanceled = await this.contract.EXCHANGE.methods.cancelled(orderHash).call();

    // check salt against epoch
    let orderEpoch = await this.contract.EXCHANGE.methods.orderEpoch(this.order.makerAddress, this.order.senderAddress).call();
    if (orderEpoch > this.order.salt) {
      this.isCanceled = true;
    }

    let asset1List = assetDataUtils.decodeAssetDataOrThrow(this.order.takerAssetData);
    for (let i = 0; i < (asset1List as any).nestedAssetData.length; i++) {
      let assetObj = {};
      let assetData = assetDataUtils.decodeAssetDataOrThrow((asset1List as any).nestedAssetData[i]);
      assetObj["address"] = assetData["tokenAddress"];
      assetObj["type"] = "1";
      if ("tokenIds" in assetData) {
        assetObj["id"] = assetData["tokenIds"][0];
        assetObj["type"] = "3";
      }
      if ("tokenId" in assetData) {
        assetObj["id"] = assetData["tokenId"];
        assetObj["type"] = "2";
      }
      let scaling = new BigNumber(1);
      if (assetObj["type"] == "1") {
        scaling = await this.contract.ERC20(assetObj["address"]).methods.decimals().call();
        scaling = (new BigNumber(10)).pow(scaling);
      }
      assetObj["amount"] = (new BigNumber((asset1List as any).amounts[i])).div(scaling);
      assetObj["imgURL"] = await this.getImage(assetObj["address"], assetObj["id"], assetObj["type"] === "1");
      try {
        assetObj["name"] = await this.contract.ERC20(assetObj["address"]).methods.name().call();
      }
      catch (e) {
        assetObj["name"] = await this.getName(assetObj["address"], assetObj["id"]);
      }
      try {
        assetObj["symbol"] = await this.contract.ERC20(assetObj["address"]).methods.symbol().call();
      }
      catch(e) {
        assetObj["symbol"] = "";
      }
      this.asset1Data.push(assetObj);
    }
    
    let asset2List = assetDataUtils.decodeAssetDataOrThrow(this.order.makerAssetData);
    for (let i = 0; i < (asset2List as any).nestedAssetData.length; i++) {
      let assetObj = {};
      let assetData = assetDataUtils.decodeAssetDataOrThrow((asset2List as any).nestedAssetData[i]);
      assetObj["address"] = assetData["tokenAddress"];
      assetObj["type"] = "1";
      if ("tokenIds" in assetData) {
        assetObj["id"] = assetData["tokenIds"][0];
        assetObj["type"] = "3";
      }
      if ("tokenId" in assetData) {
        assetObj["id"] = assetData["tokenId"];
        assetObj["type"] = "2";
      }
      let scaling = new BigNumber(1);
      if (assetObj["type"] == "1") {
        scaling = await this.contract.ERC20(assetObj["address"]).methods.decimals().call();
        scaling = (new BigNumber(10)).pow(scaling);
      }
      assetObj["amount"] = (new BigNumber((asset2List as any).amounts[i])).div(scaling);
      assetObj["imgURL"] = await this.getImage(assetObj["address"], assetObj["id"], assetObj["type"] === "1");
      try {
        assetObj["name"] = await this.contract.ERC20(assetObj["address"]).methods.name().call();
      }
      catch (e) {
        assetObj["name"] = await this.getName(assetObj["address"], assetObj["id"]);
      }
      try {
        assetObj["symbol"] = await this.contract.ERC20(assetObj["address"]).methods.symbol().call();
      }
      catch(e) {
        assetObj["symbol"] = "";
      }
      this.asset2Data.push(assetObj);
    }
  }

  async getImage(address, id, isERC20) {
    if (! isERC20) {
      let metadata = await fetch(this.constants.OPENSEA_API + address + '/' + id);
      if (metadata.ok) {
        return (await metadata.json())["image_preview_url"];
      }
    }
    else {
      return this.findERC20ImageURL(address);
    }
  }

  async getName(address, id) {
    let metadata = await fetch(this.constants.OPENSEA_API + address + '/' + id);
      if (metadata.ok) {
        return (await metadata.json())["name"];
      }
  }

  findERC20ImageURL(address) {
    let url = this.constants.MISSING_IMG_PATH;
    for (let t of this.erc20Data) {
      if (t["address"] === address) {
        url = t["logoURI"];
      }
    }
    return url;
  }

  async acceptSwap() {

    for (let i = 0; i < this.asset1Data.length; i++) {
      let data = this.asset1Data[i];
      let needsApprove = await this.needsApprove(data.type, data.address, data.amount);
      if (needsApprove) {
        await this.approve(data.type, data.address);
      }
    }

    const func = this.contract.EXCHANGE.methods.fillOrder(this.order, this.order.takerAssetAmount, this.order.signature);
    await this.wallet.sendTx(func, ()=>{}, ()=>{}, (e)=>{alert(e)});
  }

  async cancelOrder() {
    const func = this.contract.EXCHANGE.methods.cancelOrder(this.order);
    await this.wallet.sendTx(func, ()=>{}, ()=>{}, (e)=>{alert(e)});
  }
}
