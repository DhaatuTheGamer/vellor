import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import React from 'react';
import { Transaction } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatDate } from '../../helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface GradeChartDataPoint {
  date: string;
  val: number;
  grade?: string;
}

interface StudentProgressTabProps {
  gradeChartData: GradeChartDataPoint[];
  progressTransactions: Transaction[];
  setShowReportModal: (show: boolean) => void;
  formatGrade: (val: number) => string;
}

export const StudentProgressTab: React.FC<StudentProgressTabProps> = ({
  gradeChartData,
  progressTransactions,
  setShowReportModal,
  formatGrade,
}) => {
  return (
    <Card className="border-gray-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon iconName="star" className="w-5 h-5 text-accent" />
          Progress & Remarks
        </h3>
        <Button
          size="sm"
          onClick={() => setShowReportModal(true)}
          variant="primary"
          className="rounded-full shadow-md shadow-accent/20 text-xs"
        >
          Export Report
        </Button>
      </div>

      {gradeChartData.length > 1 && (
        <div className="h-48 w-full mb-8 mt-2 pr-4 bg-gray-50/50 dark:bg-primary-light/10 p-4 rounded-3xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gradeChartData}>
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                tickFormatter={formatGrade}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(_value: ValueType | undefined, _name: NameType | undefined, props: { payload?: { grade?: string } }) => [
                  props.payload?.grade || '',
                  'Grade',
                ]}
              />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {progressTransactions.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {progressTransactions.map((t) => (
            <div
              key={t.id + '-prog'}
              className="p-4 bg-gray-50 dark:bg-primary/30 rounded-2xl border border-gray-100 dark:border-white/5 relative transition-colors hover:border-accent/40"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Icon iconName="calendar" className="w-4 h-4" />{' '}
                  {formatDate(t.date)}
                </span>
                {t.grade && (
                  <span className="px-2.5 py-0.5 rounded-full bg-accent text-primary-dark font-bold text-sm shadow-sm">
                    Grade: {t.grade}
                  </span>
                )}
              </div>
              {t.progressRemark && (
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-2">
                  {t.progressRemark}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-primary/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
          <div className="w-16 h-16 mx-auto bg-white dark:bg-primary-light rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Icon iconName="star" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No progress records found.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Add a grade or remark when logging lessons.
          </p>
        </div>
      )}
    </Card>
  );
};
