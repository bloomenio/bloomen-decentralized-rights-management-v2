// Basic
import { Injectable } from '@angular/core';
import { DedicatedInstanceFactory, NgForage, NgForageOptions } from 'ngforage';

// Services
import { Logger } from '@services/logger/logger.service';

// Constants
import { SECRET } from '@constants/storage.constants';

// Encripter library
import { AES, enc, WordArray } from 'crypto-js';

const log = new Logger('storage.service');

/**
 * Service to handler the storage with the application.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {

  /**
   * Construtor where we import all needed in the service.
   */
  constructor(private dedicatedInstanceFactory: DedicatedInstanceFactory) { }

  /**
   * Method to create a new database with a custom configuration.
   * @param config Database configuration.
   */
  public create(config: NgForageOptions): NgForage {
    return this.dedicatedInstanceFactory.createNgForage(config);
  }

  /**
   * Method to get an object stored inside database and decript.
   * @param storage storage instance
   * @param encryption if the database has encryption.
   * @param key Primary key to get the value inside the database.
   */
  public get(storage: NgForage, encryption: boolean, key: string): Promise<any> {
    return this._get(storage, encryption, key);
  }

  /**
   * Method to set an object stored inside database and encript.
   * @param storage storage instance
   * @param encryption if the database has encryption.
   * @param key Primary key to be stored inside the database.
   * @param value Value to be stored inside the database
   */
  public set(storage: NgForage, encryption: boolean, key: string, value: any): Promise<any> {
    if (encryption) {
      return storage.setItem(key, AES.encrypt(JSON.stringify(value), SECRET).toString());
    } else {
      return storage.setItem(key, value);
    }
  }

  /**
   * Method to get everything stored inside database and decript.
   * @param storage storage instance
   * @param encryption if the database has encryption.
   */
  public getAll(storage: NgForage, encryption: boolean): Promise<any> {
    return storage.keys().then(keys => Promise.all(keys.map(k => this._get(storage, encryption, k))));
  }

  /**
   * Delete the value of the key provided by parameter.
   * @param storage storage instance
   * @param key Primary key to delete the value
   */
  public remove(storage: NgForage, key: string) {
    return storage.removeItem(key);
  }

  /**
   * remoove all the storage.
   * @param storage storage instance.
   */
  public removeAll(storage: NgForage): Promise<any> {
    return storage.clear();
  }

  /**
   * Private method to get an object stored inside database and decript.
   * @param storage storage instance
   * @param encryption if the database has encryption.
   * @param key Primary key to get the value inside the database.
   */
  private _get(storage: NgForage, encryption: boolean, key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      storage.getItem(key).then(value => {
        if (value !== undefined && value !== null) {
          if (encryption) {
            try {
              resolve(JSON.parse(AES.decrypt(value as WordArray, SECRET).toString(enc.Utf8)));
            } catch (exception) {
              resolve(AES.decrypt(value as WordArray, SECRET).toString(enc.Utf8));
            }
          } else {
            try {
              resolve(JSON.parse(value as string));
            } catch (exception) {
              resolve(value);
            }
          }
        } else {
          resolve();
        }
      }, error => {
        log.error(this, error);
        reject();
      });
    });
  }

}
