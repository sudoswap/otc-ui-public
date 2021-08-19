import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  asset1Img: any;
  asset2Img: any;
  imageList: Array<string>;

  constructor() {
    this.imageList = [
      "./assets/0xmons-1.gif",
      "./assets/0xmons-2.gif",
      "./assets/0xmons-3.gif",
      "./assets/aave.svg",
      "./assets/autoglyphs-1.svg",
      "./assets/kitties-1.png",
      "./assets/ghosts-1.png",
      "./assets/mooncats-1.png",
      "./assets/punks-1.png",
      "./assets/punks-2.png",
      "./assets/uni.svg",
      "./assets/ape-1.png",
      "./assets/ape-2.png",
      "./assets/ape-3.png",
      "./assets/tree-1.png",
      "./assets/tree-2.png",
      "./assets/tree-3.png",
      "./assets/zrx.png"
    ]
   }

  ngOnInit(): void {
    this.loadAsset();
    setInterval(() => {
      this.loadAsset();
    }, 3000);
  }

  loadAsset() {
    this.imageList = this.shuffle(this.imageList);
  }

  shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}
