import { Component, computed, effect, input } from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import MySpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-my-spendings-charts',
  imports: [HighchartsChartComponent],
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

  chartOptions: Highcharts.Options = {
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
      text: 'Divisão de gastos por método de pagamento'
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
    series: [
      {
        type: 'pie',
        name: 'Percentage',
        data: [
          {
            name: 'Water',
            y: 55.02
          },
          {
            name: 'Fat',
            sliced: true,
            selected: true,
            y: 26.71
          },
          {
            name: 'Carbohydrates',
            y: 1.09
          },
          {
            name: 'Protein',
            y: 15.5
          },
          {
            name: 'Ash',
            y: 1.68
          }
        ]
      }
    ]
  };
  chartConstructor: ChartConstructorType = 'chart';
  updateFlag = false;
  oneToOneFlag = true;

  constructor() {
    effect(() => {
      const methods = this.paymentMethods();
      if (methods.length > 0) {
        this.chartOptions.series = [
          {
            type: 'pie',
            name: 'Percentage',
            data: methods.map(method => ({
              name: method.name,
              y: Number(this.getTotalSpentByMethod(method.id).toFixed(2))
            }))
          }
        ];
        this.updateFlag = true;
      }
    });
  }

  getTotalSpentByMethod(methodId: number): number {
    return this.spendings()
      .filter(s => this.expenseGuard(s) && s.payment_method_id === methodId)
      .reduce((total, expense) => total + (expense.value || 0), 0);
  }
}
