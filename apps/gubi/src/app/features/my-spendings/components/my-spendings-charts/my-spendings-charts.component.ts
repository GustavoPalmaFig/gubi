import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iUser } from '@features/auth/interfaces/user.interface';
import { SelectButton } from 'primeng/selectbutton';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import MySpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-my-spendings-charts',
  imports: [CommonModule, FormsModule, HighchartsChartComponent, SelectButton, UserAvatarComponent],
  templateUrl: './my-spendings-charts.component.html',
  styleUrl: './my-spendings-charts.component.scss'
})
export class MySpendingsChartsComponent {
  spendings = input.required<(iBill | iExpense)[]>();
  private expenseGuard = MySpendingUtils.expenseGuard;

  protected paymentMethods = computed<iPaymentMethod[]>(() => {
    const allMethods = this.spendings()
      .filter(s => this.expenseGuard(s))
      .filter(s => s.payment_method_id)
      .map(expense => expense.payment_method);
    return allMethods.length > 0 ? Utils.getDistinctValues(allMethods, 'id') : [];
  });

  protected stateOptions: { label: string; value: number }[] = [
    { label: 'Gráfico', value: 0 },
    { label: 'Tabela', value: 1 }
  ];

  protected selectedOption = signal(0);
  protected paymentMethodsAmount = computed<{ name: string; owner: iUser; y: number }[]>(() => {
    const methods = this.paymentMethods();
    const amount =
      methods.map(method => ({
        name: method.name,
        owner: method.owner,
        y: Number(this.getTotalSpentByMethod(method.id).toFixed(2))
      })) || [];

    return Utils.sortListByProperty(amount, 'y', 'asc');
  });

  protected chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      zooming: {
        type: 'xy'
      },
      panning: {
        enabled: true,
        type: 'xy'
      },
      panKey: 'shift'
    },
    title: {
      text: ''
    },
    tooltip: {
      format: 'R$ {point.y:.1f}'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: [
          {
            enabled: true,
            distance: 20
          },
          {
            enabled: true,
            distance: -40,
            format: '{point.percentage:.1f}%',
            style: {
              fontSize: '1.2em',
              textOutline: 'none',
              opacity: 0.7
            },
            filter: {
              operator: '>',
              property: 'percentage',
              value: 5
            }
          }
        ]
      }
    },
    series: []
  };
  chartConstructor: ChartConstructorType = 'chart';
  updateFlag = false;
  oneToOneFlag = true;

  constructor() {
    effect(() => {
      this.chartOptions.series = [
        {
          type: 'pie',
          name: 'Percentage',
          data: this.paymentMethodsAmount()
        }
      ];
      this.updateFlag = true;
    });
  }

  getTotalSpentByMethod(methodId: number): number {
    return this.spendings()
      .filter(s => this.expenseGuard(s) && s.payment_method_id === methodId)
      .reduce((total, expense) => total + (expense.value || 0), 0);
  }
}
