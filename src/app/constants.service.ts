import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

  NORMAL_SCALING = 1e18;

  //When a user does not specify an expiration date, default to 50 years in future
  DEFAULT_ORDER_EXPIRY = "3620442933";

  // Rinkeby addresses (note you have to change chainId in web3Enabled)
  // MULTICALL_ADDRESS = '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821';
  // TEST721_ADDRESS = '0x09972358feEb111C0E1388161C3FA5e0Cd220A6B';
  // ERC721_PROXY_ADDRESS = '0x7656D773e11ff7383A14dCf09a9c50990481Cd10';
  // EXCHANGE_ADDRESS = '0xBFf9493F92A3df4B0429b6d00743B3cfB4c85831';

  // Mainnet addresses
  MULTICALL_ADDRESS = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441"
  XMON_MULTISIG = '0x4e2f98c96e2d595a83AFa35888C4af58Ac343E44';
  EXCHANGE_ADDRESS = '0x080bf510FCbF18b91105470639e9561022937712';
  ERC721_PROXY_ADDRESS = '0xeFc70A1B18C432bdc64b596838B4D138f6bC6cad';
  ERC20_PROXY_ADDRESS = '0x95E6F48254609A6ee006F7D493c8e5fB97094ceF';
  ERC1155_PROXY_ADDRESS = '0x7EeFBd48FD63d441Ec7435D024EC7c5131019ADd';

  // File paths
  ERC20_DATA_PATH = './assets/tokens.json';
  MISSING_IMG_PATH = './assets/404.svg';
  OPENSEA_API = 'https://api.opensea.io/api/v1/asset/';
  OPENSEA_LINK = 'https://opensea.io/assets/';
}