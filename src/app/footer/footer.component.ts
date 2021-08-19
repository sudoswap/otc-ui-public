import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../utils.service';
import { WalletService } from '../wallet.service';
import { ConstantsService } from '../constants.service';
import { BigNumber } from "@0x/utils";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(public wallet: WalletService, public utils: UtilsService, public constants: ConstantsService) { }

  ngOnInit(): void {
  }


  async tipEth(_amount) {
    _amount = _amount.toString();
    await this.wallet.web3.eth.sendTransaction({
      to: this.constants.XMON_MULTISIG,
      from: this.wallet.userAddress,
      value: this.wallet.web3.utils.toWei(_amount, "ether")
    })
  }


}
