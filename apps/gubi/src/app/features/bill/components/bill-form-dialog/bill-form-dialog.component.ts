import { BillApiService } from '@features/bill/services/bill-api.service';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, input, Output, signal, WritableSignal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { Select } from 'primeng/select';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import Utils from '@shared/utils/utils';
import { BillFileComponent } from '../bill-file/bill-file.component';

@Component({
  selector: 'app-bill-form-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, DatePickerModule, Select, ReactiveFormsModule, Checkbox, FormsModule, BillFileComponent],
  templateUrl: './bill-form-dialog.component.html',
  styleUrl: './bill-form-dialog.component.scss'
})
export class BillFormDialogComponent {
  protected messageService = inject(MessageService);
  protected billApiService = inject(BillApiService);
  protected spaceApiService = inject(SpaceApiService);

  @Input() isOpen = signal(false);
  @Output() touchBill = new EventEmitter<iBill>();

  selectedBill = input<iBill | null>();
  referencePeriod = input.required<Date>();
  space = input.required<iSpace>();

  protected possiblePayers = computed(() => this.space()?.members?.map(m => m.user) || []);
  protected isEditMode = computed(() => !!this.selectedBill());
  protected isLoading = signal(false);
  protected showSplitInfo = signal(false);

  protected billForm!: FormGroup;

  constructor() {
    this.billForm = new FormGroup({
      space_id: new FormControl(),
      name: new FormControl('', Validators.required),
      value: new FormControl<number | null>(null),
      deadline: new FormControl<Date | null>(null),
      payer_id: new FormControl<string | null>(null),
      paid_at: new FormControl<Date | null>(null),
      reference_period: new FormControl<Date | null>(null),
      force_split: new FormControl<boolean>(false)
    });

    effect(() => {
      this.initializeForm();
    });
  }

  private initializeForm() {
    this.billForm.patchValue({
      space_id: this.space().id,
      reference_period: this.referencePeriod()
    });

    const bill = this.selectedBill();

    if (this.isOpen() && bill && this.billForm.untouched) {
      this.patchFormWithBill(bill);
    } else if (!this.isOpen()) {
      this.resetForm();
    }
  }

  private patchFormWithBill(bill: iBill) {
    this.billForm.addControl('id', new FormControl());
    bill = Utils.formatAllStrToDatePattern(bill);
    this.billForm.patchValue(bill);
  }

  private resetForm() {
    this.billForm.removeControl('id');
    this.billForm.reset();
  }

  protected close(): void {
    this.isLoading.set(false);
    this.isOpen.set(false);
    this.billForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.billForm.invalid) return;

    this.isLoading.set(true);
    const bill = this.billForm.value;
    Utils.formatAllStrToDatePattern(bill);

    const { data, error } = bill.id ? await this.billApiService.updateBill(bill) : await this.billApiService.createBill(bill);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.touchBill.emit(data);
    this.close();
  }

  toggleInfos(info: WritableSignal<boolean>) {
    info.update(value => !value);
  }

  setPaidAt(isPaid: boolean) {
    if (isPaid) {
      this.billForm.get('paid_at')?.setValue(new Date());
    } else {
      this.billForm.get('paid_at')?.setValue(null);
    }
  }
}
