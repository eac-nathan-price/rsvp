import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgxUsefulSwiperModule  } from 'ngx-useful-swiper';
// Modules
import { AppRoutingModule, MaterialModule } from 'src/app';
// Components
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { SlideComponent } from './slide/slide.component';

@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent,
    SlideComponent
  ],
  imports: [
    BrowserModule/* First */,
    HttpClientModule,
    MaterialModule,
    NgxUsefulSwiperModule ,
    AppRoutingModule/* Last */
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
