import { Component, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, retry, tap } from 'rxjs/operators';

type TParam = {
  key?:string
}

type TMonth = {
  date:Date,
  bold:boolean
}

class Img {
  public desc:string[];
  constructor(public file:string, public date:Date, public width:number, public height:number, ...desc:string[]) {
    this.desc = desc;
  }
}

class Timeline {
  private endPad:number = 1000*60*60*24*30*3;

  public start:Date;
  public end:Date;
  public months:TMonth[] = [];
  public src:string = '';
  public width:number = 0;
  public height:number = 0;
  public albumIndex:number = 0;
  public curDate:Date = new Date();
  public curImg:Img;
  public done:boolean = false;
  public scrollDate:Date;

  constructor(public album:Img[], public path:string, public scrollDist:number) {
    album.sort((a:Img, b:Img) => a.date.getTime() - b.date.getTime());
    this.start = album[0].date;
    this.scrollDate = this.start;
    this.end = album[album.length-1].date;
    this.curImg = album[0];
    this.setImg(0);

    let curYear = this.start.getFullYear(), curMonth = this.start.getMonth();
    let numMonths = (this.end.getFullYear()*12 + this.end.getMonth()) - (curYear*12 + curMonth) + 1;
    for (let i = 0; i < numMonths; ++i) {
      this.months.push({date:new Date(curYear, curMonth), bold:i==0||curMonth==0});
      curMonth = ++curMonth % 12;
      if (curMonth == 0) ++curYear;
    }
  }

  setImg(index:number): void {
    this.albumIndex = index;
    this.curImg = this.album[index];
    this.src = this.path + this.curImg.file;
    this.width = this.curImg.width;
    this.height = this.curImg.height;
    this.curDate = this.curImg.date;
  }

