import { Component, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, retry, tap } from 'rxjs/operators';
import { SwiperOptions } from 'swiper';

type TParam = {
  key?:string
}

type TStringValue = { stringValue:string };
type TIntegerValue = { integerValue:string };
type TBooleanValue = { booleanValue:boolean };

type IPerson = {
  name:string,
  attending:TBooleanValue
}

interface IField {
  _comment:TStringValue;
  _submitted?:TIntegerValue;
  _viewed:TIntegerValue;
  [key:string]:TBooleanValue|TIntegerValue|TStringValue|undefined;
}

type TDoc = {
  name:string,
  fields:IField,
  createTime:string,
  updateTime:string
}

 type Timg = {
   src:string,
   alt:string
 }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  api = '';
  doc = '';
  key = '';
  data_?:TDoc;
  data$:Observable<TDoc>;
  nodata$:BehaviorSubject<boolean>;
  endpoint$:Observable<string>;
  people:IPerson[] = [];
  disabled:BehaviorSubject<boolean>;

  config: SwiperOptions = {
    pagination: { 
      el: '.swiper-pagination', 
      clickable: true 
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    slidesPerView: 'auto',
    loop: true
  }; 

  Images: Array<Timg> = [
    { src: 'assets/2015-01-ucsc.jpg', alt: ''},
    //{ src: 'assets/2015-04-forest.jpg', alt: ''},
    { src: 'assets/2015-11-dorm.jpg', alt: ''},
    //{ src: 'assets/2015-11-greatamerica.jpg', alt: ''},
    //{ src: 'assets/2015-12-date.jpg', alt: ''},
    //{ src: 'assets/2016-03-mystery.jpg', alt: ''},
    { src: 'assets/2016-06-az.jpg', alt: ''},
    { src: 'assets/2016-06-coronado.jpg', alt: ''},
    //{ src: 'assets/2016-06-vegas.jpg', alt: ''},
    //{ src: 'assets/2016-12-farm.jpg', alt: ''},
    { src: 'assets/2016-12-hanukah.jpg', alt: ''},
    //{ src: 'assets/2017-04-canyon.jpg', alt: ''},
    //{ src: 'assets/2017-04-gods.jpg', alt: ''},
    { src: 'assets/2017-12-zoo.jpg', alt: ''},
    { src: 'assets/2018-06-selfie.jpg', alt: ''},
    { src: 'assets/2018-11-harbor.jpg', alt: ''},
    { src: 'assets/2018-11-knee.jpg', alt: ''},
    //{ src: 'assets/2018-11-proposal.jpg', alt: ''},
    { src: 'assets/2019-07-banff.jpg', alt: ''},
    //{ src: 'assets/2019-07-boat.jpg', alt: ''},
    //{ src: 'assets/2019-07-glacier.jpg', alt: ''},
    { src: 'assets/2019-07-lakelouise.jpg', alt: ''},
    //{ src: 'assets/2020-01-symphony.jpg', alt: ''},
    { src: 'assets/2021-09-vasquez.jpg', alt: ''}
  ];

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    let api = 'aHR0cHM6Ly9maXJlc3RvcmUuZ29vZ2xlYXBpcy5jb20vdjEv';
    this.api = Buffer.from(api, 'base64').toString('binary');
    let doc = 'cHJvamVjdHMvcnN2cC0xN2ZkMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2RvY3VtZW50cy9yZXNwb25zZXMv';
    this.doc = Buffer.from(doc, 'base64').toString('binary');

    this.nodata$ = new BehaviorSubject<boolean>(true);
    this.disabled = new BehaviorSubject<boolean>(false);

    this.endpoint$ = this.route.queryParams
      .pipe(
        filter((params:any) => params.key),
        map((params:TParam) => this.doc + params.key),
        tap((endpoint:string) => console.log(endpoint))
      );
    
    this.data$ = this.endpoint$
      .pipe(
        mergeMap((endpoint:string) => http.get<TDoc>(this.api + endpoint)),
        catchError((err, caught) => {
          console.warn('GetDocument Fail');
          console.warn(err);
          return EMPTY;
        }),
        map((data:TDoc) => {
          console.log(data);
          let viewed = parseInt(data.fields._viewed.integerValue);
          data.fields._viewed.integerValue = (++viewed).toString();
          this.data_ = data;
          this.people = Object.entries(this.data_.fields)
            .filter(entry => !entry[0].startsWith('_'))
            .sort()
            .map(entry => {
              return {name:entry[0], attending:entry[1] as TBooleanValue};
            });
          this.nodata$.next(false);
          document.title = 'Nathan & Winnie | RSVP'
          return data;
        })
      );
    
    let view$ = this.data$
      .pipe(
        mergeMap((data:TDoc) => http.patch<TDoc>(this.api + data.name, data))
      )
      .subscribe((response:TDoc) => {
        console.log(response);
        view$.unsubscribe();
      }, (error) => {
        console.warn('PatchView Fail');
        console.log(error);
      });
  }

  submit(): void {
    if (!this.data_) return;
    this.disabled.next(true);
    if (!this.data_.fields._submitted) this.data_.fields._submitted = {integerValue:'0'};
    let submitted = parseInt(this.data_.fields._submitted.integerValue);
    this.data_.fields._submitted.integerValue = (++submitted).toString();

    this.http.patch(this.api + this.data_.name, this.data_)
      .subscribe(response => {
        console.log(response);
        alert('Thank you for your response!');
      }, error => {
        console.warn(error);
        alert('Something went wrong, please try again...');
      });
    setTimeout(() => {
      this.disabled.next(false);
    }, 1000);
  }
}
