import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { ContractService } from '../contract.service';
import { UtilsService } from '../utils.service';
import { WalletService } from '../wallet.service';
import { ActivatedRoute } from '@angular/router';
import {
  assetDataUtils,
  signatureUtils,
  orderHashUtils
} from "@0x/order-utils";
import { BigNumber } from "@0x/utils";
import { MetamaskSubprovider } from "@0x/subproviders";

import { FormBuilder, Validators } from '@angular/forms';
import { FlatpickrOptions } from 'ng2-flatpickr';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  tradeURL: any;

  showAdvanced: boolean;
  takerAddress: any;

  // This is an array because that is what flatpickr's ngModel returns
  expiryDateArray: Date[];

  flatpickrOptions: FlatpickrOptions = {
    enableTime: true,
    time_24hr: true,
    minDate: new Date(),
  }

  haveAssetsList = this.fb.array([
    this.fb.group({
      type: ['', Validators.required],
      address: ['', Validators.required],
      id: [''],
      amount: ['']
    })
  ]);

  haveImageList: any;

  wantAssetsList = this.fb.array([
    this.fb.group({
      type: ['', Validators.required],
      address: ['', Validators.required],
      id: [''],
      amount: ['']
    })
  ]);

  wantImageList: any;

  erc20Data: any;

  constructor(public wallet: WalletService, public contract: ContractService, public constants: ConstantsService, public utils: UtilsService, activatedRoute: ActivatedRoute, private fb: FormBuilder) {
    this.resetData();
    this.loadData();
  }

  ngOnInit(): void {
  }

  resetData() {
    this.tradeURL = "";
    this.showAdvanced = false;
    this.haveImageList = ['./assets/404.svg'];
    this.wantImageList = ['./assets/404.svg'];
  }

  async loadData() {
    let erc20Response = await fetch(this.constants.ERC20_DATA_PATH);
    this.erc20Data = (await erc20Response.json())["tokens"];
  }

  addToHaveAssetsList() {
    const asset = this.fb.group({
      type: ['', Validators.required],
      address: ['', Validators.required],
      id: [''],
      amount: ['']
    });
    this.haveAssetsList.push(asset);
    this.haveImageList.push(this.constants.MISSING_IMG_PATH);
  }

  addToWantAssetsList() {
    const asset = this.fb.group({
      type: ['', Validators.required],
      address: ['', Validators.required],
      id: [''],
      amount: ['']
    });
    this.wantAssetsList.push(asset);
    this.wantImageList.push(this.constants.MISSING_IMG_PATH);
  }



  deleteHaveAsset(i) {
    this.haveAssetsList.removeAt(i);
    this.haveImageList.splice(i, 1);
  }

  deleteWantAsset(i) {
    this.wantAssetsList.removeAt(i);
    this.haveImageList.splice(i, 1);
  }


  haveAssetHasAmount(i) {
    let type = (this.haveAssetsList.at(i) as any).controls.type.value;
    return (type == "1" || type == "3");
  }
  wantAssetHasAmount(i) {
    let type = (this.wantAssetsList.at(i) as any).controls.type.value;
    return (type == "1" || type == "3");
  }


  haveAssetHasId(i) {
    let type = (this.haveAssetsList.at(i) as any).controls.type.value;
    return (type == "2" || type == "3");
  }
  wantAssetHasId(i) {
    let type = (this.wantAssetsList.at(i) as any).controls.type.value;
    return (type == "2" || type == "3");
  }

  formatAsset(type, address, id, amount) {
    if (type == 1) {
      return assetDataUtils.encodeERC20AssetData(address);
    }
    if (type == 2) {
      return assetDataUtils.encodeERC721AssetData(address, id);
    }
    if (type == 3) {
      return assetDataUtils.encodeERC1155AssetData(address, [id], [amount], "0x00");
    }
  }

  async checkApprovals(type, address, amount) {

    if (type == "1") {
      let tradeAmount = new BigNumber(amount).times(this.constants.NORMAL_SCALING).integerValue().toFixed();
      let maxAllowance = new BigNumber(2).pow(256).minus(1).integerValue().toFixed();
      let currentAllowance = new BigNumber(await this.contract.ERC20(address).methods.allowance(this.wallet.userAddress, this.constants.ERC20_PROXY_ADDRESS).call());
      if (currentAllowance.lt(tradeAmount)) {
        const func = this.contract.ERC20(address).methods.approve(this.constants.ERC20_PROXY_ADDRESS, maxAllowance);
        await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
      }
    }
    if (type == "2") {
      let isApproved = await this.contract.ERC721(address).methods.isApprovedForAll(this.wallet.userAddress, this.constants.ERC721_PROXY_ADDRESS).call();

      console.log(isApproved);

      if (! isApproved) {
        const func = this.contract.ERC721(address).methods.setApprovalForAll(this.constants.ERC721_PROXY_ADDRESS, true);
        await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
      }
    }
    if (type == "3") {
      let isApproved = await this.contract.ERC1155(address).methods.isApprovedForAll(this.wallet.userAddress, this.constants.ERC1155_PROXY_ADDRESS).call();
      if (! isApproved) {
        const func = this.contract.ERC1155(address).methods.setApprovalForAll(this.constants.ERC1155_PROXY_ADDRESS, true);
        await this.wallet.sendTx(func, ()=>{}, ()=>{}, ()=>{});
      }
    }
  }

  async generateSignature() {

    // Encode haveAssets
    let haveAmounts = [];
    let haveAssetData = [];
    for (let i = 0; i < this.haveAssetsList.length; i++) {
      let item = (this.haveAssetsList.at(i) as any).controls;
      let amount = item.amount.value;
      // Format with decimals if needed
      if (item.type.value == "1") {
        let decimals = await this.contract.ERC20(item.address.value).methods.decimals().call();
        decimals = (new BigNumber(10)).pow(decimals);
        amount = (new BigNumber(item.amount.value).times(decimals).integerValue().toFixed()).toString();
      }
      // Set amount if NFT
      if (item.type.value == "2") {
        amount = 1;
      }
      let assetData = this.formatAsset(item.type.value, item.address.value, item.id.value, amount);
      haveAmounts.push(new BigNumber(amount));
      haveAssetData.push(assetData);
    }

    // Encode wantAssets
    let wantAmounts = [];
    let wantAssetData = [];
    for (let i = 0; i < this.wantAssetsList.length; i++) {
      let item = (this.wantAssetsList.at(i) as any).controls;
      let amount = item.amount.value;
      // Format with decimals if needed
      if (item.type.value == "1") {
        let decimals = await this.contract.ERC20(item.address.value).methods.decimals().call();
        decimals = (new BigNumber(10)).pow(decimals);
        amount = (new BigNumber(item.amount.value).times(decimals).integerValue().toFixed()).toString();
      }
      // Set amount if NFT
      if (item.type.value == "2") {
        amount = 1;
      }
      let assetData = this.formatAsset(item.type.value, item.address.value, item.id.value, amount);
      wantAmounts.push(new BigNumber(amount));
      wantAssetData.push(assetData);
    }

    const salt = new BigNumber(new Date().getTime()).toString();

    const expiryTimestamp = this.expiryDateArray === undefined || this.expiryDateArray.length === 0
      ? this.constants.DEFAULT_ORDER_EXPIRY
      : String(Math.round(this.expiryDateArray[0].getTime() / 1000))

    if (this.takerAddress === undefined) {
      this.takerAddress = this.constants.NULL_ADDRESS;
    }

    const order : any = {
      makerAssetData: assetDataUtils.encodeMultiAssetData(haveAmounts, haveAssetData),
      makerAssetAmount: "1",
      takerAssetData: assetDataUtils.encodeMultiAssetData(wantAmounts, wantAssetData),
      takerAssetAmount: "1",
      expirationTimeSeconds: expiryTimestamp,
      makerAddress: this.wallet.userAddress,
      takerAddress: this.takerAddress,
      feeRecipientAddress: this.constants.XMON_MULTISIG,
      senderAddress: this.constants.NULL_ADDRESS,
      makerFee: "0",
      takerFee: "0",
      salt: salt,
      exchangeAddress: this.constants.EXCHANGE_ADDRESS
    }
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(
      new MetamaskSubprovider(this.wallet.web3.givenProvider),
      orderHashHex,
      this.wallet.web3.utils.toChecksumAddress(this.wallet.userAddress)
    );
    const signedOrder = { ...order, signature };
    let baseurl = window.location.origin+window.location.pathname;
    this.tradeURL = baseurl + "#/swap/" + this.utils.lzString().compressToEncodedURIComponent(JSON.stringify(signedOrder));

    // Get all approvals
    for (let i = 0; i < this.haveAssetsList.length; i++) {
      let item = (this.haveAssetsList.at(i) as any).controls;
      await this.checkApprovals(item.type.value, item.address.value, item.amount.value);
    }
  }

  async cancel() {
    const salt = new BigNumber(new Date().getTime()).toString();
    const func = this.contract.EXCHANGE.methods.cancelOrdersUpTo(salt);
    await this.wallet.sendTx(func, ()=>{},()=>{},()=>{});
  }

  async getHaveImage(i) {
    let address = (this.haveAssetsList.at(i) as any).controls.address.value;
    if (this.haveAssetHasId(i)) {
      let id = (this.haveAssetsList.at(i) as any).controls.id.value;
      let metadata = await fetch(this.constants.OPENSEA_API + address + '/' + id);
      if (metadata.ok) {
        this.haveImageList[i] = (await metadata.json())["image_preview_url"];
      }
    }
    else {
      this.haveImageList[i] = this.findERC20ImageURL(address);
    }
  }

  formatOpenSeaLinkForHave(i) {
    let address = (this.haveAssetsList.at(i) as any).controls.address.value;
    let id = (this.haveAssetsList.at(i) as any).controls.id.value;
    return this.constants.OPENSEA_LINK + address + "/" + id;
  }

  async getWantImage(i) {
    let address = (this.wantAssetsList.at(i) as any).controls.address.value;
    if (this.wantAssetHasId(i)) {
      let id = (this.wantAssetsList.at(i) as any).controls.id.value;
      let metadata = await fetch(this.constants.OPENSEA_API + address + '/' + id);
      if (metadata.ok) {
        this.wantImageList[i] = (await metadata.json())["image_preview_url"];
      }
    }
    else {
      this.wantImageList[i] = this.findERC20ImageURL(address);
    }
  }

  formatOpenSeaLinkForWant(i) {
    let address = (this.wantAssetsList.at(i) as any).controls.address.value;
    let id = (this.wantAssetsList.at(i) as any).controls.id.value;
    return this.constants.OPENSEA_LINK + address + "/" + id;
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

  copy() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value =  this.tradeURL
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  toggleShowAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }
}