  update(scroll:number): void {
    let months = scroll / this.scrollDist, curYear = this.start.getFullYear(), curMonth = this.start.getMonth();
    let numDays = [30, 27, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30];
    curMonth += months;
    curYear += Math.floor(curMonth / 12);
    curMonth = Math.floor(curMonth % 12);
    let curDay = Math.round((months % 1) * numDays[curMonth]) + 1;
    this.scrollDate = new Date(curYear, curMonth, curDay);
    
    let newIndex=0, i=0;
    if (this.scrollDate <= this.start) newIndex = 0;
    else if (this.scrollDate >= this.end) newIndex = this.album.length - 1;
    else {
      while (this.scrollDate > this.album[i].date) ++i;
      let bound = this.album[i].date.getTime() - this.album[i-1].date.getTime();
      let perc = (this.scrollDate.getTime() - this.album[i-1].date.getTime()) / bound;
      newIndex = perc > 0.5 ? i : i-1;
    }
    if (newIndex != this.albumIndex) this.setImg(newIndex);
    this.done = this.scrollDate.getTime() >= this.end.getTime() + this.endPad;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  album = [
    new Img('2015-01-ucsc.jpg', new Date(2015, 0, 25), 1080, 1920, 'January 25, 2015', 'The day we met'),
    new Img('2015-04-forest.jpg', new Date(2015, 3, 1), 1080, 1920, 'April 16, 2015', 'Heading to class'),
    new Img('2015-11-dorm.jpg', new Date(2015, 6, 1), 1080, 1920, 'November 5, 2015', 'Studying'),
    new Img('2015-11-greatamerica.jpg', new Date(2015, 9, 1), 1080, 1920, 'November 11, 2015', 'Great America'),
    new Img('2015-12-date.jpg', new Date(2015, 11, 1), 4032, 3024, 'December 12, 2015', 'First real date'),

    new Img('2016-03-mystery.jpg', new Date(2016, 1, 1), 1080, 1920, 'March 5, 2016', 'Winchester Mystery House'),
    new Img('2016-06-coronado.jpg', new Date(2016, 3, 1), 1462, 2048, 'June 20, 2016', 'Trip to Coronado'),
    new Img('2016-06-az.jpg', new Date(2016, 6, 1), 4032, 3024, 'June 27, 2016', 'Horseshoe Bend'),
    new Img('2016-06-vegas.jpg', new Date(2016, 9, 1), 1536, 2048, 'June 30, 2016', 'Las Vegas'),
    //new Img('2016-12-farm.jpg', new Date(2016, 12, 1), 1920, 1080, 'December 30, 2016', 'Farm'),
    new Img('2016-12-hanukah.jpg', new Date(2016, 11, 24), 1920, 1080, 'December 24, 2016', 'Lighting Hanukiah'),

    new Img('2017-04-canyon.jpg', new Date(2017, 3, 1), 2576, 1932, 'April 19, 2017', 'Black Canyon'),
    new Img('2017-04-gods.jpg', new Date(2017, 6, 1), 1932, 2576, 'April 19, 2017', 'Garden of the Gods'),
    new Img('2017-12-zoo.jpg', new Date(2017, 10, 1), 1920, 1080, 'December 9, 2017', 'San Diego Zoo'),

    new Img('2018-06-selfie.jpg', new Date(2018, 2, 1), 1080, 1920, 'June 2, 2018', 'Selfie'),
    new Img('2018-11-harbor.jpg', new Date(2018, 6, 1), 1242, 2208, 'Nov 17, 2018', 'Moms birthday'),
    new Img('2018-11-knee.jpg', new Date(2018, 10, 1), 1536, 2048, 'Nov 23, 2018', 'Proposal!'),
    new Img('2018-11-proposal.jpg', new Date(2018, 11, 1), 1536, 2048, 'Nov 23, 2018', 'Proposal!'),

    new Img('2019-07-lakelouise.jpg', new Date(2019, 4, 1), 3264, 1592, 'July 14, 2019', 'Lake Louise'),
    new Img('2019-07-glacier.jpg', new Date(2019, 7, 1), 4032, 1960, 'July 14, 2019', 'Glacier'),
    new Img('2019-07-boat.jpg', new Date(2019, 9, 1), 1960, 4032, 'July 15, 2019', 'Boat'),
    new Img('2019-07-banff.jpg', new Date(2019, 11, 1), 3264, 1592, 'July 15, 2019', 'Banff'),

    new Img('2020-01-symphony.jpg', new Date(2020, 0, 1), 2208, 2944, 'January 19, 2020', 'Symphony'),

    new Img('2021-09-vasquez.jpg', new Date(2021, 8, 1), 3264, 1592, 'September 18, 2021', 'Vasquez Rocks'),

    new Img('2015-01-ucsc.jpg', new Date(2022, 3, 23), 1080, 1920)
  ];
  timeline = new Timeline(this.album, document.baseURI+'assets/', 46);

  api = '';
  doc = '';
  key = '';
  data$:Observable<any>;
  endpoint$:Observable<string>;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    history.scrollRestoration = 'manual';

    let api = 'aHR0cHM6Ly9maXJlc3RvcmUuZ29vZ2xlYXBpcy5jb20vdjEv';
    this.api = Buffer.from(api, 'base64').toString('binary');
    let doc = 'cHJvamVjdHMvcnN2cC0xN2ZkMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2RvY3VtZW50cy9yZXNwb25zZXMv';
    this.doc = Buffer.from(doc, 'base64').toString('binary');

    this.endpoint$ = this.route.queryParams
      .pipe(
        filter((params:any) => params.key),
        map((params:TParam) => this.doc + params.key),
        tap((endpoint:any) => console.log(endpoint))
      );
    
    this.data$ = this.endpoint$
      .pipe(
        mergeMap((endpoint:string) => http.get(this.api + endpoint)),
        catchError((err, caught) => {
          console.log(err);
          return EMPTY;
        }),
        filter((response:any) => response.name),
        map((data:any) => {
          console.log(data);
          let viewed = parseInt(data.fields._viewed.integerValue);
          data.fields._viewed.integerValue = (++viewed).toString();
          return data;
        })
      );
    
    let view$ = this.data$
      .pipe(
        mergeMap((data:any) => http.patch(this.api + data.name, data))
      )
      .subscribe((response:any) => {
        console.log(response);
        view$.unsubscribe();
      });
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.timeline.update(window.scrollY);
  }
}
