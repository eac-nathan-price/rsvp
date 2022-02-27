import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss']
})
export class SlideComponent implements OnInit {
  @Input() alignment = 'center center';
  @Input() color = 'white';
  @Input() file?: string;
  path = 'assets/';

  constructor() { }

  ngOnInit(): void {
  }

}
