// Basic
import { Component, Output, EventEmitter, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, Subscription, noop } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-repertoire-search',
  templateUrl: 'repertoire-search.component.html',
  styleUrls: ['repertoire-search.component.scss']
})
export class RepertoireSearchComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() public readonly filter = new EventEmitter();

  @ViewChild('input') public input: ElementRef;

  public searchForm: FormGroup;

  private input$: Subscription;

  constructor(
    public fb: FormBuilder
  ) { }

  public ngOnInit() {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  public ngAfterViewInit() {
    this.input$ = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => this.filter.emit(this.input.nativeElement.value.trim().toLowerCase()))
      ).subscribe();
  }

  public doNothing() {
    noop();
  }

  public ngOnDestroy() {
    this.input$.unsubscribe();
  }
}
