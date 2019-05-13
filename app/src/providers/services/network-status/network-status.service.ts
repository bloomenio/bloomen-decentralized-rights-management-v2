// Basic
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Ionic Native
import { share } from 'rxjs/operators';

/**
 * Network status service to know if the application has access to internet or not.
 */
@Injectable({ providedIn: 'root' })
export class NetworkStatus {

  /**
   * Observer with the value of the current network status
   */
  private _onlineObserver: BehaviorSubject<boolean>;

  /**
   * the state of the actual network
   */
  private _currentNetworkStateCordova: boolean;

  /**
   * Constructor where we import all needed in the service.
   * @param network plugin to know if the device is connected
   * @param platform Used to get information about your current device.
   */
  constructor(private zone: NgZone) {
    // Dont care about the first state of the app, lets suppose that is online
    this._onlineObserver = new BehaviorSubject(true);
    // We need to ensure that the plugins have been loaded (firefox issue)

    document.addEventListener(
      'deviceready',
      () => {
        this.zone.run(() => this._onCordovaReady());
      },
      false
    );


  }

  private _onCordovaReady() {
      this._onlineObserver.next(navigator.onLine);
      this._onOnline(() => this._onlineObserver.next(true));
      this._onOffline(() => this._onlineObserver.next(false));
  }

  /**
   * whether the network is considered online or not.
   */
  public isOnline(): boolean {
    if (window['cordova']) {
      return this._currentNetworkStateCordova;
    } else {
      return navigator.onLine;
    }
  }

  /**
   * whether the network is considered offline or not.
   */
  public isOffline(): boolean {
    if (window['cordova']) {
      return !this._currentNetworkStateCordova;
    } else {
      return !navigator.onLine;
    }
  }

  /**
   * Returns an observable to know the changes on the network.
   */
  public onlineObserver(): Observable<boolean> {
    return this._onlineObserver.asObservable().pipe(
      share()
    );
  }

  /**
   * Register a new callback to be executed when network turns up.
   * @param cb callback
   */
  private _onOnline(cb: any): Function {
    const listener = cb;
    window.addEventListener('online', listener, false);
    return function deregisterOnOnline() {
      window.removeEventListener('online', listener);
    };
  }

  /**
   * Register a new callback to be executed when network turns down.
   * @param cb callback
   */
  private _onOffline(cb: any): Function {
    const listener = cb;
    window.addEventListener('offline', listener, false);
    return function deregisterOnOffline() {
      window.removeEventListener('offline', listener);
    };
  }
}
