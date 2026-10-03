import React from 'react';
import { Calendar, Building, MapPin, CheckCircle } from 'lucide-react';

interface AnnouncementContentRendererProps {
  content: string;
}

export const AnnouncementContentRenderer: React.FC<AnnouncementContentRendererProps> = ({ content }) => {
  // Check if content contains a Markdown or formatted Schedule Table
  const isScheduleTable = content.includes('| Thời gian |') || content.includes('[BẢNG KẾ HOẠCH CÔNG TÁC]');

  if (!isScheduleTable) {
    return (
      <div className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-800 leading-relaxed select-text">
        {content}
      </div>
    );
  }

  // Parse table rows from markdown
  const lines = content.split('\n');
  const introLines: string[] = [];
  const tableRows: { time: string; task: string; department: string; note: string }[] = [];
  const outroLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---') || trimmed.includes('| Thời gian |')) {
        inTable = true;
        continue;
      }
      const parts = trimmed
        .split('|')
        .slice(1, -1)
        .map((p) => p.trim());
      if (parts.length >= 4) {
        tableRows.push({
          time: parts[0] || '',
          task: parts[1] || '',
          department: parts[2] || '',
          note: parts[3] || '',
        });
      }
    } else {
      if (!inTable) {
        if (!trimmed.includes('[BẢNG KẾ HOẠCH CÔNG TÁC]')) {
          introLines.push(line);
        }
      } else {
        outroLines.push(line);
      }
    }
  }

  return (
    <div className="space-y-4">
      {introLines.length > 0 && (
        <div className="whitespace-pre-wrap text-sm sm:text-base text-slate-800 leading-relaxed">
          {introLines.join('\n')}
        </div>
      )}

      {/* Styled Work Schedule Table */}
      <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-white">
        <div className="bg-gradient-to-r from-[#002B66] to-[#003B8E] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
              LỊCH / KẾ HOẠCH CÔNG TÁC CHI TIẾT
            </span>
          </div>
          <span className="text-[11px] text-amber-200 font-semibold bg-white/10 px-2 py-0.5 rounded">
            {tableRows.length} đầu việc
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-300">
                <th className="py-2.5 px-3 w-32 sm:w-40 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    <span>Thời gian</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200">Nội dung công việc</th>
                <th className="py-2.5 px-3 w-36 sm:w-48 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-700" />
                    <span>Bộ phận / Người thực hiện</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 sm:w-36">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    <span>Ghi chú / Địa điểm</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tableRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-blue-50/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-blue-900 border-r border-slate-200 align-top">
                    {row.time}
                  </td>
                  <td className="py-3 px-3 text-slate-800 leading-relaxed border-r border-slate-200 align-top font-medium">
                    {row.task}
                  </td>
                  <td className="py-3 px-3 text-slate-700 border-r border-slate-200 align-top">
                    <span className="inline-block bg-slate-200/70 text-slate-800 text-xs px-2 py-0.5 rounded font-medium">
                      {row.department}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 align-top text-xs">
                    {row.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {outroLines.length > 0 && (
        <div className="whitespace-pre-wrap text-sm text-slate-700 pt-2">
          {outroLines.join('\n')}
        </div>
      )}
    </div>
  );
};
