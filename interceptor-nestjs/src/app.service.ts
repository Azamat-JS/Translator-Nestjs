import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AppService {
  getHello(): string {

    // const myObservable = new Observable<number>(observer=>{
    //   observer.next(1);
    //   observer.next(2);
    //   observer.next(3);
    // });

    // myObservable.subscribe((value) => console.log(value))
    return 'Hello World!';
  }
}
