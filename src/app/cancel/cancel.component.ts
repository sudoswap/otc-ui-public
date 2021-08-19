import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { ContractService } from '../contract.service';
import { UtilsService } from '../utils.service';
import { WalletService } from '../wallet.service';
import { BigNumber } from "@0x/utils";

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  constructor(public wallet: WalletService, public contract: ContractService, public constants: ConstantsService, public utils: UtilsService) { }

  ngOnInit(): void {
  }

  async cancel() {
    const salt = new BigNumber(new Date().getTime()).toString();
    const func = this.contract.EXCHANGE.methods.cancelOrdersUpTo(salt);
    await this.wallet.sendTx(func, ()=>{},()=>{},()=>{});
  }
}
