import { BillApiService } from '@features/bill/services/bill-api.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, input, Output, signal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from '@shared/services/message.service';
import { Select } from 'primeng/select';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-bill-form-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, DatePickerModule, Select, ReactiveFormsModule],
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
  spaceId = input.required<number>();

  protected isEditMode = computed(() => !!this.selectedBill());
  protected isLoading = signal(false);

  protected billForm!: FormGroup;
  protected spaceMembers: iUser[] = [];

  constructor() {
    this.billForm = new FormGroup({
      space_id: new FormControl(),
      name: new FormControl('', Validators.required),
      value: new FormControl<number | null>(null),
      deadline: new FormControl<Date | null>(null),
      payer_id: new FormControl<string | null>(null),
      paid_at: new FormControl<Date | null>(null),
      reference_period: new FormControl<Date | null>(null)
    });

    effect(() => {
      this.loadMembers();
    });

    effect(() => {
      this.initializeForm();
    });
  }

  private async loadMembers() {
    this.spaceMembers = await this.spaceApiService.getSpaceMembers(this.spaceId());
  }

  private initializeForm() {
    this.billForm.patchValue({
      space_id: this.spaceId(),
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
}
