import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton height={30} width={200} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array(columns).fill().map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton height={15} width={80} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows).fill().map((_, i) => (
              <tr key={i} className="border-t">
                {Array(columns).fill().map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton height={20} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Skeleton height={20} width={100} className="mb-2" />
      <Skeleton height={35} width={80} />
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Skeleton height={25} width={150} className="mb-4" />
      <Skeleton height={300} />
    </div>
  );
};