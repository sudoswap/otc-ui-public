import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CancelComponent } from './cancel/cancel.component';
import { CreateComponent } from './create/create.component';
import { HomeComponent } from './home/home.component';
import { SwapComponent } from './swap/swap.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'create',
    component: CreateComponent
  },
  {
    path: 'swap/:order',
    component: SwapComponent
  },
  {
    path: 'cancel',
    component: CancelComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
