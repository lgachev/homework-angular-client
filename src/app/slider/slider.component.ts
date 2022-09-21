import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChangeContext, Options} from "@angular-slider/ngx-slider";

/** @title Monitoring autofill state with cdkAutofill */
@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class Slider {
  @Input() title: string = 'Default Title';
  @Input() value: number = 100;

  options: Options = {
    floor: 0,
    ceil: 255
  };

  @Output() emitSliderValueEvent = new EventEmitter<number>();
  onUserChangeEnd(changeContext: ChangeContext): void {
    this.emitSliderValueEvent.emit(this.value);
  }

}
