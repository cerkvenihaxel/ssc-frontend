import React from 'react';

interface OrderItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface QuotedItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ItemComparisonTableProps {
  originalItems: OrderItem[];
  quotedItems: QuotedItem[];
}

export const ItemComparisonTable: React.FC<ItemComparisonTableProps> = ({
  originalItems,
  quotedItems
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getQuotedItem = (itemId: string) => {
    return quotedItems.find(qi => qi.item_id === itemId);
  };

  const calculateDifference = (original: OrderItem, quoted?: QuotedItem) => {
    if (!quoted) return 0;
    return quoted.total_price - original.total_price;
  };

  const getDifferenceClass = (difference: number) => {
    if (difference > 0) return 'text-red-600 font-semibold';
    if (difference < 0) return 'text-green-600 font-semibold';
    return 'text-gray-500';
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference > 0) return '↗️';
    if (difference < 0) return '↘️';
    return '→';
  };

  return (
    <div className="overflow-x-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Comparación de Items
          </h3>
          <p className="text-sm text-gray-600">
            Comparación entre pedido original y cotización
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Cotizada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cotizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {originalItems.map((item) => {
                const quotedItem = getQuotedItem(item.item_id);
                const difference = calculateDifference(item, quotedItem);
                
                return (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.item_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotedItem?.quantity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotedItem ? formatCurrency(quotedItem.unit_price) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {quotedItem ? formatCurrency(quotedItem.total_price) : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getDifferenceClass(difference)}`}>
                      {difference !== 0 ? (
                        <span className="flex items-center">
                          {getDifferenceIcon(difference)} {formatCurrency(Math.abs(difference))}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 