import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgxSliderModule} from '@angular-slider/ngx-slider';

import {AppComponent} from './app.component';
import {TextField} from "./text-field/text-field.component";
import {Slider} from "./slider/slider.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    Slider,
    TextField
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
