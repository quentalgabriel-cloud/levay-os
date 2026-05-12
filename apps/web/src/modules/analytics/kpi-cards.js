export function buildKpiCards(data) {
  const consolidated = data?.consolidated || { revenue: 0, conversion: 0, efficiency: 0 };
  return [
    { id: 'revenue', label: 'Receita Consolidada', value: consolidated.revenue },
    { id: 'conversion', label: 'Conversao Media', value: consolidated.conversion },
    { id: 'efficiency', label: 'Eficiencia Media', value: consolidated.efficiency }
  ];
}
