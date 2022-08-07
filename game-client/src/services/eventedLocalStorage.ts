export enum StorageType {
  local,
  session
}

export type SetItemEventPayload = {
  key: string;
  previousValue: string | null;
  newValue: string;
}
export type RemoveItemEventPayload = {
  key: string;
  removedValue: string | null;
  wasCleared: boolean;
}

export type SetItemEventHandler = (payload: SetItemEventPayload) => void;
export type RemoveItemEventHandler = (payload: RemoveItemEventPayload) => void;

export class EventedStorage implements Storage {
  storage: Storage;
  setItemHandlers: {
    "": SetItemEventHandler[],
    [key:string]: SetItemEventHandler[]
  } = {
    "": []
  }
  removeItemHandlers: {
    "": RemoveItemEventHandler[],
    [key:string]: RemoveItemEventHandler[]
  } = {
    "": []
  }

  constructor(storageType = StorageType.local){
    this.storage = storageType === StorageType.local ? localStorage : sessionStorage;
    window.addEventListener("storage", this.handleWindowStorageEvent.bind(this))
  }

  get length() {
    return this.storage.length;
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }
  getItem(key: string):  string | null {
    return this.storage.getItem(key);
  }
  setItem(key: string, value: string): void {
    const payload: SetItemEventPayload = {
      key,
      previousValue: this.storage.getItem(key),
      newValue: value
    }
    this.storage.setItem(key, value);
    this.emitSetItem(payload);
  }
  removeItem(key: string): void {
    const payload: RemoveItemEventPayload = {
      key,
      removedValue: this.storage.getItem(key),
      wasCleared: false
    }
    this.storage.removeItem(key);
    this.emitRemoveItem(payload);
  }

  clear(): void {
    this.storage.clear();
    this.emitClear();
  }

  onSetItem(handler: SetItemEventHandler, storageKey: string = "") {
    if( !this.setItemHandlers[storageKey] ) this.setItemHandlers[storageKey] = [];
    if( this.setItemHandlers[storageKey].includes(handler) === false )
    this.setItemHandlers[storageKey].push(handler);
  }
  
  onRemoveItem(handler: RemoveItemEventHandler, storageKey: string = "") {
    if( !this.removeItemHandlers[storageKey] ) this.removeItemHandlers[storageKey] = [];
    if( this.removeItemHandlers[storageKey].includes(handler) === false )
    this.removeItemHandlers[storageKey].push(handler);
  }

  offSetItem(handlerToRemove?: SetItemEventHandler, storageKey: string = "") {
    if( handlerToRemove ) {
      if( storageKey ) {
        this.setItemHandlers[storageKey] = this.setItemHandlers[storageKey].filter(handler => handler !== handlerToRemove);
      }
      else {
        //Remove the indicated handler from ALL storage keys
        Object.entries(this.setItemHandlers).forEach(([key]) => {
          this.setItemHandlers[key] = this.setItemHandlers[key].filter(handler => handler !== handlerToRemove);
        })
      }
    }
    else this.setItemHandlers = {"": []};
  }

  offRemoveItem(handlerToRemove?: RemoveItemEventHandler, storageKey: string = "") {
    if( handlerToRemove ) {
      if( storageKey ) {
        this.removeItemHandlers[storageKey] = this.removeItemHandlers[storageKey].filter(handler => handler !== handlerToRemove);
      }
      else {
        //Remove the indicated handler from ALL storage keys
        Object.entries(this.removeItemHandlers).forEach(([key]) => {
          this.removeItemHandlers[key] = this.removeItemHandlers[key].filter(handler => handler !== handlerToRemove);
        })
      }
    }
    else this.removeItemHandlers = {"": []};
  }

  private emitSetItem(payload: SetItemEventPayload) {
    for( let handler of this.setItemHandlers[payload.key] || [] ) {
      handler(payload);
    }
    for( let handler of this.setItemHandlers[""] ) {
      handler(payload);
    }
  }

  private emitRemoveItem(payload: RemoveItemEventPayload) {
    for( let handler of this.removeItemHandlers[payload.key] || [] ) {
      handler(payload);
    }
    for( let handler of this.removeItemHandlers[""] ) {
      handler(payload);
    }
  }

  private emitClear() {
    for( let key in this.removeItemHandlers) {
      for( let handler of this.removeItemHandlers[key] ){
        handler({
          key,
          removedValue: null,
          wasCleared: true
        })
      }
    }
  }

  private handleWindowStorageEvent({key, newValue, oldValue}: StorageEvent) {
    if( key === null ) {
      //clear was called
      this.emitClear()
    }
    else if( newValue === null ) {
      //the item was removed
      this.emitRemoveItem({
        key,
        removedValue: oldValue,
        wasCleared: false
      })
    }
    else {
      this.emitSetItem({
        key,
        newValue,
        previousValue: oldValue
      })
    }
  }
}
