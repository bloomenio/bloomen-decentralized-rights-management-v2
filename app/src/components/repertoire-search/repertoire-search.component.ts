// Basic
import { Component, Output, EventEmitter, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import {fromEvent, Subscription, noop, BehaviorSubject, Observable} from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
// import {loading$} from '@stores/repertoire/repertoire.effects';
import {UserModel} from '@models/user.model';
import {RepertoireEffects} from '@stores/repertoire/repertoire.effects';

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
  public changeLoading$: Subscription;
  public loading = true;
  public loadingObs: Observable<boolean>;

  private input$: Subscription;
  // public loading$ = new RepertoireEffects().loading$;

  constructor(
    public fb: FormBuilder,
    public repertoireEffects: RepertoireEffects
  ) { }

  public ngOnInit() {
    this.searchForm = this.fb.group({
      search: ['']
    });
    // this.changeLoading$ = this.repertoireEffects.loading$.subscribe();
  }

  public ngAfterViewInit() {
    this.input$ = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => this.filter.emit(this.input.nativeElement.value.trim().toLowerCase()))
      ).subscribe();
  }

  public ngOnDestroy() {
    this.input$.unsubscribe();
    if (this.changeLoading$) {
      this.changeLoading$.unsubscribe();
    }
  }
}
