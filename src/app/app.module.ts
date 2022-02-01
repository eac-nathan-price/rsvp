import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// Modules
import { AppRoutingModule, MaterialModule } from 'src/app';
// Components
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
