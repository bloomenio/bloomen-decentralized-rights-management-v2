import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class PreloadImages {

    private images: Array<any>;

    constructor() {
        this.images = [];
     }

    public preload(imgPath) {
        const img = new Image();
        img.src = imgPath;
        this.images.push(img);
    }
}
