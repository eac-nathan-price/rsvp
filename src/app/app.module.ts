import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
    AppRoutingModule/* Last */
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
