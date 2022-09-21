import {Component} from '@angular/core';
import {ServicesHandler} from "./services/services.handler";

enum Color { RED, GREEN, BLUE}

const cssBackgroundColorTemplate = 'background-color: rgb({red}, {green}, {blue});';
const cssTextColorTemplate = 'color: rgb({red}, {green}, {blue});';
const defaultBackgroundColorCss = 'background-color: rgb(127, 127, 127);';
const defaultTextColorCss = 'color: rgb(0, 0, 0);';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ServicesHandler]
})
export class AppComponent {
  title = 'angular-client';
  Color = Color;
  redTitle = 'R';
  greenTitle = 'G';
  blueTitle = 'B';
  redValue: number = 127;
  greenValue: number = 127;
  blueValue: number = 127;
  textValue: string = "TEXT";
  dynamicBackgroundColorCss: string;
  dynamicTextColorCss: string;
  latestTimestamp: number; // TODO move to the service, after all it should be synchronizing the messages, not the component

  constructor(private servicesHandler: ServicesHandler) {
    this.dynamicBackgroundColorCss = defaultBackgroundColorCss;
    this.dynamicTextColorCss = defaultTextColorCss;
    this.latestTimestamp = -1;

    servicesHandler.websocketMessages.subscribe(msg => {
      let data = JSON.parse(msg);
      if (data.hasOwnProperty("timestamp") && data.timestamp > this.latestTimestamp) {
        this.latestTimestamp = data.timestamp;
        if (data.hasOwnProperty("cssBackgroundColor")) {
          this.dynamicBackgroundColorCss = data.cssBackgroundColor;
        }
        if (data.hasOwnProperty("cssTextColor")) {
          this.dynamicTextColorCss = data.cssTextColor;
        }
        console.log("Response from websocket: " + msg);
      }
    });
  }

  sliderUpdate(value: number, color: Color) {
    if (color == Color.RED) {
      this.redValue = value;
    } else if (color == Color.GREEN) {
      this.greenValue = value
    } else if (color == Color.BLUE) {
      this.blueValue = value;
    }
    this.postPython();
  }

  changeText(value: string) {
    this.textValue = value;
    this.postPython();
  }

  postPython() {
    this.servicesHandler.postPython(cssBackgroundColorTemplate, cssTextColorTemplate, this.redValue, this.greenValue, this.blueValue, this.textValue);
  }

  getDynamicStyle() {
    return this.dynamicBackgroundColorCss + this.dynamicTextColorCss;
  }
}
