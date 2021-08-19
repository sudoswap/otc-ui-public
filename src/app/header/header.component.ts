import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public wallet:WalletService) { }

  ngOnInit(): void {
    this.wallet.connect(() => {}, () => {}, true);
  }

  connectWallet() {
    this.wallet.connect(() => {}, () => {}, false);
  }

}
