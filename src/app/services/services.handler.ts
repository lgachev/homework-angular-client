import {Component, EventEmitter, Injectable, Output} from "@angular/core";
import {map, Observable, Observer, Subject} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

// TODO move to a config file
const JAVA_URL = "ws://localhost:4200/websocket";
const PYTHON_URL = "http://localhost:4200/rgb";

@Injectable()
export class ServicesHandler {
  public websocketMessages: Subject<string>;
  private lastUnprocessedPythonDto: PythonDto | undefined;

  constructor(private websocketService: WebsocketService, private restService: RestService) {

    this.websocketMessages = this.websocketService.messages;

    this.websocketService.connectionEstablished.subscribe(sessionId => {
      console.log("Event to flush python caught.");
      if (sessionId != undefined) {
        this.flushPythonDto();
      }
    });
  }

  // TODO consider moving sessionId and timestamp to the header.
  public postPython(cssBackgroundColorTemplate: string, cssTextColorTemplate: string, redValue: number, greenValue: number, blueValue: number, textValue: string) {
    let sessionId = this.getSessionId();
    if (sessionId != undefined) {
      let pythonDto = new PythonDto(
        sessionId,
        Date.now(),
        cssBackgroundColorTemplate,
        cssTextColorTemplate,
        redValue,
        greenValue,
        blueValue,
        textValue);
      console.log(pythonDto);
      let restData = JSON.stringify(pythonDto);
      this.restService.postPython(restData);
    } else {
      this.lastUnprocessedPythonDto = new PythonDto(
        "-1",
        Date.now(),
        cssBackgroundColorTemplate,
        cssTextColorTemplate,
        redValue,
        greenValue,
        blueValue,
        textValue);
      console.log("Python request logged.");
    }
  }

  public getSessionId(): string | undefined {
    return this.websocketService.sessionId;
  }

  private flushPythonDto() {
    let sessionId = this.getSessionId();
    let pythonDto = this.lastUnprocessedPythonDto;
    if (sessionId != undefined && pythonDto != undefined) {
      pythonDto.sessionId = sessionId;
      let restData = JSON.stringify(pythonDto);
      this.restService.postPython(restData);
      this.lastUnprocessedPythonDto = undefined;
      console.log("Data successfully flushed.");
  }
  }
}

// TODO research if adding them here is the "angular/typescript" way of making them "package private".
@Injectable({providedIn: 'root'})
class WebsocketService {
  private subject: Subject<MessageEvent> | undefined;
  public sessionId: string | undefined;
  public messages: Subject<string>;
  @Output() connectionEstablished = new EventEmitter<string>();

  constructor() {
    this.messages = <Subject<string>>this.connect(JAVA_URL).pipe(
      map(
        (response: MessageEvent): string => {
          let data = JSON.parse(response.data);
          if (data.hasOwnProperty("sessionId")) {
            this.sessionId = data.sessionId;
            this.connectionEstablished.emit(this.sessionId);
            console.log("sessionId: " + this.sessionId);
          }
          return response.data;
        }
      )
    );
  }

  // TODO add reconnect feature on java server down.
  public connect(url: string): Subject<MessageEvent> {
    if (this.subject === undefined) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url: string): Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return Subject.create(observer, observable);
  }
}

@Injectable({providedIn: 'root'})
class RestService {
  constructor(private http: HttpClient) {
  }

  postPython(data: string) {
    console.log("Posting to python: " + data);
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this.http.post(PYTHON_URL, data, {headers: headers, responseType: 'text'}).subscribe();
  }
}

export class PythonDto {
  constructor(
    public sessionId: string,
    public timestamp: number,
    public cssBackgroundColorTemplate: string,
    public cssTextColorTemplate: string,
    public red: number,
    public green: number,
    public blue: number,
    public text: string) {
  }
}
