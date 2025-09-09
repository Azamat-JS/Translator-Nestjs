import { Injectable } from "@nestjs/common";
import { map, Observable, of, tap } from "rxjs";

@Injectable()
export class AppService {
  getHello(): string {
    // const myObservable = new Observable<number>(observer=>{
    //   observer.next(1);
    //   observer.next(2);
    //   observer.next(3);
    // });

    // myObservable.subscribe((value) => console.log(value))
    of(1, 2, 3)
      .pipe(
        tap((value) => console.log(`before: ${value}`)),
        map((value) => value * 10),
        tap((value) => console.log(`after: ${value}`))
      )
      .subscribe();
    return "Hello World!";
  }
}
